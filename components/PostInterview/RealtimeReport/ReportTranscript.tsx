import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

import { Transcript, TranscriptItem } from '@/types/Transcript'
import { Pause, Sparkles, User } from 'lucide-react'
import { useTranscriptLog } from '@/context/TranscriptLogContext'

type Props = {}

const TRANSCRIPT_SAMPLE: Transcript = [
    {
        "timestamp": "00:00:05",
        "speaker": "interviewer",
        "text": "Welcome, John. Can you start by telling us a little about yourself?"
    },
    {
        "timestamp": "00:00:12",
        "speaker": "interviewee",
        "text": "Sure! My name is John, and I have a background in software engineering. I've worked on various AI projects, focusing on machine learning and data optimization."
    },
    {
        "timestamp": "00:00:12",
        "aiEvent": "start-ai",
    },
    {
        "timestamp": "00:00:30",
        "speaker": "interviewer",
        "text": "That sounds interesting. Can you describe a recent project you've worked on?"
    },
    {
        "timestamp": "00:00:40",
        "speaker": "interviewee",
        "text": "Absolutely. Recently, I developed a model selection system that routes prompts to the most cost-effective LLMs based on complexity and domain."
    },
    {
        "timestamp": "00:01:05",
        "speaker": "interviewer",
        "text": "What challenges did you face while working on that project?"
    },
    {
        "timestamp": "00:01:05",
        "speaker": "interviewer",
        "text": "What challenges did you face while working on that project?"
    },
    {
        "timestamp": "00:01:07",
        "aiEvent": "follow-up",
        "aiEventData": "What was the biggest challenge you faced while working on that project?"
    },
    {
        "timestamp": "00:01:12",
        "speaker": "interviewee",
        "text": "One of the biggest challenges was optimizing latency while ensuring high accuracy. I tackled this by implementing a lightweight classifier that assigns scores to different models before routing the prompt."
    },
    {
        "timestamp": "00:01:40",
        "speaker": "interviewer",
        "text": "That's impressive. How did you validate the effectiveness of your system?"
    },
    {
        "timestamp": "00:01:50",
        "speaker": "interviewee",
        "text": "I conducted extensive A/B testing and benchmarked results against existing solutions. The system improved cost efficiency by 30% while maintaining response quality."
    },
    {
        "timestamp": "00:02:10",
        "speaker": "interviewer",
        "text": "Great work, John. One last question—where do you see AI heading in the next five years?"
    },
    {
        "timestamp": "00:02:20",
        "speaker": "interviewee",
        "text": "I believe AI will become more personalized and efficient. With advancements in multi-modal models and optimization techniques, we'll see AI becoming more integrated into daily workflows."
    },
    {
        "timestamp": "00:02:40",
        "speaker": "interviewer",
        "text": "Thank you, John. It was great speaking with you today."
    },
    {
        "timestamp": "00:02:40",
        "pauseDuration": 1000
    },
    {
        "timestamp": "00:02:45",
        "speaker": "interviewee",
        "text": "Likewise, Jane. Thanks for having me!"
    }
]

const TranscriptMessage = ({ item }: { item: TranscriptItem }) => {

    const eventCodeToDescription = {
        "feedback": "Feedback Event: AI provided feedback on the interviewer's or interviewee's response.",
        "follow-up": "Follow-up Event: AI suggested a follow-up question to the interviewer.",
        "next-question": "Next Question Event: AI suggested the next question to the interviewer.",
        "rephrase": "Rephrase Event: AI rephrased a question for the interviewer.",

        "start-ai": "Start AI Event: Realtime Connection Started.",
        "stop-ai": "Stop AI Event: Realtime Connection Ended.",

        "recording-started": "Recording Started Event: Recording Started.",
        "recording-stopped": "Recording Stopped Event: Recording Stopped.",

    }

    const getItemPayload = () => {
        if (item.pauseDuration) {
            return <span className="text-sm italic">{item.pauseDuration}ms Pause</span>
        }
     
        if (item.aiEvent) {

            if(item.aiEvent === "start-ai" || item.aiEvent === "stop-ai") {
                return (
                    <div className="text-sm flex flex-col">
                        <code className="text-sm text-green-400 bg-gray-800 px-[6px] py-[2px] rounded-sm">{item.aiEvent}</code>
                    </div>
                )
            }

            return (
                <div className="text-sm flex flex-col">
                    <code className="text-sm w-fit text-green-400 bg-gray-800 px-[6px] py-[2px] rounded-sm">{item.aiEvent}</code>
                    {item.aiEventDirection === "ask" ? <span className="text-sm">Message Sent to Realtime API.</span> 
                    : <span className="text-sm"><span className="underline font-bold">AI Response:</span> {item.aiEventData}</span>}
                </div>
            )
        }

        // if (item.interactionEvent) {
        //     return <span className="text-sm italic">{item.interactionEvent}</span>
        // }

        return (<span className="text-sm flex-1">{item.text}</span>);
        
    }

    const getItemCategory = () => {
        if (item.pauseDuration) {
            return <span className="text-sm font-medium text-gray-600">Pause</span>
        }

        if (item.aiEvent) {
            return <span className="text-sm font-medium text-green-400">AI Event</span>
        }
    
        // if (item.interactionEvent) {
        //     return <span className="text-sm">Interaction</span>
        // }

        // TODO: Add correct speaker
        return <span className="text-sm font-medium text-blue-400"> Speech </span>
    }

    const getItemIcon = () => {
        if (item.pauseDuration) {
            return <Pause className="size-6 text-gray-600 bg-black py-[2px] rounded-full absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"/>
        }
     
        if (item.aiEvent) {
            return <Sparkles className="size-6 text-green-400 bg-black py-[2px] rounded-full absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"/>
        }

        // if (item.interactionEvent) {
        //     return <MousePointer className="size-6 text-yellow-400 bg-black py-[2px] rounded-full absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"/>
        // }

        return <User className="size-6 text-blue-400 bg-black py-[2px] rounded-full absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"/>
        
    }

    return (
        <div className="flex items-center gap-5">
            <div className="flex flex-col gap-1 min-w-[100px] text-right">
                <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                { getItemCategory() }
            </div>

            <div className='min-h-full w-[1px] bg-gray-200 mt-1 relative'>
                { getItemIcon() }
            </div>

            <div className="flex flex-col items-center h-full justify-center gap-1">
                { getItemPayload() }
            </div>
        </div>
    )
}

const ReportTranscript = (props: Props) => {

    const { transcript } = useTranscriptLog();

    return (
        <Card className='h-full flex-col flex'>
            {/* TODO: Remove red & white outlines */}
            <CardHeader>
                <CardTitle className='text-2xl'>Interview Transcript</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 overflow-y-scroll">
                {transcript.map((item, index) => (
                    // Skip recording-started and recording-stopped events
                    (item.aiEvent !== "recording-started" && item.aiEvent !== "recording-stopped") 
                    && <TranscriptMessage key={index} item={item} />
                ))}
            </CardContent>
        </Card>
    )
}

export default ReportTranscript