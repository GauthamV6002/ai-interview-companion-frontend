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
    remoteAudioTrackRef: RefObject<MediaStreamTrack | null>
}

const RealtimeAssistancePanel = ({ remoteAudioTrackRef }: Props) => {

    const { protocol } = useAuth();

    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [followUpGenerated, setFollowUpGenerated] = useState(false);

    const peerConnection = useRef<RTCPeerConnection>(null);
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const [modelResponse, setModelResponse] = useState("Press the send button to get a summary.");
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [events, setEvents] = useState([]);

    const handleNextQuestion = () => {
        setSelectedQuestion((prev) => Math.min(prev + 1, protocol.length - 1));
        setFollowUpGenerated(false);
    }

    const handleGetFollowUp = () => {
        setFollowUpGenerated(true);
    }


    async function startSession() {
        // Get an ephemeral key from api route
        const tokenResponse = await fetch("/api/session", {
            mode: 'cors',
            headers: {
                "Access-Control-Allow-Origin": "*",
            }
        });
        const data = await tokenResponse.json();
        console.log(data)
        const EPHEMERAL_KEY = data.client_secret.value;
        console.log(EPHEMERAL_KEY);


        // Create a peer connection
        const pc = new RTCPeerConnection();

        // Set up to play remote audio from the model
        // audioElement.current = document.createElement("audio");
        // audioElement.current.autoplay = true;
        // pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

        // Add local audio track for microphone input in the browser
        const ms = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        pc.addTrack(ms.getTracks()[0]);

        // Add remote audio as well
        if(remoteAudioTrackRef.current) {
            const audioTrack = remoteAudioTrackRef.current as MediaStreamTrack;
            // console.log(stream);
            // const audioTrack = stream.getAudioTracks()[0];
            console.log(audioTrack);
            pc.addTrack(audioTrack);
        } else {
            console.log("ERROR: remoteVideoRef.current is null, cannot add remote track to oai data channel");
        }


        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        setDataChannel(dc);

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${EPHEMERAL_KEY}`,
                "Content-Type": "application/sdp",
                "Access-Control-Allow-Origin": "*", // Allow all origins
            },
        });

        const answer: RTCSessionDescriptionInit = {
            type: "answer",
            sdp: await sdpResponse.text(),
        };
        await pc.setRemoteDescription(answer);

        peerConnection.current = pc;

        console.log('OPEN SESSION');
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
        if (dataChannel) {
            dataChannel.close();
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        setIsSessionActive(false);
        setDataChannel(null);
        peerConnection.current = null;

        console.log('CLOSE DATA CHANNEL');
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