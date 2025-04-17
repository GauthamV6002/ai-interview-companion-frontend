import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Protocol } from '@/types/Protocol';
import React from 'react'

type Props = {
    sessionProtocol: Protocol;
    selectedQuestion: number;
    setSelectedQuestion: (question: number) => void;
    configurationMode: string|null;
}

const ProtocolPanel = ({ sessionProtocol, selectedQuestion, setSelectedQuestion, configurationMode }: Props) => {
    return (
        <div className="h-full flex flex-col gap-2 overflow-y-scroll">
            {/* Completed label */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6"></div> {/* Spacer for checkbox column */}
                <p className="text-xs text-white/60">Completed</p>
            </div>

            {sessionProtocol.map((question, q_index) => (
                <div key={q_index} className="flex gap-2">
                    {/* Checkbox column */}
                    <div className="flex flex-col items-center w-6">
                        <Checkbox 
                            className='size-6 mt-1' 
                        />
                    </div>

                    {/* Question block */}
                    <div className="relative flex-1">
                        {/* Current Question indicator */}
                        {q_index === selectedQuestion && (
                            <div className="absolute -top-3 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Current Question
                            </div>
                        )}
                        
                        <Card
                            className={`p-3 flex flex-col justify-start gap-2 hover:cursor-pointer transition-all duration-200 ${
                                q_index === selectedQuestion 
                                    ? "border-2 border-green-500 bg-green-500/10" 
                                    : "border border-gray-700"
                            }`}
                            onClick={() => {
                                setSelectedQuestion(q_index);
                                console.log("Question clicked - q_index:", q_index, "selectedQuestion:", selectedQuestion);
                            }}
                        >
                            <div className="ml-1">
                                <p className={`text-white/90 ${
                                    q_index === selectedQuestion ? "text-green-400 font-medium" : ""
                                }`}>
                                    {question.question}
                                </p>
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
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProtocolPanel