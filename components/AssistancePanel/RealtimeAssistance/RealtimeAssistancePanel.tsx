import React, { RefObject, use, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { Lightbulb, RefreshCw, Sparkle, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

type Props = {
    localStream: MediaStream | null;
    remoteAudioStream: MediaStream | null;
}

const RealtimeAssistancePanel = ({ localStream, remoteAudioStream }: Props) => {

    const { protocol } = useAuth();

    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [followUpGenerated, setFollowUpGenerated] = useState(false);

    const peerConnection = useRef<RTCPeerConnection>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const [modelResponse, setModelResponse] = useState("Press the send button to get a summary.");
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [events, setEvents] = useState([]);

    const combinedStreamRef = useRef<MediaStream | null>(null);

    const handleNextQuestion = () => {
        setSelectedQuestion((prev) => Math.min(prev + 1, protocol.length - 1));
        setFollowUpGenerated(false);
    }

    const handleGetFollowUp = () => {
        setFollowUpGenerated(true);
    }


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

    function generateTextResponse() {

        const instructionsPrompt = `The interviewer needs some feedback. 
        Determine whether the question well-asked based on the following criteria:
        1. Was the question open-ended or closed-ended? If it was closed-ended, suggest a better question.
        2. Is it well-phrased and relevant? Suggest a better question if not.
        3. Does it allow the interviewee to discuss their personal expierences?
        Based on these criteria, provide feedback and suggest a better question if needed.
        Keep your response to 10-20 words.
        `

        const message = {
            type: "response.create",

            event_id: crypto.randomUUID(),
            response: {
                modalities: ["text"],
                "max_output_tokens": 32,
                instructions: "What was the last thing that was said?"
            },
        }

        if (dataChannel) {
            dataChannel.send(JSON.stringify(message));
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
            // setEvents((prev) => [message, ...prev]);
        }
    }

    // Attach event listeners to the data channel when a new one is created
    useEffect(() => {
        if (dataChannel) {
            // Append new server events to the list
            dataChannel.addEventListener("message", (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "response.done") {
                    console.log('PARSED RESPONSE', data.response.output[0].content[0].text);
                    setModelResponse(data.response.output[0].content[0].text);
                }
                // setEvents((prev) => [data, ...prev]);
                console.log("EVENT", data);
            });

            // Set session active when the data channel is opened
            dataChannel.addEventListener("open", () => {
                setIsSessionActive(true);
                setEvents([]);
                setSessionConfig();
            });

        }
    }, [dataChannel]);

    return (
        <Card className='h-full pt-4'>
            <CardContent className='h-full flex flex-col gap-2'>

                <Card className='p-4 flex gap-2 items-center justify-start'>
                    <div className='size-2 bg-green-500 rounded-full'></div> 
                    <h3 className='text-lg'>
                        { modelResponse }
                    </h3>
                </Card>
                <Card className='p-4 flex justify-between'>
                    <div className='flex gap-2'>
                        <Button onClick={generateTextResponse}>Test CMD</Button>
                        <Button onClick={handleGetFollowUp}>Generate follow-up</Button>
                        <Button onClick={handleNextQuestion}>Next Question</Button>
                    </div>
                    <div>
                        {isSessionActive ? <Button onClick={stopSession}>Stop AI</Button> : <Button onClick={startSession}>Start AI</Button>}
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
                                    {
                                        (q_index === selectedQuestion && followUpGenerated) &&
                                        (<div className='flex gap-1 justify-start items-center'>
                                            <Checkbox className='size-3' />
                                            <p className='text-sm text-white/60'>Follow-up</p>
                                        </div>)
                                    }

                                </div>
                                <RefreshCw className='hover:scale-110 size-6 hover:cursor-pointer' />
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