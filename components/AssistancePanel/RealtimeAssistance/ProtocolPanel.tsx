import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Protocol } from '@/types/Protocol';
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Props = {
    sessionProtocol: Protocol;
    selectedQuestion: number;
    setSelectedQuestion: (question: number) => void;
    configurationMode: string|null;
}

const ProtocolPanel = ({ sessionProtocol, selectedQuestion, setSelectedQuestion, configurationMode }: Props) => {
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

    const toggleQuestion = (index: number) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const isQuestionExpanded = (index: number) => {
        return expandedQuestions.has(index);
    };

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
                                // Use setTimeout to log after state update
                                setTimeout(() => {
                                    console.log("Question clicked - q_index:", q_index, "new selectedQuestion:", q_index);
                                }, 0);
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div className="ml-1 flex-1">
                                    <p className={`${
                                        q_index === selectedQuestion 
                                            ? "text-green-400 font-medium" 
                                            : "text-white/90"
                                    }`}>
                                        {question.question}
                                    </p>
                                </div>
                                {question.feedback && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleQuestion(q_index);
                                        }}
                                        className="text-white/60 hover:text-white/90 transition-colors"
                                    >
                                        {isQuestionExpanded(q_index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                )}
                            </div>

                            {/* Display feedback if available and expanded */}
                            {question.feedback && isQuestionExpanded(q_index) && (
                                <div className="flex flex-col gap-2 mt-2">
                                    {configurationMode === 'interactive' && (
                                        <div className="flex flex-col gap-2">
                                            {question.feedback.summary.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium text-blue-400">Summary</div>
                                                    <ul className="list-disc pl-4 text-sm text-white/90">
                                                        {question.feedback.summary.map((item, index) => (
                                                            <li key={index}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {question.feedback.informationGap && (
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium text-purple-400">Information Gap</div>
                                                    {Array.isArray(question.feedback.informationGap) ? (
                                                        <ul className="list-disc pl-4 text-sm text-white/90">
                                                            {question.feedback.informationGap.map((item, index) => (
                                                                <li key={index}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-sm text-white/90">{question.feedback.informationGap}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {configurationMode === 'responsive' && (
                                        <div className="flex flex-col gap-2">
                                            {question.feedback.informationGap && (
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium text-purple-400">Information Gap</div>
                                                    {Array.isArray(question.feedback.informationGap) ? (
                                                        <ul className="list-disc pl-4 text-sm text-white/90">
                                                            {question.feedback.informationGap.map((item, index) => (
                                                                <li key={index}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-sm text-white/90">{question.feedback.informationGap}</div>
                                                    )}
                                                </div>
                                            )}
                                            {question.feedback.followUp && (
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium text-orange-400">Follow-up Suggestion</div>
                                                    <div className="text-sm text-white/90">{question.feedback.followUp}</div>
                                                </div>
                                            )}
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