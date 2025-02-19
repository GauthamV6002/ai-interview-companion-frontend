import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

type Props = {}

const NotesPanel = (props: Props) => {

    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle className='text-3xl'>Notes Panel</CardTitle>
            </CardHeader>
            <CardContent className=''>
                <Textarea
                    draggable={false}
                    className='h-[400px]'
                    defaultValue={"Add notes, interview feedback, or anything else..."} 
                />
            </CardContent>
        </Card>
    )
}

export default NotesPanel