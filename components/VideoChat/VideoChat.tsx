import { RefObject, useEffect, useState } from "react";

import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';

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
    return (
        // <div className="flex flex-col space-y-4">
        //     <div className="flex justify-between items-center mb-4">
        //         <h2 className="text-xl font-semibold">Video Chat</h2>
        //         <div className="flex items-center space-x-2">
        //             <span className={`h-3 w-3 rounded-full ${
        //                 connectionStatus === 'connected' ? 'bg-green-500' :
        //                 connectionStatus === 'connecting' ? 'bg-yellow-500' :
        //                 'bg-red-500'
        //             }`} />
        //             <span className="text-sm">
        //                 {connectionStatus === 'waiting' && (isCaller ? 'Waiting for peer to join...' : 'Joining call...')}
        //                 {connectionStatus === 'connecting' && 'Connecting...'}
        //                 {connectionStatus === 'connected' && 'Connected'}
        //                 {connectionStatus === 'disconnected' && 'Disconnected'}
        //             </span>
        //         </div>
        //     </div>

        //     <div className="grid grid-cols-2 gap-4">
        //         <div className="relative">
        //             <video
        //                 ref={localVideoRef}
        //                 autoPlay
        //                 playsInline
        //                 muted
        //                 className="w-full bg-black rounded"
        //             />
        //             <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
        //                 You
        //             </span>
        //         </div>
        //         <div className="relative">
        //             <video
        //                 ref={remoteVideoRef}
        //                 autoPlay
        //                 playsInline
        //                 className="w-full bg-black rounded"
        //             />
        //             {!peerJoined && (
        //                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
        //                     Waiting for peer...
        //                 </div>
        //             )}
        //             {peerJoined && (
        //                 <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
        //                     Peer
        //                 </span>
        //             )}
        //         </div>
        //     </div>
        // </div>

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
            <div className="flex w-full justify-center gap-2 mt-auto mb-5"> {/* Added margin-top to create space below the video */}
                    <Button>1</Button>
                    <Button>2</Button>
                    <Button>3</Button>
                </div>
        </Card>


    );
}
