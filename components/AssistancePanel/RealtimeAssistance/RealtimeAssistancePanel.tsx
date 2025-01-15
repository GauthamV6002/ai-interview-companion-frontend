import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

type Props = {}

const RealtimeAssistancePanel = (props: Props) => {
    
    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle className='text-3xl'>AI Assistant</CardTitle>
                <CardDescription className='flex gap-2 items-center'>
                    <div className='size-1 bg-green-500 rounded-full'></div> AI Assistance Enabled
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
                Realtime Assistance
            </CardContent>
        </Card>
    )
}

export default RealtimeAssistancePanel