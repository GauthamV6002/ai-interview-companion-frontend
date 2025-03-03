import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { Pause } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { LoaderCircle } from 'lucide-react'
import React from 'react'

type Props = {
    configurationMode: string|null;
    isSessionActive: boolean;
    responseInProgress: boolean;
    handleGetFollowUp: () => void;
    handleNextQuestion: () => void;
    stopSession: () => void;
    startSession: () => void;
    elapsedTime: string;
}

const ControlsPanel = ({ configurationMode, isSessionActive, responseInProgress, handleGetFollowUp, handleNextQuestion, stopSession, startSession, elapsedTime }: Props) => {
    return (
        <Card className='p-4 flex justify-between items-center'>
            {configurationMode === "interactive" || configurationMode === "full" ?
                <div className='flex gap-2'>
                    {/* <Button onClick={generateTextResponse}>Test CMD</Button> */}
                    <Button disabled={!isSessionActive || responseInProgress} onClick={handleGetFollowUp}>{responseInProgress && <LoaderCircle className='size-4 animate-spin' />} Generate follow-up</Button>
                    <Button disabled={!isSessionActive || responseInProgress} onClick={handleNextQuestion}> {responseInProgress && <LoaderCircle className='size-4 animate-spin' />} Next Question </Button>
                </div>
                :
                <p className='text-white/60'>Interactive mode not enabled</p>}
            <div className='flex items-center gap-4'>
                <span className='font-mono text-lg'>{elapsedTime}</span>
                {isSessionActive ? <Button className='bg-red-500' onClick={stopSession}> <Pause className="mr-2" /> Stop AI</Button> : <Button onClick={startSession}> <Play className="mr-2" /> Start AI</Button>}
            </div>
        </Card>
    )
}

export default ControlsPanel