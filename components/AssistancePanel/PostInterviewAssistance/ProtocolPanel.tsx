import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

type Props = {}

const ProtocolPanel = (props: Props) => {

    const { protocol } = useAuth();

    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle className='text-3xl'>Protocol</CardTitle>
                <CardDescription className='flex gap-2 items-center'>
                    <div className='size-1 bg-red-500 rounded-full'></div> AI Assistance Disabled
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
                <Accordion type="multiple" className="w-full">
                    {
                        protocol.map((question, q_index) => (
                            <AccordionItem className='border-b-white/10' value={`item-${q_index}`} key={q_index}>
                                <AccordionTrigger>{question.question}</AccordionTrigger>
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

export default ProtocolPanel