import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamTheme,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';

import { Skeleton } from '../ui/skeleton';

const UILayout = () => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    if (callingState !== CallingState.JOINED) {
        return (
            <div className=''>
                <div className="flex gap-2 mb-2">
                    <Skeleton className='w-1/3 h-[200px]' />
                    <Skeleton className='w-1/3 h-[200px]' />
                    <Skeleton className='w-1/3 h-[200px]' />
                </div>
                <Skeleton className='w-full h-[400px]' />
            </div>
        );
    }

    return (
        <StreamTheme>
            <SpeakerLayout participantsBarPosition='top' participantsBarLimit={3} />
            <CallControls />
        </StreamTheme>
    );
};

export default UILayout