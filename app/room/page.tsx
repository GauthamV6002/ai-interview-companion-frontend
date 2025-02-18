// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = async () => {
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 15);
    // Pass a query param (caller=true) to indicate that this user is creating the room
    router.push(`/room/${newRoomId}?caller=true`);
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;
    router.push(`/room/${roomId.trim()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Peer‑to‑Peer Video Chat</h1>
      <button
        onClick={handleCreateRoom}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded mb-6"
      >
        Create Room
      </button>
      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 rounded mb-4 w-64"
        />
        <button
          onClick={handleJoinRoom}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
