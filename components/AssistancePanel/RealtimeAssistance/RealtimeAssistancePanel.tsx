import React, { use, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from '@/context/AuthContext'
import { Textarea } from '@/components/ui/textarea'

import { RefreshCw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

import OpenAI from "openai";
import { config } from 'dotenv'

config();

type Props = {
    transcript: string;
}

const RealtimeAssistancePanel = ({transcript} : Props) => {

    const { protocol } = useAuth();

    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [followUpGenerated, setFollowUpGenerated] = useState(false);

    const [AIFeedback, setAIFeedback] = useState<string>("Start talking to begin.");

    const handleNextQuestion = () => {
        setSelectedQuestion((prev) => Math.min(prev + 1, protocol.length - 1));
        setFollowUpGenerated(false);
    }

    const handleGetFollowUp = () => {
        setFollowUpGenerated(true);
    }

    const getOpenAIReview = async () => {

        // const openai = new OpenAI({apiKey})

        // Now, review the interviewer’s current round of speech:
        // <interviewer_speech>  
        // {{INTERVIEWER_SPEECH}}  
        // </interviewer_speech>  \n
        // const prompt = `First, review the interview chat history:\n Use your best judgement to figure out which parts are asked by the interviewer, and which parts are answers by the interviewee.\n
        // <interview_chat_history>  
        //     ${transcript}  
        // </interview_chat_history>  
        // \nSecond, review the interview protocol the junior interviewer should be following:\n
        // <interview_protocol>  
        //     ${protocol.join("\n")}  
        // </interview_protocol>  \n
        
        // Analyze the interviewer’s speech based on the following feedback rubric:\n\n1. Question Design\n\t•\tIs the question open-ended or closed?\n\t•\tIs it leading or non-leading?\n\t•\tIs it relevant to the protocol and context?\n\n2. Clarity and Delivery\n\t•\tIs the question clearly phrased and understandable?\n\t•\tDoes it avoid overloading with multiple questions?\n\n3. Flow and Relevance\n\t•\tDoes it maintain a natural flow?\n\t•\tDoes it build on the interviewee’s previous responses?\n\n4. Active Listening\n\t•\tDoes it show attentiveness by connecting to what the interviewee said?\n
        // Regarding the interviewer’s speech, provide feedback using the following format:\n\t1.\tEvaluation Judgment: “Good,” “Neutral,” or “Bad.”\n\t2.\tEvaluation Statement: 2–3 keywords explaining the judgment.\n\t3. Actionable Tip: Required for “Neutral” and “Bad” evaluations, written clearly and within 15 words.\n\nExamples:\n\t•\tGood: “Open-ended, relevant, clear question. Great job fostering deeper reflection.”\n\t•\tNeutral: “Closed question, needs elaboration. Try rephrasing: ‘Can you share an example of this?’”\n\t•\tBad: “Off-track question, unclear focus. Gently steer back to the protocol topic with a rephrased question.”\n\nThe whole feedback must be within 20 words.\nPresent your analysis and feedback in the following format:\n\n<feedback>  \n<evaluation>[Evaluation Judgment]</evaluation>  \n<statement>[Evaluation Statement]</statement>  \n<tip>[Actionable Tip, if applicable]</tip>  \n</feedback>`


        // const completion = await openai.chat.completions.create({
        //     model: "gpt-4o",
        //     messages: [
        //         { role: "developer", content: "You are an expert qualitative researcher with extensive experience in conducting and observing semi-structured interviews. Your task is to monitor the interview to ensure it progresses smoothly and naturally while helping to elicit rich, in-depth perspectives from the interviewee. Provide feedback to the interviewer based on their performance." },
        //         {
        //             role: "user",
        //             content: prompt,
        //         },
        //     ],
        //     store: true,
        // });

        // console.log(prompt);

        // if(completion.choices[0].message.content) {
        //     setAIFeedback(completion.choices[0].message.content);
        // } else  {
        //     console.log("client error: openai response null");
        // }
    }

    return (
        <Card className='h-full pt-4'>
            <CardContent className='flex flex-col gap-2'>

                <Card className='p-4 flex gap-2 items-center justify-start'>
                    <div className='size-2 bg-green-500 rounded-full'></div> <h3 className='text-lg'>Great job with that question!</h3>
                </Card>
                <div className='flex justify-start gap-3 mb-4'>
                    <Button onClick={getOpenAIReview}>Get AI Feedback</Button>
                    <Button onClick={handleGetFollowUp}>Generate follow-up</Button>
                    <Button onClick={handleNextQuestion}>Next best question</Button>
                </div>

                <div className='my-4 border-1 '>
                    <h3>AI Feedback</h3>
                    <p>
                        {AIFeedback}
                    </p>
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