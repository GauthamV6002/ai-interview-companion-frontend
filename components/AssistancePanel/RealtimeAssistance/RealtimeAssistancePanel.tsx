import React, { RefObject, use, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { Lightbulb, LoaderCircle, Pause, Play, RefreshCw, Sparkle, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { TaskResponse } from '@/types/TaskResponse'
import { getFollowUpPrompt, getNextQuestionPrompt, getQuestionFeedbackPrompt, getRephrasePrompt } from '@/lib/openai/promptUtils'


import { Skeleton } from '@/components/ui/skeleton'
import ResponsePanel from './ResponsePanel'
import ControlsPanel from './ControlsPanel'
import ProtocolPanel from './ProtocolPanel'
import { Protocol } from '@/types/Protocol'

type Props = {
    localStream: MediaStream | null;
    remoteAudioStream: MediaStream | null;
}

const RealtimeAssistancePanel = ({ localStream, remoteAudioStream }: Props) => {

    const { protocol, configurationMode, protocolString } = useAuth();

    // A copy of the protocol to be used for the session, so the original is not modified
    const [sessionProtocol, setSessionProtocol] = useState([...protocol]);

    const [selectedQuestion, setSelectedQuestion] = useState(0);

    const peerConnection = useRef<RTCPeerConnection>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const [modelResponse, setModelResponse] = useState("Start the session for feedback to show up.");
    const [modelResponseDescription, setModelResponseDescription] = useState("Or press any of the buttons during a session.")
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [modelResponseType, setModelResponseType] = useState("feedback");

    const [responseInProgress, setResponseInProgress] = useState(false);

    const combinedStreamRef = useRef<MediaStream | null>(null);

    const [isResponseVisible, setIsResponseVisible] = useState(true);

    const [elapsedTime, setElapsedTime] = useState(0);


    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Function to format time as mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            const model = "gpt-4o-realtime-preview";
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

            // Store audio context for cleanup
            combinedStreamRef.current = destination.stream;

            // Start the timer
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting OpenAI session:', error);
        }
    }



    // Stop current session, clean up peer connection and data channel
    function stopSession() {
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

        console.log('Session closed and cleaned up');
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

    function getTaskResponse(prompt: string, maxOutputTokens = 2048) {

        // Check if a response is alr being generated, if so, wait until it is finished
        // set interval is easy im lazy leave me alone

        console.log('responseInProgess?', responseInProgress)

        const sendResponseSignal = () => {
            setResponseInProgress(true);

            const message = {
                type: "response.create",
                event_id: crypto.randomUUID(),
                response: {
                    modalities: ["text"],
                    // "max_output_tokens": maxOutputTokens,
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

    const handleResponseDone = (parsedData: TaskResponse) => {
        setIsResponseVisible(false); // Hide first
        setTimeout(() => {
            setResponseInProgress(false);
            
            switch (parsedData.task) {
                case "feedback":
                    if (parsedData.feedback?.toLowerCase() === "none" || parsedData.reason?.toLowerCase() === "none") return;
                    if (parsedData.feedback) setModelResponse(parsedData.feedback);
                    setModelResponseDescription(parsedData.reason);
                    break;

                case "follow-up":
                    if (parsedData.follow_up) setModelResponse(`Follow Up: "${parsedData.follow_up}"`);
                    setModelResponseDescription(parsedData.reason);
                    break;

                case "rephrase":
                    if (parsedData.rephrased_question) setModelResponse(`Rephrased Question: ${parsedData.rephrased_question}`);
                    setModelResponseDescription(parsedData.reason);
                    
                    setSessionProtocol((sessionProtocol.map((question, index) => index === selectedQuestion ? { ...question, question: parsedData.rephrased_question } : question)) as Protocol);
                    break;

                case "next-question":
                    if (parsedData.next_question_id) {
                        setSelectedQuestion(parsedData.next_question_id);
                        setModelResponse(`Next Question: "${sessionProtocol[parsedData.next_question_id].question}"`);
                    }
                    setModelResponseDescription(parsedData.reason);
                    break;

                default:
                    console.log("Unknown task type:", parsedData.task);
                    break;
            }

            setModelResponseType(parsedData.task);
            // Show the response with animation
            setIsResponseVisible(true);
        }, 100); // Small delay to ensure state updates properly
    }


    // CLIENT SIDE AI RESPONSE TRIGGERS

    const handleGetFeedback = () => {
        getTaskResponse(getQuestionFeedbackPrompt());
        console.log("(AI TASK: feedback) sent");
    }

    const handleGetFollowUp = () => {
        getTaskResponse(getFollowUpPrompt());
        console.log("(AI TASK: follow-up) sent");
    }

    const handleRephrase = (question_id: number, question: string) => {
        getTaskResponse(getRephrasePrompt(question));
        console.log("(AI TASK: rephrase) sent; rephrasing: ", question);
        setSessionProtocol((sessionProtocol.map((q, index) => index === question_id ? { ...q, question: question } : q)) as Protocol);
    }

    const handleNextQuestion = () => {
        getTaskResponse(getNextQuestionPrompt(protocolString));
        console.log("(AI TASK: next-question) sent, protocol:", protocolString);
    }

    // Attach event listeners to the data channel when a new one is created
    useEffect(() => {
        if (dataChannel) {
            // Append new server events to the list
            dataChannel.addEventListener("message", (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "response.done") {

                    if (!data.response.output[0]) return;
                    console.log('PARSED RESPONSE', data.response.output[0].content[0].text);

                    try {
                        const parsedData = JSON.parse(data.response.output[0].content[0].text) as TaskResponse;
                        handleResponseDone(parsedData);
                    } catch (err) {
                        // Catches edge cases like cancellations due to interuptions
                        console.log("ERROR: Parsing model response failed. Recieved:", data.response.output[0].content[0].text);
                        console.log(err)
                    }

                }

                if (data.type === "input_audio_buffer.committed") {
                    // Someone finished talking
                    if (configurationMode === "responsive" || configurationMode === "full") handleGetFeedback();
                }

                console.log("EVENT", data);
            });

            // Set session active when the data channel is opened
            dataChannel.addEventListener("open", () => {
                setIsSessionActive(true);
                setSessionConfig();
            });

        }
    }, [dataChannel]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
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

                {(configurationMode !== "none" && configurationMode !== "post") && <ResponsePanel responseInProgress={responseInProgress} modelResponseType={modelResponseType}  modelResponse={modelResponse} modelResponseDescription={modelResponseDescription} />}
                {(configurationMode !== "none" && configurationMode !== "post") && <ControlsPanel 
                    configurationMode={configurationMode} 
                    isSessionActive={isSessionActive} 
                    responseInProgress={responseInProgress} 
                    handleGetFollowUp={handleGetFollowUp} 
                    handleNextQuestion={handleNextQuestion} 
                    stopSession={stopSession} 
                    startSession={startSession}
                    elapsedTime={formatTime(elapsedTime)}
                />}

                <Separator />

                <ProtocolPanel sessionProtocol={sessionProtocol} selectedQuestion={selectedQuestion} setSelectedQuestion={setSelectedQuestion} configurationMode={configurationMode} handleRephrase={handleRephrase} />


            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel
