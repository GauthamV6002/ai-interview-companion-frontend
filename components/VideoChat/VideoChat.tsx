"use client"
import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    useCallStateHooks,
    User,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import UILayout from './UILayout';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '@/context/AuthContext';


// public stream data
const callId = "csb-test";
const user_id = "csb-user";
const user = { id: user_id };

const apiKey = "mmhfdzb5evj2";

const tokenProvider = async () => {
    const { token } = await fetch(
      "https://pronto.getstream.io/api/auth/create-token?" +
        new URLSearchParams({
          api_key: apiKey,
          user_id: user_id
        })
    ).then((res) => res.json());
    return token as string;
  };

// const user: User = {
//     id: userId,
//     name: "test_name",
//     image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
// };

const client = new StreamVideoClient({ apiKey, user, tokenProvider });
const call = client.call('default', callId);
call.join({ create: true });


export default function VideoChat() {


    const {configurationMode, participantID, setConfigurationMode, setParticipantID} = useAuth();

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
