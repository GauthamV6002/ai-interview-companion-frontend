// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
    const router = useRouter();
    const [roomId, setRoomId] = useState("");

    const handleCreateRoom = async () => {
        // Generate a random room ID
        const newRoomId = Math.random().toString(36).substring(2, 7);
        // Pass a query param (caller=true) to indicate that this user is creating the room
        router.push(`/room/${newRoomId}?caller=true`);
    };

    const handleJoinRoom = async () => {
        if (!roomId.trim()) return;
        router.push(`/room/${roomId.trim()}`);
    };

    return (
        <div className='w-screen h-screen flex justify-center items-center'>
            <Card>
                <CardHeader>
                    <CardTitle className='text-4xl'>Join a call</CardTitle>
                    <CardDescription className='text-lg'>Enter a room ID, or start a new call.</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col gap-2'>
                    <Input onChange={(e) => setRoomId(e.target.value)} placeholder='Room ID'></Input>
                    <Button disabled={!roomId} onClick={handleJoinRoom}>{roomId ? "Join Call" : "Enter a room ID"}</Button>

                    <Separator className="my-4"/>

                    <Button onClick={handleCreateRoom}>Start New Call</Button>

                </CardContent>
            </Card>
        </div>
    );
}
