import React, { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = {
    transcriptionProgress: number;
}

const ProgressPanel = ({ transcriptionProgress }: Props) => {

    return (
        <div className='w-screen h-screen flex justify-center items-center'>
        <Card>
            <CardHeader>
                <CardTitle className='text-4xl'>Interview Report</CardTitle>
                <CardDescription className='text-lg'>We're compiling your interview report, don't close this page!</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-row items-center gap-2'>
                <Progress value={transcriptionProgress} />
                <p className='text-lg font-familijen-grotesk'>{transcriptionProgress}%</p>
            </CardContent>
        </Card>
    </div>
    )
}

export default ProgressPanel