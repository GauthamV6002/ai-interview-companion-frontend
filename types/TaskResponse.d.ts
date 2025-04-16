// type FeedbackResponse = {
//     evaluation: "good" | "neutral" | "bad"; // Was the question good, neutral, or bad?
//     keywords: string; // 2-3 keywords summarizing the judgment, comma-separated. Must be keywords, not a sentence.
//     tip: string; // Actionable tip, if needed, within 15 words
//     feedbackFor: "interviewer" | "interviewee"; // Whether the feedback is for the interviewer or the interviewee, based on whether a question was asked or answered
// }

type FeedbackResponse = 
  | {
      feedbackFor: "interviewer";
      evaluation: "good" | "warning";
      keywords: string;
      tip: string;
    }
  | {
      feedbackFor: "interviewee";
      evaluation: "good" | "warning" | "probing";
      keywords: string;
      tip: string;
    };

type FollowUpResponse = string;

type RephraseResponse = string;

type AnalysisResponse = {
  summary: string[];
  informationGap: string;
};

type TaskResponse = FeedbackResponse | FollowUpResponse | RephraseResponse | AnalysisResponse;

type TaskType = "feedback" | "follow-up" | "rephrase" | "analysis";

type ModelResponse = {
    task: TaskType;
    response: TaskResponse;
}

export { TaskResponse, FeedbackResponse, FollowUpResponse, RephraseResponse, AnalysisResponse, TaskType, ModelResponse };