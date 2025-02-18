"use client"
import React, { useState } from "react";

// import VideoChat from "@/components/VideoChat/VideoChat";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import RealtimeAssistancePanel from "@/components/AssistancePanel/RealtimeAssistance/RealtimeAssistancePanel";
import ProtocolPanel from "@/components/AssistancePanel/PostInterviewAssistance/ProtocolPanel";

// TODO: FIX

export default function App() {

    const { configurationMode, participantID, setConfigurationMode, setParticipantID } = useAuth();
    const [transcript, setTranscript] = useState<string>("");
    

    const router = useRouter();

    React.useEffect(() => {
        // if (participantID === 12345 || !configurationMode) {
        //     // Not using next router in order to reset camera-related state
        //     // window.location.href = "/login";
        // }
        router.push("/room");
    }, []);

    return (
        <div className="p-4 h-screen flex items-center gap-8">
            <div className="w-1/2 h-[90vh]">
                {/* <VideoChat transcript={transcript} setTranscript={setTranscript}/> */}
            </div>

            <div className="w-1/2 h-[90vh]">
                {(configurationMode === "mode_a") ? <ProtocolPanel /> : <RealtimeAssistancePanel transcript={transcript} />}
            </div>
        </div>
    );
}