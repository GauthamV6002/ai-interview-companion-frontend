'use client'
import React, { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import RealtimeReportPanel from '@/components/PostInterview/RealtimeReport/RealtimeReportPanel'
import ProgressPanel from '@/components/PostInterview/RealtimeReport/ProgressPanel'
import AudioRecordingsPanel from '@/components/PostInterview/RealtimeReport/AudioRecordingsPanel'
import SegmentedAudioPanel from '@/components/PostInterview/RealtimeReport/SegmentedAudioPanel'
import { Button } from '@/components/ui/button'

type Props = {}

const page = (props: Props) => {
    const [transcriptionProgress, setTranscriptionProgress] = useState(100);
    const [activeView, setActiveView] = useState<'full' | 'segmented'>('full');

    return (
        <div className='bg-black'>
            {
                transcriptionProgress < 100 ?
                <ProgressPanel transcriptionProgress={transcriptionProgress} /> :
                <div className="container mx-auto py-8 space-y-8">
                    <RealtimeReportPanel />
                    
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <Button 
                                onClick={() => setActiveView('full')}
                                variant={activeView === 'full' ? 'default' : 'outline'}
                                className="rounded-r-none"
                            >
                                Full Recordings
                            </Button>
                            <Button 
                                onClick={() => setActiveView('segmented')}
                                variant={activeView === 'segmented' ? 'default' : 'outline'}
                                className="rounded-l-none"
                            >
                                Speech Segments
                            </Button>
                        </div>
                    </div>
                    
                    {activeView === 'full' ? (
                        <AudioRecordingsPanel />
                    ) : (
                        <SegmentedAudioPanel />
                    )}
                </div>
            }
        </div>
    )
}

export default page