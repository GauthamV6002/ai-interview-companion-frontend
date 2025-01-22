import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

type Props = {}

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { RefreshCw } from 'lucide-react'



const RealtimeAssistancePanel = (props: Props) => {

    const { protocol } = useAuth();

    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle className='text-3xl'>AI Assistant</CardTitle>
                <CardDescription className='flex gap-2 items-center'>
                    <div className='size-1 bg-green-500 rounded-full'></div> AI Assistance Enabled

                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>

                <div className='p-4 border-[0.5px] border-white/20 flex flex-row justify-start items-center gap-2 rounded-lg'>
                    <div className='size-2 bg-green-500 rounded-full'></div> <h3 className='text-lg'>Great job with that question!</h3>
                </div>
                <div className='flex justify-evenly'>
                    <Button>Ask a follow-up</Button>
                    <Button>Next Question</Button>
                </div>
                <Accordion type="multiple" className="w-full">
                    {
                        protocol.map((question, q_index) => (
                            <AccordionItem className=' border-b-white/10' value={`item-${q_index}`} key={q_index}>
                                <AccordionTrigger className='flex flex-row justify-start gap-3'>
                                    <RefreshCw className='hover:scale-110 hover:cursor-pointer' />
                                    <p>{question.question}</p>
                                </AccordionTrigger>
                                <AccordionContent className=''>
                                    {
                                        question.followUps.map((followUp, f_index) => (
                                            <div key={f_index} className='flex gap-2'>
                                                <div className='w-[2px] h-auto bg-white'></div>
                                                <Textarea className='h-24' defaultValue={followUp} />
                                            </div>
                                        ))
                                    }
                                </AccordionContent>
                            </AccordionItem>
                        ))

                    }
                </Accordion>
            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel