import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ModelResponse, FeedbackResponse, EvaluationResponse, SuggestResponse } from '@/types/TaskResponse';
import { ChevronLeft, ChevronRight, MessageSquarePlus, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react'

type Props = {
    responseInProgress: boolean;
    modelResponses: ModelResponse[];
}


const FeedbackDisplay = ({ feedback, responseInProgress }: { feedback: FeedbackResponse, responseInProgress: boolean }) => {

    const getEvalColoredDot = (evaluation: string) => {
        if (evaluation === "good") return <div className='size-[6px] mt-1 bg-green-500 rounded-full'></div>;
        if (evaluation === "warning") return <div className='size-[6px] mt-1 bg-yellow-500 rounded-full'></div>;
        if (["main question", "follow-up", "other"].includes(evaluation))
            return <div className='size-[6px] mt-1 bg-blue-500 rounded-full'></div>;
        return <div className='size-[6px] mt-1 bg-gray-500 rounded-full'></div>;
    };

    const getEvalColor = (evaluation: string) => {
        if (evaluation === "good") return "lightgreen";
        if (evaluation === "warning") return "goldenrod";
        if (["main question", "follow-up", "other"].includes(evaluation)) return "lightblue";
        return "lightgray";
    };

    return (
        <div className='flex gap-2'>
            <div className='flex flex-col items-center justify-center gap-2 text-center w-fit'>
                <svg className='size-8 w-fit' fill={getEvalColor(feedback.evaluation)} viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>OpenAI icon</title><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" /></svg>
                <p style={{color: getEvalColor(feedback.evaluation)}}  className='text-xs w-fit'>{feedback.feedbackFor === "interviewer" ? "QUESTION FEEDBACK" : feedback.evaluation.toUpperCase()}</p>
            </div>

            <div className='w-[1px] bg-white/40'></div>

            <div className='flex flex-col justify-center gap-2 ml-2'>
                {feedback.feedbackFor === 'interviewer' && (
                    <div className='flex gap-2 items-center justify-start'>
                        <div style={{color: getEvalColor(feedback.evaluation)}} className='flex items-center justify-center gap-1'>
                            {getEvalColoredDot(feedback.evaluation)} {feedback.evaluation.charAt(0).toUpperCase() + feedback.evaluation.slice(1)}
                        </div>
                        <p>|</p>
                    </div>
                )}
                <p className=''>{feedback.feedback}</p>
            </div>
        </div>
    );
};


const EvaluationDisplay = ({ evaluation, responseInProgress }: { evaluation: EvaluationResponse, responseInProgress: boolean }) => {
    const getEvalColoredDot = (evaluation: string) => {
        if (evaluation === "good") return <div className='size-[6px] mt-1 bg-green-500 rounded-full'></div>;
        if (evaluation === "warning") return <div className='size-[6px] mt-1 bg-yellow-500 rounded-full'></div>;
        return <div className='size-[6px] mt-1 bg-gray-500 rounded-full'></div>;
    };

    const getEvalColor = (evaluation: string) => {
        if (evaluation === "good") return "lightgreen";
        if (evaluation === "warning") return "goldenrod";
        return "lightgray";
    };

    return (
        <div className='flex gap-2'>
            {/* Evaluation Icon Section */}
            <div className='flex flex-col items-center justify-center gap-2 text-center w-fit'>
                <svg className='size-8 w-fit' fill={getEvalColor(evaluation.evaluation)} viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
                    <title>OpenAI icon</title>
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                </svg>
                <p style={{color: getEvalColor(evaluation.evaluation)}} className='text-xs w-fit'>
                    EVALUATION
                </p>
            </div>

            <div className='w-[1px] bg-white/40'></div>

            {/* Evaluation and Explanation Section */}
            <div className='flex flex-col justify-center gap-2 ml-2'>
                <div className='flex gap-2 items-center justify-start'>
                    <div style={{color: getEvalColor(evaluation.evaluation)}} className='flex items-center justify-center gap-1'>{getEvalColoredDot(evaluation.evaluation)} {evaluation.evaluation.charAt(0).toUpperCase() + evaluation.evaluation.slice(1)}</div>
                    <p>|</p>
                    <p className=''>{evaluation.explanation}</p>
                </div>
            </div>
        </div>
    );
};

// const EvaluationDisplay = ({ evaluation, responseInProgress }: { evaluation: EvaluationResponse, responseInProgress: boolean }) => {
//     return (
//         <div className='flex gap-4 items-start'>
//             {/* Evaluation Icon Section */}
//             <div className='flex flex-col items-center justify-center gap-2 text-center'>
//                 <MessageSquarePlus className='size-8 w-fit text-blue-400' />
//                 <p className='text-xs w-fit text-blue-400'>Evaluation</p>
//             </div>

//             <div className='w-[1px] bg-white/40'></div>

//             {/* Evaluation and Explanation Section */}
//             <div className='flex flex-col gap-2 ml-4'>
//                 <p className='text-[1.1rem] font-semibold text-gray-800'>{evaluation.evaluation}</p>
//                 <p className='text-[1rem] text-gray-600 leading-relaxed'>{evaluation.explanation}</p>
//             </div>
//         </div>
//     );
// };

const SuggestDisplay = ({ suggestion, responseInProgress }: { suggestion: SuggestResponse, responseInProgress: boolean }) => {
    return (
        <div className='flex gap-2'>
            <div className='flex flex-col items-center justify-center gap-2 text-center w-fit'>
                <RefreshCw className='size-8 w-fit text-blue-400' />
                <p className='text-xs w-fit text-blue-400'>SUGGESTION</p>

            </div>

            <div className='w-[1px] bg-white/40'></div>

            <div className='flex flex-col justify-center gap-2 ml-2'>
                <p className='text-[1.1rem]'>{suggestion.suggestion}</p>
                <p className='text-[1.1rem]'>{suggestion.explanation}</p>
            </div>
        </div>
    )
}

const ResponsePanel = ({ responseInProgress, modelResponses }: Props) => {
    const [currentResponseIndex, setCurrentResponseIndex] = useState<number>(0);

    useEffect(() => {
        if (modelResponses.length > 0) {
            setCurrentResponseIndex(modelResponses.length - 1);
        }
    }, [modelResponses]);

    const handlePrevious = () => {
        setCurrentResponseIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handleNext = () => {
        setCurrentResponseIndex((prevIndex) => Math.min(prevIndex + 1, modelResponses.length - 1));
    };

    const currentResponse = modelResponses[currentResponseIndex];

    const renderResponse = () => {
        switch (currentResponse?.task) {
            case 'feedback':
                return <FeedbackDisplay feedback={currentResponse.response as FeedbackResponse} responseInProgress={responseInProgress} />;
            case 'evaluation':
                return <EvaluationDisplay evaluation={currentResponse.response as EvaluationResponse} responseInProgress={responseInProgress} />;
            case 'suggestion':
                return <SuggestDisplay suggestion={currentResponse.response as SuggestResponse} responseInProgress={responseInProgress} />;
            default:
                return (
                    <div className='flex gap-2'>
                        <div className='flex flex-row gap-2 items-center justify-start'>
                            <svg className='size-8' fill="white" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>OpenAI icon</title><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" /></svg>
                            <p className='text-lg'>AI Feedback will appear once you start the session.</p>
                        </div>
                    </div>
                );
        }
    };

    //get color based on modelResponseType function
    const getColor = (modelResponseType: string) => {
        if (modelResponseType === "feedback") return "lightgreen";
        if (modelResponseType === "evaluation") return "lightblue";
        if (modelResponseType === "suggestion") return "orange";
        // if (modelResponseType === "next-question") return "coral";
        return "lightgray";
    }

    return (
        <Card className='p-4 mt-4 flex gap-2 items-center justify-start relative'>
            {renderResponse()}
            {
                modelResponses.length > 0 && (
                    <div className="flex justify-end items-center gap-1 absolute right-2 bottom-1">
                        <ChevronLeft
                            className="h-4 w-4 hover:scale-125 transition-transform cursor-pointer"
                            onClick={handlePrevious}
                            style={{ opacity: currentResponseIndex === 0 ? 0.3 : 0.7 }}
                        />
                        <span className="mb-1 text-white/70">{currentResponseIndex + 1}/{modelResponses.length}</span>
                        <ChevronRight
                            className="h-4 w-4 hover:scale-125 transition-transform cursor-pointer"
                            onClick={handleNext}
                            style={{ opacity: currentResponseIndex === modelResponses.length - 1 ? 0.5 : 0.7 }}
                        />
                    </div>
                )
            }
        </Card>
    )
}

export default ResponsePanel
