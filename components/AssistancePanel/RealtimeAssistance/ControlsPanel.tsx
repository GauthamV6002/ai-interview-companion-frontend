import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { Pause } from 'lucide-react'
import { HelpCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { LoaderCircle } from 'lucide-react'
import { Mic } from 'lucide-react'
import React from 'react'

type Props = {
    configurationMode: string|null;
    isSessionActive: boolean;
    responseInProgress: boolean;
    handleGetAnalysis: () => void;
    stopSession: () => void;
    startSession: () => void;
    elapsedTime: string;
    onShowInstructions: () => void;
    isRecording: boolean;
}

const ControlsPanel = ({ configurationMode, isSessionActive, responseInProgress, handleGetAnalysis, stopSession, startSession, elapsedTime, onShowInstructions, isRecording }: Props) => {
    return (
        <Card className='p-4 flex justify-between items-center'>
            {configurationMode === "interactive" || configurationMode === "full" ?
                <div className='flex gap-2'>
                    {/* <Button onClick={generateTextResponse}>Test CMD</Button>
                    <Button disabled={!isSessionActive || responseInProgress} onClick={() => {
                        // This will be handled by the parent component
                        window.dispatchEvent(new CustomEvent('getFollowUp'));
                    }}>
                        {responseInProgress && <LoaderCircle className='size-4 animate-spin mr-2' />} 
                        Generate follow-up
                    </Button> */}
                    <Button disabled={!isSessionActive || responseInProgress} onClick={handleGetAnalysis}>
                        {responseInProgress && <LoaderCircle className='size-4 animate-spin mr-2' />} 
                        Give me Analysis
                    </Button>
                </div>
                :
                <p className='text-white/60'>Interactive mode not enabled</p>}
            <div className='flex items-center gap-4'>
                <span className='font-mono text-lg'>{elapsedTime}</span>
                {isRecording && (
                    <div className='flex items-center gap-1 text-red-500'>
                        <Mic className='h-4 w-4 animate-pulse' />
                        <span className='text-sm'>Recording</span>
                    </div>
                )}
                <div className='flex gap-2'>
                    {isSessionActive ? 
                        <Button className='bg-red-500' onClick={stopSession}> <Pause className="mr-2" /> Stop AI</Button> 
                        : 
                        <Button onClick={startSession}> <Play className="mr-2" /> Start AI</Button>
                    }
                    <Button variant="outline" size="icon" onClick={onShowInstructions}>
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default ControlsPanel