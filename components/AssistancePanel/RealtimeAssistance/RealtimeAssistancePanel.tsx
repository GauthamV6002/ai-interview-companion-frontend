import React, { RefObject, use, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { Lightbulb, Pause, Play, RefreshCw, Sparkle, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { TaskResponse } from '@/types/TaskResponse'
import { getFollowUpPrompt, getNextQuestionPrompt, getQuestionFeedbackPrompt, getRephrasePrompt } from '@/lib/openai/promptUtils'

type Props = {
    localStream: MediaStream | null;
    remoteAudioStream: MediaStream | null;
}

const RealtimeAssistancePanel = ({ localStream, remoteAudioStream }: Props) => {

    const { protocol, protocolString } = useAuth();

    const [selectedQuestion, setSelectedQuestion] = useState(0);

    const peerConnection = useRef<RTCPeerConnection>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const [modelResponse, setModelResponse] = useState("Start the session for feedback to show up.");
    const [modelResponseDescription, setModelResponseDescription] = useState("Or press any of the buttons during a session.")
    const [isSessionActive, setIsSessionActive] = useState(false);

    const [feedbackOnCooldown, setFeedbackOnCooldown] = useState(false);
    const FEEDBACK_COOLDOWN = 5000; // in millis

    const combinedStreamRef = useRef<MediaStream | null>(null);

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

        } catch (error) {
            console.error('Error starting OpenAI session:', error);
        }
    }

    // Stop current session, clean up peer connection and data channel
    function stopSession() {
        if (combinedStreamRef.current) {
            combinedStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (dataChannel) {
            dataChannel.close();
        }
        if (peerConnection.current) {
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
                    create_response: false
                }
            },
            event_id: crypto.randomUUID()
        }

        if (dataChannel) {
            dataChannel.send(JSON.stringify(message));
            console.log('SEND SET DATA CONFIG MESSAGE', message);
        }
    }

    function getTaskResponse(prompt : string, maxOutputTokens = 2048) {
        const message = {
            type: "response.create",
            event_id: crypto.randomUUID(),
            response: {
                modalities: ["text"],
                "max_output_tokens": maxOutputTokens,
                instructions: prompt
            },
        }

        if (dataChannel) {
            dataChannel.send(JSON.stringify(message));
        }
    }

    const handleResponseDone = (parsedData : TaskResponse) => {
        switch (parsedData.task) {
            case "feedback":
                if(parsedData.feedback?.toLowerCase() === "none" || parsedData.reason?.toLowerCase() === "none") return;
                if(parsedData.feedback) setModelResponse(parsedData.feedback);
                setModelResponseDescription(parsedData.reason);
                break;

            case "follow-up":
                if(parsedData.follow_up) setModelResponse(`Follow Up: "${parsedData.follow_up}"`);
                setModelResponseDescription(parsedData.reason);
                break;

            case "rephrase":
                if(parsedData.rephrased_question) setModelResponse(parsedData.rephrased_question);
                // TODO: make this change the protocol one too (copy may be needed?)
                setModelResponseDescription(parsedData.reason);
                break;

            case "next-question":
                if(parsedData.next_question_id) {
                    setSelectedQuestion(parsedData.next_question_id);
                    setModelResponse(`Next Question: "${protocol[parsedData.next_question_id].question}"`);
                }
                setModelResponseDescription(parsedData.reason);
                break;

            default:
                console.log("Unknown task type:", parsedData.task);
                break;
        }
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

    const handleRephrase = (question_id : number, question : string) => {
        getTaskResponse(getRephrasePrompt(question));
        console.log("(AI TASK: rephrase) sent; rephrasing: ", question);
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

                    if(!data.response.output[0]) return;
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
                    // TODO: question finished detection
                    handleGetFeedback();
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

    return (
        <Card className='h-full pt-4'>
            <CardContent className='h-full flex flex-col gap-2'>

                <Card className='p-4 flex gap-2 items-center justify-start'>
                    {/* <div className='h-full w-1 bg-green-500 rounded-sm'></div>  */}
                    <div className="flex flex-col">
                        <h3 className='text-base'>
                            { modelResponse }
                        </h3>
                        <div className='w-6 bg-white h-[2px] my-2'></div>
                        <p className='text-sm'>
                            { modelResponseDescription }
                        </p>
                    </div>
                </Card>
                <Card className='p-4 flex justify-between'>
                    <div className='flex gap-2'>
                        {/* <Button onClick={generateTextResponse}>Test CMD</Button> */}
                        <Button onClick={handleGetFollowUp}>Generate follow-up</Button>
                        <Button onClick={handleNextQuestion}>Next Question</Button>
                    </div>
                    <div>
                        {isSessionActive ? <Button onClick={stopSession}> <Pause /> Stop AI</Button> : <Button onClick={startSession}> <Play /> Start AI</Button>}
                    </div>
                </Card>

                <Separator />

                <div className="h-full flex flex-col gap-2 overflow-y-scroll">
                    {
                        protocol.map((question, q_index) => (
                            <Card
                                className='p-3 flex flex-row justify-start items-center gap-2'
                                style={q_index === selectedQuestion ? { borderColor: "red" } : {}}
                                key={q_index}
                            >
                                <div className=" mr-auto">
                                    <p className='text-white/90'>{question.question}</p>
                                    {/* {
                                        (q_index === selectedQuestion) &&
                                        (<div className='flex gap-1 justify-start items-center'>
                                            <Checkbox className='size-3' />
                                            <p className='text-sm text-white/60'>Follow-up</p>
                                        </div>)
                                    } */}

                                </div>
                                <RefreshCw className='hover:scale-110 size-6 hover:cursor-pointer' onClick={() => handleRephrase(q_index, question.question)} />
                                <Checkbox className='size-6' />
                            </Card>
                        ))
                    }
                </div>


            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel
