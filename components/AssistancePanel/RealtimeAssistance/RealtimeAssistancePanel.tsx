import React, { RefObject, use, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'


import { ConfigurationMode, useAuth } from '@/context/AuthContext'

import { Separator } from '@/components/ui/separator'
import { FeedbackResponse, AnalysisResponse, FollowUpResponse, RephraseResponse, TaskType, ModelResponse } from '@/types/TaskResponse'
import { AIEvent } from '@/types/Transcript'
import { getSystemPrompt, getAIFeedbackPrompt, getNextStepPrompt, getEvaluationPrompt, getAIAnalysisPrompt } from '../../../lib/openai/promptUtils'


import { Skeleton } from '@/components/ui/skeleton'
import ControlsPanel from './ControlsPanel'
import ProtocolPanel from './ProtocolPanel'
import { Protocol } from '@/types/Protocol'
import { useTranscriptLog } from '@/context/TranscriptLogContext'
import { useSearchParams } from 'next/navigation'

type Props = {
    localStream: MediaStream | null;
    remoteAudioStream: MediaStream | null;
    mixedAudioStream: MediaStream | null;
    onShowInstructions: () => void;
}

// Helper function to convert time string (mm:ss) to seconds
const timeStringToSeconds = (timeString: string) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
};

// Function to format time as mm:ss
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Add type definition for TaskResponse
type TaskResponse = {
    type: "feedback" | "analysis" | "follow-up" | "rephrase";
    summary?: string[];
    informationGap?: string | string[];
    followUp?: string;
}

