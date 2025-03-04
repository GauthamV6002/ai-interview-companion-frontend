'use client'
import React, { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import RealtimeReportPanel from '@/components/PostInterview/RealtimeReport/RealtimeReportPanel'
import ProgressPanel from '@/components/PostInterview/RealtimeReport/ProgressPanel'
import AudioRecordingsPanel from '@/components/PostInterview/RealtimeReport/AudioRecordingsPanel'

type Props = {}

const page = (props: Props) => {

    const [transcriptionProgress, setTranscriptionProgress] = useState(100);

    return (
        <div className='bg-black'>
            {
                transcriptionProgress < 100 ?
                <ProgressPanel transcriptionProgress={transcriptionProgress} /> :
                <div className="container mx-auto py-8 space-y-8">
                    <RealtimeReportPanel />
                    <AudioRecordingsPanel />
                </div>
            }
        </div>
    )
}

export default page