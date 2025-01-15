"use client"
import React from "react";

import VideoChat from "@/components/VideoChat/VideoChat";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import RealtimeAssistancePanel from "@/components/AssistancePanel/RealtimeAssistance/RealtimeAssistancePanel";
import ProtocolPanel from "@/components/AssistancePanel/PostInterviewAssistance/ProtocolPanel";

export default function App() {

    const { configurationMode, participantID, setConfigurationMode, setParticipantID } = useAuth();

    const router = useRouter();

    React.useEffect(() => {
        if (participantID === 0) {
            // Not using next router in order to reset camera-related state
            window.location.href = "/login";
            // router.push("/")
        }
    }, []);

    return (
        <div className="p-4 h-screen flex items-center gap-8">
            <div className="w-1/2 h-[90vh]">
                <VideoChat />
            </div>

            <div className="w-1/2 h-[90vh]">
                {(configurationMode === "mode_a") ? <ProtocolPanel /> : <RealtimeAssistancePanel />}
            </div>
        </div>
    );
}