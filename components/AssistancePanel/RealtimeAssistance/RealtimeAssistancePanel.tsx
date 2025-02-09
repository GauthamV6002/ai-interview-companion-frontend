import React, { use, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

type Props = {}

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { RefreshCw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'


const RealtimeAssistancePanel = (props: Props) => {

    const { protocol } = useAuth();

    const [selectedQuestion, setSelectedQuestion] = useState(0);

    const [followUpGenerated, setFollowUpGenerated] = useState(false)

    const handleNextQuestion = () => {
        setSelectedQuestion((prev) => Math.min(prev + 1, protocol.length - 1));
        setFollowUpGenerated(false);
    }

    const handleGetFollowUp = () => {
        setFollowUpGenerated(true);
    }

    return (
        <Card className='h-full pt-4'>
            <CardContent className='flex flex-col gap-2'>

                <Card className='p-4 flex gap-2 items-center justify-start'>
                    <div className='size-2 bg-green-500 rounded-full'></div> <h3 className='text-lg'>Great job with that question!</h3>
                </Card>
                <div className='flex justify-start gap-3 mb-4'>
                    <Button onClick={handleGetFollowUp}>Generate follow-up</Button>
                    <Button onClick={handleNextQuestion}>Next best question</Button>
                </div>

                <div className="flex flex-col gap-2">
                    {
                        protocol.map((question, q_index) => (
                            <Card 
                                className='p-3 flex flex-row justify-start items-center gap-2' 
                                style={q_index === selectedQuestion ? { borderColor: "red" } : {}}
                                key={q_index}
                            >
                                <div className=" mr-auto">
                                    <p className='text-white/90'>{question.question}</p>
                                    {
                                        (q_index === selectedQuestion && followUpGenerated) &&
                                        (<div className='flex gap-1 justify-start items-center'>
                                            <Checkbox className='size-3' />
                                            <p className='text-sm text-white/60'>Follow-up</p>
                                        </div>)
                                    }


                                </div>
                                <RefreshCw className='hover:scale-110 size-6 hover:cursor-pointer' />
                                <Checkbox className='size-6' />
                            </Card>
                        ))
                    }
                </div>


            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel