import { RefObject, useEffect, useState } from "react";

import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';


import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from "../ui/button";

interface VideoChatProps {
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
    peerJoined: boolean;
    connectionStatus: string;
    isCaller: boolean;
    roomId: string;
}

export default function VideoChat({
    localVideoRef,
    remoteVideoRef,
    peerJoined,
    connectionStatus,
    isCaller,
    roomId
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

    return (

        <Card className='h-full flex-col flex'>
            <CardHeader>
                <CardTitle>Room ID: {roomId}</CardTitle>
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
            <div className="flex w-full justify-center gap-4 mt-auto mb-4"> {/* Added margin-top to create space below the video */}
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
            </div>
        </Card>


    );
}
