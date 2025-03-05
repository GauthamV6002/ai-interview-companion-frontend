import React from 'react'
import ReportTranscript from './ReportTranscript'
import ReportSummary from './ReportSummary'

type Props = {}

const RealtimeReportPanel = (props: Props) => {
    return (
        <div className="p-4 h-screen w-full flex items-center gap-8">

            <div className="w-1/2 h-[90vh]">
                <ReportSummary />
            </div>

            <div className="w-1/2 h-[90vh]">
                <ReportTranscript />
            </div>
        </div>
    )
}

export default RealtimeReportPanel