import { useEffect, useState } from "react";
import {
    Call,
    CallControls,
    StreamCall,
    StreamTheme,
    StreamVideo,
    SpeakerLayout,
    StreamVideoClient, 
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { type CallClosedCaption } from "@stream-io/video-react-sdk";


import UILayout from './UILayout';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';
import { useAuth } from '@/context/AuthContext';

// NOTE: This will generate a new call on every reload
// Fork this CodeSandbox and set your own CallID if
// you want to test with multiple users or multiple tabs opened
const callId = "ai-interview-companion-test-call"


// apikey can be public as stream uses JWT auth with hidden secret keys
const apiKey = "wqk6rk42ud7w";



export default function VideoChat({ transcript, setTranscript }: { transcript: string; setTranscript: React.Dispatch<React.SetStateAction<string>>; }) {
    const [client, setClient] = useState<StreamVideoClient>();
    const [call, setCall] = useState<Call>();

    // const { useCallClosedCaptions } = useCallStateHooks();
    // const closedCaptions = useCallClosedCaptions();

    const {configurationMode, participantID, setConfigurationMode, setParticipantID} = useAuth();

    useEffect(() => {
        console.log("wtf1")

        const userId = String(participantID);
        const user = { id: userId };

        (async () => {
            const response = await fetch("/api/getToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId: String(participantID) })
            });
            const data = await response.json();
            
            // this crap too way too long
            const client = StreamVideoClient.getOrCreateInstance({ apiKey, user, token: data.token });
            setClient(client);
        })()
        

        return () => {
            if (!client) return;
            client.disconnectUser();
            setClient(undefined);
        };
    }, []);

    useEffect(() => {
        if (!client) return;
        const myCall = client.call("default", callId);
        myCall.join({ create: true }).catch((err) => {
            console.error(`Failed to join the call`, err);
        });
        
        // async () => {
        //     await myCall.startClosedCaptions();
        // }
        
        const unsubscribe = myCall.on("call.closed_caption", (e) => {
            console.log("Closed caption event:", e);
            setTranscript((prevTranscript) => `${prevTranscript} \n ${e.closed_caption.text}`);

        });
        
        setCall(myCall);

        return () => {
            setCall(undefined);
            unsubscribe();
            myCall.leave().catch((err) => {
                console.error(`Failed to leave the call`, err);
            });
        };
    }, [client]);

    if (!client || !call) return null;

    return (
        <Card className='p-4 h-full flex flex-col justify-center items-center'>
            <CardContent>
                <div className='w-[90%]'>
                    <StreamVideo client={client}>
                        <StreamCall call={call}>
                            <UILayout />
                        </StreamCall>
                    </StreamVideo>
                </div>
            </CardContent>
            {/* <CardFooter>
                <p className="text-sm">{transcript}</p>
            </CardFooter> */}
            
        </Card>
    );
}
