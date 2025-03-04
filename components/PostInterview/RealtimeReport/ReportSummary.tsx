import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { useTranscriptLog } from '@/context/TranscriptLogContext';
import { ArrowRight, Clock, Download, FileAudio, MessageSquare, MessageSquarePlus, RefreshCw, Timer, TimerOff } from 'lucide-react'
import React from 'react'

type MetricItem = {
    icon: React.ReactNode;
    text: string;
}

type MetricsSectionProps = {
    title: string;
    barColor: string;
    metrics: MetricItem[];
}

const MetricsSection = ({ title, barColor, metrics }: MetricsSectionProps) => {
    return (
        <div className="flex gap-4">
            <div className={`w-1 ${barColor} rounded-full`}></div>
            <div className="flex-1">
                <h3 className='text-lg font-bold'>{title}</h3>
                <div className='flex flex-col gap-1'>
                    {metrics.map((metric, index) => (
                        <p key={index} className='text-base flex items-center gap-2'>
                            {metric.icon}
                            {metric.text}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

type Props = {}

const ReportSummary = (props: Props) => {

    const { transcript, elapsedTime } = useTranscriptLog();

    // Function to format time as mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getAveragePauseDuration = () => {
        const pauses = transcript.filter(item => item.pauseDuration);
        const totalDuration = pauses.reduce((sum, item) => sum + (item.pauseDuration || 0), 0);
        return (totalDuration / pauses.length).toFixed(1);
    }

    const getNumberOfPausesLongerThan3Seconds = () => {
        const pauses = transcript.filter(item => item.pauseDuration && item.pauseDuration > 3000);
        return pauses.length;
    }

    const getNumberOfRephrases = () => {
        const rephrases = transcript.filter(item => item.aiEvent === "rephrase");
        return rephrases.length;
    }

    const getNumberOfFollowUps = () => {
        const followUps = transcript.filter(item => item.aiEvent === "follow-up");
        return followUps.length;
    }

    const getNumberOfNextQuestions = () => {
        const nextQuestions = transcript.filter(item => item.aiEvent === "next-question");
        return nextQuestions.length;
    }

    

    return (
        <Card className='h-full flex-col flex'>
            {/* TODO: Remove red & white outlines */}
            <CardHeader>
                <CardTitle className='text-3xl'>Post Interview Report</CardTitle>
                <CardDescription className='text-base'>You can find key insights from your interview below, and the full transcript on the right.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <MetricsSection
                    title="Key Metrics"
                    barColor="bg-blue-500"
                    metrics={[
                        { icon: <Clock className="h-4 w-4" />, text: `Elapsed Time: ${formatTime(elapsedTime)}` },
                        { icon: <MessageSquare className="h-4 w-4" />, text: "Number of Questions Asked: 10" },
                        { icon: <MessageSquarePlus className="h-4 w-4" />, text: "Number of Questions Follow-up Questions Asked: 8" }
                    ]}
                />

                <MetricsSection
                    title="Pause Analysis"
                    barColor="bg-green-500"
                    metrics={[
                        { icon: <Timer className="h-4 w-4" />, text: `Average Pause Duration: ${getAveragePauseDuration()}s` },
                        { icon: <TimerOff className="h-4 w-4" />, text: `Number of Pauses Longer than 3 seconds: ${getNumberOfPausesLongerThan3Seconds()}` }
                    ]}
                />

                <MetricsSection
                    title="AI Feature Usage"
                    barColor="bg-purple-500"
                    metrics={[
                        { icon: <RefreshCw className="h-4 w-4" />, text: `Rephrase Usages: ${getNumberOfRephrases()}` },
                        { icon: <MessageSquarePlus className="h-4 w-4" />, text: `Follow-up Usages: ${getNumberOfFollowUps()}` },
                        { icon: <ArrowRight className="h-4 w-4" />, text: `Next Question Usages: ${getNumberOfNextQuestions()}` }
                    ]}
                />
            </CardContent>
            <CardFooter>
                <div className="flex gap-4">
                    <Button variant="outline" className="flex gap-2">
                        <Download className="h-4 w-4" />
                        Download Transcript
                    </Button>
                    <Button variant="outline" className="flex gap-2">
                        <FileAudio className="h-4 w-4" />
                        Download Recording
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default ReportSummary