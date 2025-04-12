type FeedbackResponse = 
  | {
      feedbackFor: "interviewer";
      evaluation: "good" | "warning";
      feedback: string;
    }
  | {
      feedbackFor: "interviewee";
      evaluation: "protocol question" | "follow-up" | "other";
      feedback: string;
    };

type EvaluationResponse =
  | {
    evaluation: "good" | "warning";
    explanation: string;
    }

type SuggestResponse = 
  | {
      suggestion: "protocol question" | "follow-up" | "other";
      explanation: string;
    }



type TaskResponse = FeedbackResponse | EvaluationResponse | SuggestResponse;



type TaskType = "feedback" | "evaluation" | "suggestion";


type ModelResponse = {
    task: TaskType;
    response: TaskResponse;
}

export { TaskResponse, FeedbackResponse, EvaluationResponse, SuggestResponse, TaskType, ModelResponse };