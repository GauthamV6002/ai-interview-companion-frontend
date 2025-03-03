// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
    const router = useRouter();
    const [roomId, setRoomId] = useState("");

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

                    <Button onClick={() => router.push('/login')}>Login to start a call</Button>

                </CardContent>
            </Card>
        </div>
    );
}
