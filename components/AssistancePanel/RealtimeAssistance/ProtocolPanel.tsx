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
        <div className="h-full flex flex-col gap-2 box-border overflow-y-scroll pr-2">
            {/* Completed label */}
            <div className="flex items-center gap-2 mb-2 pl-2">
                <div className="w-16 flex items-center justify-center">
                    <p className="text-xs text-white/60 whitespace-nowrap">Completed</p>
                </div>
            </div>

            {sessionProtocol.map((question, q_index) => (
                <div key={q_index} className="flex gap-2 pl-2">
                    {/* Checkbox column */}
                    <div className="w-16 flex items-center justify-center">
                        <Checkbox 
                            className='size-6' 
                        />
                    </div>

                    {/* Question block */}
                    <div className="relative flex-1 pr-2">
                        {/* Current Question indicator */}
                        {q_index === selectedQuestion && (
                            <div className="absolute -top-3 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Current Question
                            </div>
                        )}
                        
                        <Card
                            className={`p-3 flex flex-col justify-start gap-2 hover:cursor-pointer transition-all duration-200 ${
                                q_index === selectedQuestion 
                                    ? "border-[3px] border-green-500 bg-green-500/30 shadow-lg shadow-green-500/20" 
                                    : "border border-gray-700"
                            }`}
                            onClick={() => {
                                setSelectedQuestion(q_index);
                                console.log("Question clicked - q_index:", q_index, "selectedQuestion:", selectedQuestion);
                            }}
                        >
                            <div className="ml-1">
                                <p className={`${
                                    q_index === selectedQuestion 
                                        ? "text-green-400 font-medium" 
                                        : "text-white/90"
                                }`}>
                                    {question.question}
                                </p>
                            </div>

                            {/* Display feedback if available */}
                            {question.feedback && (
                                <div className="mt-2 p-2 bg-gray-800 rounded-md">
                                    {configurationMode === 'interactive' ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <div className="mb-2">
                                            <p className="text-sm font-semibold text-blue-400">Information Gap:</p>
                                            <p className="text-sm text-white/80">{question.feedback.informationGap}</p>
                                        </div>
                                    )}
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