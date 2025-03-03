import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

import openaiLogo from '@/public/chatgpt-logo.webp';

type Props = {
    responseInProgress: boolean;
    modelResponse: string;
    modelResponseDescription: string;
    modelResponseType: string;
}

const ResponsePanel = ({ responseInProgress, modelResponse, modelResponseDescription, modelResponseType }: Props) => {


    //get color based on modelResponseType function
    const getColor = (modelResponseType: string) => {
        if (modelResponseType === "feedback") return "lightgreen";
        if (modelResponseType === "follow-up") return "lightblue";
        if (modelResponseType === "rephrase") return "orange";
        if (modelResponseType === "next-question") return "coral";
        return "lightgray";
    }


    return (
        <Card className='p-4 mt-4 flex gap-2 items-center justify-start'>

            <div className="flex gap-2 items-center">
                <div className="flex flex-col justify-center items-center gap-2 ">
                    <img src={openaiLogo.src} alt="OpenAI Logo" className="size-12 mx-8 rounded-full" />
                    <p className='text-xs font-familijen-grotesk font-bold text-center' style={{ color: getColor(modelResponseType) }}>{modelResponseType.toUpperCase()}</p>
                </div>
                <div className='w-[1px] bg-white h-20'></div>
                <div className="flex flex-col">
                    <div>
                        {responseInProgress ?
                            <Skeleton className='w-[400px] h-8 mb-2' /> :
                            <h3 className={`text-base transition-opacity duration-500 ease-in-out`} style={{ color: getColor(modelResponseType) }}>
                                {modelResponse}
                            </h3>
                        }
                    </div>
                    {/* <div className='w-6 bg-white h-[2px] my-2'></div> */}
                    <div>
                        {responseInProgress ?
                            <Skeleton className='w-[300px] h-8' /> :
                            <p className={`text-sm transition-opacity duration-500 ease-in-out`}>
                                {modelResponseDescription}
                            </p>
                        }
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ResponsePanel