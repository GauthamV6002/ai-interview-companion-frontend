import { RefObject, useEffect, useState } from "react";

import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';


import { Copy, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from "../ui/button";

interface VideoChatProps {
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
    peerJoined: boolean;
    connectionStatus: string;
    isCaller: boolean;
    roomId: string;
    onEndCall: () => void;
    peerConnection: RTCPeerConnection | null;
    isAIActive?: boolean;
}

export default function VideoChat({
    localVideoRef,
    remoteVideoRef,
    peerJoined,
    connectionStatus,
    isCaller,
    roomId,
    onEndCall,
    peerConnection,
    isAIActive = false
}: VideoChatProps) {

    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const toggleAudio = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const handleEndCall = async () => {
        // Stop all tracks in local stream
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        // Stop all tracks in remote stream
        if (remoteVideoRef.current?.srcObject) {
            const stream = remoteVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnection) {
            // Remove all tracks before closing
            peerConnection.getSenders().forEach((sender) => {
                if (sender.track) {
                    sender.track.stop();
                }
                peerConnection.removeTrack(sender);
            });
            peerConnection.close();
        }

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        onEndCall();
    };

    return (

        <Card className='h-full flex-col flex'>
            {/* TODO: Remove red & white outlines */}
            <CardHeader>
                <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                        <h3>Room ID: {roomId}</h3>
                        {/* TODO: Change localhost url to prod url */}
                        <Copy size={15} className="hover:scale-125 transition-all cursor-pointer" color="white" onClick={() => navigator.clipboard.writeText(`https://ai-interview-companion.vercel.app/room/${roomId}`)}/>
                    </div>
                    <div className="flex gap-2 items-center">
                        { peerJoined ? <div className="size-2 bg-green-500 rounded-full"></div> : <div className="size-2 bg-yellow-500 rounded-full"></div> }
                        { peerJoined ? <p>Peer Joined</p> : <p>Waiting for peer...</p> }

                    </div>

                </div>
            </CardHeader>
            <CardContent className="">
                <div className="relative"> {/* Set a height for the container */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="rounded-2xl absolute w-full right-[50%] translate-x-[50%] border-white border-4"
                    />
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-2xl absolute border-red-500 border-4 w-[25%] right-[2%] translate-x-[2%] top-2"
                    />
                </div>
            </CardContent>
            <div className="flex w-full justify-center gap-4 mt-auto mb-3"> {/* Added margin-top to create space below the video */}
                <Button
                    variant={isAudioEnabled ? "default" : "destructive"}
                    onClick={toggleAudio}
                    className="rounded-full p-1 h-12 w-12"
                >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>

                <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    onClick={toggleVideo}
                    className="rounded-full p-1 h-12 w-12"
                >
                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </Button>

                <Button
                    variant="destructive"
                    onClick={handleEndCall}
                    className="rounded-full p-1 h-12 w-12"
                    disabled={isAIActive}
                    title={isAIActive ? "You must stop the AI first" : ""}
                >
                    <PhoneOff size={20} />
                </Button>
            </div>
        </Card>


    );
}
