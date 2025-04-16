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
                        className={`p-3 flex flex-col justify-start gap-2 hover:cursor-pointer`}
                        style={q_index === selectedQuestion ? { backgroundColor: "rgba(0, 255, 0, 0.1)", color: "lightgreen" } : {}}
                        key={q_index}
                        onClick={() => setSelectedQuestion(q_index)}
                    >
                        <div className="flex flex-row justify-start items-center gap-2">
                            <Checkbox className='size-6 mt-1' style={q_index === selectedQuestion ? { color: "lightgreen" } : {}} />
                            
                            {(configurationMode === "interactive" || configurationMode === "full") && 
                                <RefreshCw className='size-6 hover:scale-110 hover:cursor-pointer mt-1 flex-shrink-0' onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleRephrase(q_index, question.question);
                                }} />
                            }
                            
                            <div className="ml-1">
                                <p className='text-white/90' style={q_index === selectedQuestion ? { color: "lightgreen" } : {}}>{question.question}</p>
                            </div>
                        </div>

                        {/* Display feedback if available */}
                        {question.feedback && (
                            <div className="mt-2 p-2 bg-gray-800 rounded-md">
                                <div className="mb-1">
                                    <p className="text-sm font-semibold text-blue-400">Summary:</p>
                                    <ul className="list-disc pl-4 text-sm text-white/80">
                                        {question.feedback.summary.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-blue-400">Information Gap:</p>
                                    <p className="text-sm text-white/80">{question.feedback.informationGap}</p>
                                </div>
                            </div>
                        )}
                    </Card>
                ))
            }
        </div>
    )
}

export default ProtocolPanel