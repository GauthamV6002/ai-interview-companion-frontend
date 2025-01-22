// "use client"
// import {
//     CallControls,
//     CallingState,
//     SpeakerLayout,
//     StreamCall,
//     StreamTheme,
//     StreamVideo,
//     StreamVideoClient,
//     useCallStateHooks,
//     User,
// } from '@stream-io/video-react-sdk';

// import '@stream-io/video-react-sdk/dist/css/styles.css';
// import UILayout from './UILayout';
// import { Card, CardHeader, CardTitle } from '../ui/card';
// import { useAuth } from '@/context/AuthContext';


// // public stream data
// const callId = "csb-test";
// const user_id = "csb-user";
// const user = { id: user_id };

// const apiKey = "mmhfdzb5evj2";

// const tokenProvider = async () => {
//     const { token } = await fetch(
//       "https://pronto.getstream.io/api/auth/create-token?" +
//         new URLSearchParams({
//           api_key: apiKey,
//           user_id: user_id
//         })
//     ).then((res) => res.json());
//     return token as string;
//   };

// // const user: User = {
// //     id: userId,
// //     name: "test_name",
// //     image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
// // };

// const client = new StreamVideoClient({ apiKey, user, tokenProvider });
// const call = client.call('default', callId);
// call.join({ create: true });


// export default function VideoChat() {


//     const {configurationMode, participantID, setConfigurationMode, setParticipantID} = useAuth();

//     return (
//         <Card className='p-4 h-full flex justify-center items-center'>
//             <div className='w-[90%]'>
//                 <StreamVideo client={client}>
//                     <StreamCall call={call}>
//                         <UILayout />
//                     </StreamCall>
//                 </StreamVideo>
//             </div>
//         </Card>
//     );
// }

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

import UILayout from './UILayout';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '@/context/AuthContext';

// NOTE: This will generate a new call on every reload
// Fork this CodeSandbox and set your own CallID if
// you want to test with multiple users or multiple tabs opened
const callId = "ai-interview-companion-test-call"


// apikey can be public as stream uses JWT auth with hidden secret keys
const apiKey = "wqk6rk42ud7w";


export default function VideoChat() {
    const [client, setClient] = useState<StreamVideoClient>();
    const [call, setCall] = useState<Call>();

    const [callJoined, setCallJoined] = useState(false);

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

        setCall(myCall);

        return () => {
            setCall(undefined);
            myCall.leave().catch((err) => {
                console.error(`Failed to leave the call`, err);
            });
        };
    }, [client]);

    if (!client || !call) return null;

    return (
        <Card className='p-4 h-full flex justify-center items-center'>
            <div className='w-[90%]'>
                <StreamVideo client={client}>
                    <StreamCall call={call}>
                        <UILayout />
                    </StreamCall>
                </StreamVideo>
            </div>
        </Card>
    );
}

/*
// "use client"
// import {
//     CallControls,
//     CallingState,
//     SpeakerLayout,
//     StreamCall,
//     StreamTheme,
//     StreamVideo,
//     StreamVideoClient,
//     useCallStateHooks,
//     User,
// } from '@stream-io/video-react-sdk';

// import '@stream-io/video-react-sdk/dist/css/styles.css';
// import UILayout from './UILayout';
// import { Card, CardHeader, CardTitle } from '../ui/card';
// import { useAuth } from '@/context/AuthContext';


// // public stream data
// const callId = "csb-test";
// const user_id = "csb-user";
// const user = { id: user_id };

// const apiKey = "mmhfdzb5evj2";

// const tokenProvider = async () => {
//     const { token } = await fetch(
//       "https://pronto.getstream.io/api/auth/create-token?" +
//         new URLSearchParams({
//           api_key: apiKey,
//           user_id: user_id
//         })
//     ).then((res) => res.json());
//     return token as string;
//   };

// // const user: User = {
// //     id: userId,
// //     name: "test_name",
// //     image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
// // };

// const client = new StreamVideoClient({ apiKey, user, tokenProvider });
// const call = client.call('default', callId);
// call.join({ create: true });


// export default function VideoChat() {


//     const {configurationMode, participantID, setConfigurationMode, setParticipantID} = useAuth();

//     return (
//         <Card className='p-4 h-full flex justify-center items-center'>
//             <div className='w-[90%]'>
//                 <StreamVideo client={client}>
//                     <StreamCall call={call}>
//                         <UILayout />
//                     </StreamCall>
//                 </StreamVideo>
//             </div>
//         </Card>
//     );
// }

import { useEffect, useState } from "react";
import {
    Call,
    CallControls,
    StreamCall,
    StreamTheme,
    StreamVideo,
    SpeakerLayout,
    StreamVideoClient
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import UILayout from './UILayout';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '@/context/AuthContext';


const callId = "ai-interview-companion-test-call"
import { config } from 'dotenv';

config();
const apiKey = "wqk6rk42ud7w";

console.log(apiKey);

const tokenProvider = async () => {
    const { token } = await fetch(
      "https://pronto.getstream.io/api/auth/create-token?" +
        new URLSearchParams({
          api_key: apiKey,
          user_id: "12345"
        })
    ).then((res) => res.json());
    return token as string;
  };


export default function VideoChat() {

    const {configurationMode, participantID, setConfigurationMode, setParticipantID} = useAuth();

    const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();

    useEffect(() => {
    const user = { id: "12345" };
    const myClient = new StreamVideoClient({ apiKey, user, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDUifQ.O1Rvf-mDKNuZFp1Ye4BM8vEXOaVa8dBF9uqyjzVO2yo" });
    setClient(myClient);
    return () => {
      myClient.disconnectUser();
      setClient(undefined);
    };
  }, []);

  useEffect(() => {
    if (!client) return;
    const myCall = client.call("default", callId);
    myCall.join({ create: true }).catch((err) => {
      console.error(`Failed to join the call`, err);
    });

    setCall(myCall);

    return () => {
      setCall(undefined);
      myCall.leave().catch((err) => {
        console.error(`Failed to leave the call`, err);
      });
    };
  }, [client]);

  if (!client || !call) return null;


    return (
        <Card className='p-4 h-full flex justify-center items-center'>
            <div className='w-[90%]'>
                <StreamVideo client={client}>
                    <StreamCall call={call}>
                        <UILayout />
                    </StreamCall>
                </StreamVideo>
            </div>
        </Card>
    );
}

*/