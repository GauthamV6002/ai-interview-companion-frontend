import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Protocol } from '@/types/Protocol';
import { RefreshCw } from 'lucide-react';
import React from 'react'

type Props = {
    sessionProtocol: Protocol;
    selectedQuestion: number;
    setSelectedQuestion: (question: number) => void;
    configurationMode: string|null;
    handleRephrase: (question_id: number, question: string) => void;
}

const ProtocolPanel = ({ sessionProtocol, selectedQuestion, setSelectedQuestion, configurationMode, handleRephrase }: Props) => {
    return (
        <div className="h-full flex flex-col gap-2 overflow-y-scroll">
            {
                sessionProtocol.map((question, q_index) => (
                    <Card
                        className={`p-3 flex flex-row justify-start items-center gap-2 hover:cursor-pointer`}
                        style={q_index === selectedQuestion ? { backgroundColor: "rgba(0, 255, 0, 0.1)", color: "lightgreen" } : {}}
                        key={q_index}
                        onClick={() => setSelectedQuestion(q_index)}
                    >
                        <Checkbox className='size-6 mt-1' style={q_index === selectedQuestion ? { color: "lightgreen" } : {}} />

                        
                        {configurationMode === "interactive" || configurationMode === "full" &&<RefreshCw className='size-6 hover:scale-110 hover:cursor-pointer mt-1 flex-shrink-0' onClick={() => handleRephrase(q_index, question.question)} /> }
                        
                        <div className="ml-1">
                            <p className='text-white/90' style={q_index === selectedQuestion ? { color: "lightgreen" } : {}} >{question.question}</p>
                            {/* {
                                        (q_index === selectedQuestion) &&
                                        (<div className='flex gap-1 justify-start items-center'>
                                            <Checkbox className='size-3' />
                                            <p className='text-sm text-white/60'>Follow-up</p>
                                        </div>)
                                    } */}

                        </div>
                    </Card>
                ))
            }
        </div>
    )
}

export default ProtocolPanel