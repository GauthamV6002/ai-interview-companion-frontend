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
    handleGetEvaluation: () => void;
    handleGetSuggestion: () => void;
    stopSession: () => void;
    startSession: () => void;
    elapsedTime: string;
    onShowInstructions: () => void;
    isRecording: boolean;
}

const ControlsPanel = ({ configurationMode, isSessionActive, responseInProgress, handleGetEvaluation, handleGetSuggestion, stopSession, startSession, elapsedTime, onShowInstructions, isRecording }: Props) => {
    return (
        <Card className='p-4 flex justify-between items-center'>
            {configurationMode === "interactive" || configurationMode === "full" ?
                <div className='flex gap-2'>
                    {/* <Button onClick={generateTextResponse}>Test CMD</Button> */}
                    <Button disabled={!isSessionActive || responseInProgress} onClick={handleGetEvaluation}>{responseInProgress && <LoaderCircle className='size-4 animate-spin' />} Evaluate My Question</Button>
                    <Button disabled={!isSessionActive || responseInProgress} onClick={handleGetSuggestion}>{responseInProgress && <LoaderCircle className='size-4 animate-spin' />} Suggest Next Step</Button>
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
                        <Button className='bg-red-500' onClick={stopSession}> <Pause className="mr-2" /> Stop</Button> 
                        : 
                        <Button onClick={startSession}> <Play className="mr-2" /> Start</Button>
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