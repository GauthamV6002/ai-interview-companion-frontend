'use client'
import React, { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import RealtimeReportPanel from '@/components/PostInterview/RealtimeReport/RealtimeReportPanel'
import ProgressPanel from '@/components/PostInterview/RealtimeReport/ProgressPanel'

type Props = {}

const page = (props: Props) => {

    const [transcriptionProgress, setTranscriptionProgress] = useState(100);

    return (
        <div className='bg-black'>
            {
                transcriptionProgress < 100 ?
                <ProgressPanel transcriptionProgress={transcriptionProgress} /> :
                <RealtimeReportPanel />
            }
        </div>
    )
}

export default page