const RealtimeAssistancePanel = ({ localStream, remoteAudioStream, mixedAudioStream, onShowInstructions }: Props) => {

    const { protocol, configurationMode, setConfigurationMode, protocolString } = useAuth();
    const { transcript, elapsedTime, setTranscript, setElapsedTime, addAudioBlob } = useTranscriptLog();

    // A copy of the protocol to be used for the session, so the original is not modified
    const [sessionProtocol, setSessionProtocol] = useState([...protocol]);
    const [selectedQuestion, setSelectedQuestion] = useState(0);
    // Create a ref to always track the latest selectedQuestion value
    const selectedQuestionRef = useRef<number>(0);
    // Replace state with ref for immediate access
    const pauseStartTimeRef = useRef<number | null>(null);

    // Add a ref to track session start time
    const sessionStartTimeRef = useRef<number | null>(null);

    const [isSessionActive, setIsSessionActive] = useState(false);
    const peerConnection = useRef<RTCPeerConnection>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const combinedStreamRef = useRef<MediaStream | null>(null);


    const [modelResponses, setModelResponses] = useState<ModelResponse[]>([]);
    const [responseInProgress, setResponseInProgress] = useState(false);
    const [responseInProgressId, setResponseInProgressId] = useState<string | null>(null);
    const analysisQuestionIndexRef = useRef<number | null>(null);
    const feedbackQuestionIndexRef = useRef<number | null>(null);


    // Audio recording references
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<string>('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);



    const searchParams = useSearchParams();
    useEffect(() => {
        const mode = searchParams.get("mode");
        if (mode) setConfigurationMode(mode as ConfigurationMode);
    }, []);

    // Function to start recording audio
    const startRecording = () => {
        if (!mixedAudioStream) {
            console.error('No mixed audio stream available for recording');
            return;
        }

        recordedChunksRef.current = [];
        recordingStartTimeRef.current = formatTime(elapsedTime);

        try {
            // Try to use audio/webm with opus codec for better quality
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000 // 128 kbps for good quality
            };

            // Fallback if the preferred format is not supported
            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(mixedAudioStream, options);
            } catch (e) {
                console.warn('audio/webm;codecs=opus not supported, falling back to default format');
                mediaRecorder = new MediaRecorder(mixedAudioStream);
            }

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Start recording and request data every second
            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);

            // Add recording started event to transcript
            // setTranscript(t => [...t, {
            //     timestamp: formatTime(elapsedTime),
            //     aiEvent: "recording-started" as any,
            //     aiEventData: `Recording started at ${formatTime(elapsedTime)}`
            // }]);

            console.log('Recording started with timeslice of 1000ms');
        } catch (err) {
            console.error('Error starting recording:', err);
        }
    };

    // Function to stop recording and save the audio to context
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            // Store the current time before stopping
            const stopTime = formatTime(elapsedTime);

            // Define a callback to run when the recorder stops
            mediaRecorderRef.current.onstop = () => {
                if (recordedChunksRef.current.length === 0) {
                    console.log('No recorded data available');
                    return;
                }

                try {
                    // Create a blob from the recorded chunks
                    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });

                    // Add the blob to the context
                    addAudioBlob(blob);

                    // Add recording stopped event to transcript
                    // setTranscript(t => [...t, {
                    //     timestamp: stopTime,
                    //     aiEvent: "recording-stopped" as any,
                    //     aiEventData: JSON.stringify({
                    //         startTime: recordingStartTimeRef.current,
                    //         stopTime: stopTime,
                    //         duration: `${formatTime(elapsedTime - timeStringToSeconds(recordingStartTimeRef.current))}`,
                    //         blobIndex: transcript.filter(item => item.aiEvent === "recording-stopped").length
                    //     })
                    // }]);

                    console.log('Recording saved to context');
                } catch (err) {
                    console.error('Error saving recording to context:', err);
                }
            };

            // Stop the recorder
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log('Recording stopped');
        }
    };

    async function startSession() {
        try {

            // Get ephemeral key
            const tokenResponse = await fetch("/api/session", {
                mode: 'cors',
                headers: {
                    "Access-Control-Allow-Origin": "*",
                }
            });
            const data = await tokenResponse.json();
            const EPHEMERAL_KEY = data.client_secret.value;

            // Create a peer connection
            const pc = new RTCPeerConnection();

            // Create Audio Context for mixing
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();

            // Add local audio to the mix
            if (localStream) {
                const localSource = audioContext.createMediaStreamSource(localStream);
                localSource.connect(destination);
                console.log('Added local audio to mix');
            } else {
                console.log('ERROR: localStream is null');
            }

            // Add remote audio to the mix
            if (remoteAudioStream) {
                const remoteSource = audioContext.createMediaStreamSource(remoteAudioStream);
                remoteSource.connect(destination);
                console.log('Added remote audio to mix');
            } else {
                console.log('ERROR: remoteAudioStream is null');
            }

            // Get the mixed audio track
            const mixedTrack = destination.stream.getAudioTracks()[0];
            console.log('Created mixed audio track:', mixedTrack.label);

            // Add the mixed track to the peer connection
            pc.addTrack(mixedTrack);

            // Set up data channel
            const dc = pc.createDataChannel("oai-events");
            setDataChannel(dc);

            // Create and set local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Connect to OpenAI
            const baseUrl = "https://api.openai.com/v1/realtime";
            // const model = "gpt-4o-realtime-preview";
            const model = "gpt-4o-mini-realtime-preview";
            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    "Content-Type": "application/sdp",
                    "Access-Control-Allow-Origin": "*",
                },
            });

            const answer: RTCSessionDescriptionInit = {
                type: "answer",
                sdp: await sdpResponse.text(),
            };
            await pc.setRemoteDescription(answer);

            peerConnection.current = pc;
            console.log('OpenAI session started successfully');

            // setTranscript(t => [...t, {
            //     timestamp: formatTime(elapsedTime),
            //     aiEvent: "start-ai",
            // }]);

            // Store audio context for cleanup
            combinedStreamRef.current = destination.stream;

            // Start recording audio
            startRecording();

            // Record the session start time
            sessionStartTimeRef.current = Date.now();

            // Start the timer
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting OpenAI session:', error);
        }
    }

    // Stop current session, clean up peer connection and data channel
    function stopSession() {
        // Stop recording
        stopRecording();

        // Clear the timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Clean up audio streams
        if (combinedStreamRef.current) {
            combinedStreamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
        }

        // Clean up data channel
        if (dataChannel) {
            dataChannel.close();
        }

        // Clean up peer connection
        if (peerConnection.current) {
            // Remove all tracks before closing
            peerConnection.current.getSenders().forEach((sender) => {
                if (sender.track) {
                    sender.track.stop();
                    sender.track.enabled = false;
                }
                peerConnection.current?.removeTrack(sender);
            });
            peerConnection.current.close();
        }

        setIsSessionActive(false);
        setDataChannel(null);
        peerConnection.current = null;
        combinedStreamRef.current = null;

        // setTranscript(t => [...t, {
        //     timestamp: formatTime(elapsedTime),
        //     aiEvent: "stop-ai",
        // }]);

        console.log('Session closed and cleaned up');

        // Reset the session start time
        sessionStartTimeRef.current = null;
    }

    function setSessionConfig() {
        const message = {
            type: "session.update",
            session: {
                instructions: "You are a third-party expert interviewer who is listening in on an interview between an interviwer and interviewee. Your job is the provide feedback or information to the interviewer when they need it.",
                turn_detection: {
                    type: "server_vad",
                    create_response: false,
                    interrupt_response: false,
                },
            },
            event_id: crypto.randomUUID()
        }

        if (dataChannel) {
            dataChannel.send(JSON.stringify(message));
            console.log('SEND SET DATA CONFIG MESSAGE', message);
        }
    }

    function getTaskResponse(prompt: string, task: TaskType) {

        // Check if a response is alr being generated, if so, wait until it is finished

        console.log('responseInProgess?', responseInProgress)

        const sendResponseSignal = () => {
            setResponseInProgress(true);

            const responseId = crypto.randomUUID();
            setResponseInProgressId(responseId);

            const message = {
                type: "response.create",
                event_id: crypto.randomUUID(),
                response: {
                    modalities: ["text"],
                    metadata: {
                        task: task,
                        response_id: responseId
                    },
                    instructions: prompt
                },
            }

            if (dataChannel) {
                dataChannel.send(JSON.stringify(message));
            }
        }

        if (!responseInProgress) {
            sendResponseSignal();
        } else {
            const interval = setInterval(() => {
                if (!responseInProgress) {
                    sendResponseSignal();
                    clearInterval(interval);
                }
            }, 20);
        }
    }

    const handleResponseDone = (data: any) => {
        if (!data.response.output[0]) {
            setResponseInProgress(false);
            setResponseInProgressId(null);
            console.log('No response output found, reverting');
            return;
        }

        console.log('PARSED RESPONSE', data.response.output[0].content[0].text);
        console.log('Current selectedQuestion:', selectedQuestion);
        console.log('Current analysisQuestionIndexRef:', analysisQuestionIndexRef.current);
        console.log('Current feedbackQuestionIndexRef:', feedbackQuestionIndexRef.current);

        try {
            const responseString = data.response.output[0].content[0].text;
            setTimeout(() => { setResponseInProgress(false) }, 100);

            if (!data.response.metadata) {
                console.log("ERROR: No metadata found in response");
                return;
            }

            // Skip if response is "none" for any task type
            if (responseString.toLowerCase().includes("none")) {
                console.log("Response is 'none', skipping");
                return;
            }

            // Get the target question index based on the task type
            const targetQuestionIndex = data.response.metadata?.task === "feedback" 
                ? feedbackQuestionIndexRef.current 
                : analysisQuestionIndexRef.current;

            if (targetQuestionIndex === null) {
                console.error("No question index stored for response");
                return;
            }

            // Remove the automatic selectedQuestion update
            // setSelectedQuestion(targetQuestionIndex);

            switch (data.response.metadata?.task) {
                case "feedback":
                    try {
                        const feedbackResponse = JSON.parse(responseString) as FeedbackResponse;
                        console.log('Processing feedback response for question index:', targetQuestionIndex);

                        // Handle empty information gap
                        const informationGap = !feedbackResponse.informationGap || feedbackResponse.informationGap.length === 0
                            ? configurationMode === "interactive"
                                ? ["No information gap identified, proceed to the next protocol questions"]
                                : ["No information gap identified"]
                            : Array.isArray(feedbackResponse.informationGap) 
                                ? feedbackResponse.informationGap 
                                : [feedbackResponse.informationGap];
                        
                        // Update the sessionProtocol with the feedback for the stored question index
                        setSessionProtocol(prev => {
                            console.log('Updating sessionProtocol for question index:', targetQuestionIndex);
                            return prev.map((q, index) => {
                                console.log('Processing question index:', index, 'target index:', targetQuestionIndex);
                                return index === targetQuestionIndex 
                                    ? { 
                                        ...q, 
                                        feedback: {
                                            summary: q.feedback 
                                                ? [...q.feedback.summary, ...(feedbackResponse.summary || [])]
                                                : (feedbackResponse.summary || []),
                                            informationGap: informationGap,
                                            followUp: feedbackResponse.followUp || ""
                                        } 
                                    } 
                                    : q;
                            });
                        });
                        // Reset the stored index
                        feedbackQuestionIndexRef.current = null;
                    } catch (error) {
                        console.error("Error parsing feedback response:", error);
                    }
                    break;

                case "analysis":
                    try {
                        const analysisResponse = JSON.parse(responseString) as AnalysisResponse;
                        console.log('Processing analysis response for question index:', targetQuestionIndex);
                        
                        // Handle empty information gap for analysis
                        const analysisInformationGap = !analysisResponse.informationGap || analysisResponse.informationGap.length === 0
                            ? ["No information gap identified"]
                            : Array.isArray(analysisResponse.informationGap) 
                                ? analysisResponse.informationGap 
                                : [analysisResponse.informationGap];
                        
                        // Update the sessionProtocol with the analysis feedback for the stored question index
                        setSessionProtocol(prev => {
                            console.log('Updating sessionProtocol for question index:', targetQuestionIndex);
                            return prev.map((q, index) => {
                                console.log('Processing question index:', index, 'target index:', targetQuestionIndex);
                                return index === targetQuestionIndex 
                                    ? { 
                                        ...q, 
                                        feedback: {
                                            summary: q.feedback 
                                                ? [...q.feedback.summary, ...(analysisResponse.summary || [])]
                                                : (analysisResponse.summary || []),
                                            informationGap: analysisInformationGap,
                                            followUp: analysisResponse.followUp || ""
                                        } 
                                    } 
                                    : q;
                            });
                        });
                        
                        console.log("Analysis response added to question:", targetQuestionIndex);
                        // Reset the stored index
                        analysisQuestionIndexRef.current = null;
                    } catch (err) {
                        console.error("Error parsing analysis response:", err);
                    }
                    break;

                case "follow-up":
                    setModelResponses(prev => [...prev, {
                        task: "follow-up",
                        response: responseString as FollowUpResponse,
                    }]);
                    break;

                case "rephrase":
                    setModelResponses(prev => [...prev, {
                        task: "rephrase",
                        response: responseString as RephraseResponse,
                    }]);
                    break;

                default:
                    console.log("Unknown task type: ", data.response.metadata?.task);
                    break;
            }

            addTranscriptAIResponseEvent(data.response.metadata?.task, responseString);

        } catch (err) {
            // Catches edge cases like cancellations due to interuptions
            console.log("ERROR: Parsing model response failed. Recieved:", data.response.output[0].content[0].text);
            console.log(err)
        }
    };

    const addTranscriptAIResponseEvent = (task: AIEvent, responseString: string) => {
        // Calculate the actual elapsed time since session start
        const actualElapsedTime = sessionStartTimeRef.current
            ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
            : elapsedTime;

        console.log('Adding RESPONSE transcript event at actual time: ', actualElapsedTime);
        setTranscript(t => [...t, {
            timestamp: formatTime(actualElapsedTime),
            aiEvent: task,
            aiEventDirection: "response",
            aiEventData: responseString,
        }]);
    }

    // CLIENT SIDE AI RESPONSE TRIGGERS

    const addTranscriptAIAskEvent = (task: AIEvent) => {
        // Calculate the actual elapsed time since session start
        const actualElapsedTime = sessionStartTimeRef.current
            ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
            : elapsedTime;

        console.log('Adding ASK transcript event at actual time: ', actualElapsedTime);
        setTranscript(t => [...t, {
            timestamp: formatTime(actualElapsedTime),
            aiEvent: task,
            aiEventDirection: "ask",
        }]);
    }

    const addTranscriptSpeechEvent = (text: string) => {
        // Calculate the actual elapsed time since session start
        const actualElapsedTime = sessionStartTimeRef.current
            ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
            : elapsedTime;

        console.log('Adding ASK transcript event at actual time: ', actualElapsedTime);
        setTranscript(t => [...t, {
            timestamp: formatTime(actualElapsedTime),
            text: text,
            speaker: "interviewee", // TODO: Change to speaker
        }]);
    }

    const addTranscriptPauseEvent = (duration: number) => {
        // Calculate the actual elapsed time since session start
        const actualElapsedTime = sessionStartTimeRef.current
            ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
            : elapsedTime;

        console.log('Adding PAUSE transcript event at actual time: ', actualElapsedTime, 'with duration: ', duration);
        setTranscript(t => [...t, {
            timestamp: formatTime(actualElapsedTime),
            pauseDuration: duration,
        }]);
    }

    // Update selectedQuestionRef whenever selectedQuestion changes
    useEffect(() => {
        selectedQuestionRef.current = selectedQuestion;
        console.log('selectedQuestionRef updated to:', selectedQuestion);
    }, [selectedQuestion]);

    const handleGetFeedback = () => {
        // Use the ref value instead of the state value to get the most current selection
        const currentSelectedQuestion = selectedQuestionRef.current;
        // Store the current question index for feedback
        feedbackQuestionIndexRef.current = currentSelectedQuestion;
        console.log('Setting feedbackQuestionIndexRef to:', currentSelectedQuestion);
        
        // Get the current question text
        const currentQuestion = sessionProtocol[currentSelectedQuestion].question;
        console.log("Getting feedback for question:", currentSelectedQuestion, "currentQuestion:", currentQuestion);
        
        // Get existing feedback summary if available, otherwise empty string
        const currentInformation = sessionProtocol[currentSelectedQuestion].feedback 
            ? sessionProtocol[currentSelectedQuestion].feedback.summary.join(", ") 
            : "";
          
        // Use the feedback prompt to get feedback focused on the current question
        getTaskResponse(getAIFeedbackPrompt(protocolString, currentQuestion, currentInformation), "feedback");
        
        console.log("(AI TASK: feedback) sent for question:", currentQuestion);
        addTranscriptAIAskEvent("feedback");
    }

    const handleGetAnalysis = () => {
        // Use the ref value instead of the state value
        const currentSelectedQuestion = selectedQuestionRef.current;
        // Store the current question index for analysis
        analysisQuestionIndexRef.current = currentSelectedQuestion;
        console.log('Setting analysisQuestionIndexRef to:', currentSelectedQuestion);
        
        // Get the current question text
        const currentQuestion = sessionProtocol[currentSelectedQuestion].question;
        
        // Get existing feedback summary if available, otherwise empty string
        const currentInformation = sessionProtocol[currentSelectedQuestion].feedback 
            ? sessionProtocol[currentSelectedQuestion].feedback.summary.join(", ") 
            : "";
        
        console.log("Give Me Analysis clicked - selectedQuestion:", currentSelectedQuestion, "currentQuestion:", currentQuestion);
        
        // Use the analysis prompt to get feedback focused on the current question
        getTaskResponse(getAIAnalysisPrompt(protocolString, currentQuestion, currentInformation), "analysis");
        
        console.log("(AI TASK: analysis) sent for question:", currentQuestion);
        addTranscriptAIAskEvent("analysis");
    }

    const handleGetFollowUp = () => {
        getTaskResponse(getNextStepPrompt(), "follow-up");
        console.log("(AI TASK: follow-up) sent");
    }

    const handleRephrase = (question_id: number, question: string) => {
        getTaskResponse(getEvaluationPrompt(question), "rephrase");
        console.log("(AI TASK: rephrase) sent; rephrasing: ", question);
        setSessionProtocol((sessionProtocol.map((q, index) => index === question_id ? { ...q, question: question } : q)) as Protocol);
        // addTranscriptAIAskEvent("rephrase");
    }

    // Attach event listeners to the data channel when a new one is created
    useEffect(() => {
        if (dataChannel) {
            // Append new server events to the list
            dataChannel.addEventListener("message", (e) => {
                const data = JSON.parse(e.data);

                if (data.type === "response.done") {
                    console.log('Response received, current selectedQuestion:', selectedQuestion);
                    handleResponseDone(data);
                }

                if (data.type === "input_audio_buffer.committed") {
                    if (configurationMode === "responsive" || configurationMode === "full") {
                        // Don't set the feedback question index here since we'll use the ref in handleGetFeedback
                        console.log('Auto-triggering feedback for current question:', selectedQuestionRef.current);
                        handleGetFeedback();
                    }
                }

                if (data.type === "conversation.item.input_audio_transcription.completed") {
                    console.log("TRANSCRIPTION DONE", data);
                    addTranscriptSpeechEvent(data.transcript);
                }


                if (data.type === "input_audio_buffer.speech_started") {
                    // STOP THE PAUSE TIMER & ADD PAUSE DURATION AS A NEW TRANSCRIPT EVENT
                    console.log('PAUSE START TIME', pauseStartTimeRef.current);
                    if (pauseStartTimeRef.current !== null) {
                        const pauseDuration = Date.now() - pauseStartTimeRef.current;
                        const pauseDurationInSeconds = Math.round(pauseDuration / 1000);
                        console.log('PAUSE DURATION', pauseDuration, 'ms,', pauseDurationInSeconds, 'seconds');
                        // Only add pause event if the pause was significant (e.g., more than 0.5 seconds)
                        if (pauseDuration > 500) {
                            addTranscriptPauseEvent(pauseDuration);
                        }
                        // Reset the pause timer
                        pauseStartTimeRef.current = null;
                    }
                }

                if (data.type === "input_audio_buffer.speech_stopped") {
                    // START THE PAUSE TIMER
                    const currentTime = Date.now();
                    pauseStartTimeRef.current = currentTime;
                    console.log('PAUSE START TIME SET TO', currentTime);
                }

                // Delta events are too verbose, so we only log the non-delta events
                if(data.type !== "response.text.delta") console.log("EVENT", data);
            });

            // Set session active when the data channel is opened
            dataChannel.addEventListener("open", () => {
                setIsSessionActive(true);
                setSessionConfig();
            });

        }
    }, [dataChannel]);

    // Cleanup timer and recording on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        const handleFollowUp = () => {
            getTaskResponse(getNextStepPrompt(), "follow-up");
            console.log("(AI TASK: follow-up) sent");
        };

        window.addEventListener('getFollowUp', handleFollowUp);
        return () => {
            window.removeEventListener('getFollowUp', handleFollowUp);
        };
    }, []);

    return (
        <Card className='h-full'>

            {
                configurationMode === "none" &&
                <CardHeader>
                    <CardTitle className='text-2xl'>Protocol</CardTitle>
                </CardHeader>
            }
            <CardContent className='h-full flex flex-col gap-2'>

                {(configurationMode !== "none" && configurationMode !== "post") && <ControlsPanel
                    configurationMode={configurationMode}
                    isSessionActive={isSessionActive}
                    responseInProgress={responseInProgress}
                    handleGetAnalysis={handleGetAnalysis}
                    stopSession={stopSession}
                    startSession={startSession}
                    elapsedTime={formatTime(elapsedTime)}
                    onShowInstructions={onShowInstructions}
                    isRecording={isRecording}
                />}

                <Separator />

                <ProtocolPanel 
                    sessionProtocol={sessionProtocol} 
                    selectedQuestion={selectedQuestion} 
                    setSelectedQuestion={setSelectedQuestion} 
                    configurationMode={configurationMode} 
                />

            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel
