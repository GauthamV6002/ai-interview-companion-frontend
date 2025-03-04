type FeedbackResponse = {
    evaluation: "good" | "neutral" | "bad"; // Was the question good, neutral, or bad?
    keywords: string; // 2-3 keywords summarizing the judgment, comma-separated. Must be keywords, not a sentence.
    tip: string; // Actionable tip, if needed, within 15 words
    feedbackFor: "interviewer" | "interviewee"; // Whether the feedback is for the interviewer or the interviewee, based on whether a question was asked or answered
}

type FollowUpResponse = string;

type RephraseResponse = string;



type TaskResponse = FeedbackResponse | FollowUpResponse | RephraseResponse;



type TaskType = "feedback" | "follow-up" | "rephrase";


type ModelResponse = {
    task: TaskType;
    response: TaskResponse;
}

export { TaskResponse, FeedbackResponse, FollowUpResponse, RephraseResponse, TaskType, ModelResponse };