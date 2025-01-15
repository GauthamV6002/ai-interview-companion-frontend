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
const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0RhcnRoX1ZhZGVyIiwidXNlcl9pZCI6IkRhcnRoX1ZhZGVyIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3MzYzNzQ5ODcsImV4cCI6MTczNjk3OTc4N30.7-WZzgMGL0_4V3iqKPtGY-c-icO38t9b_QqR_0kAbls';
const userId = 'Darth_Vader';
const callId = 'tCtEexQJZjOI';

const user: User = {
    id: userId,
    name: "test_name",
    image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
};

const client = new StreamVideoClient({ apiKey, user, token });
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
