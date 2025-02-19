type TaskResponse =  {
    task: "feedback" | "follow-up" | "rephrase" | "next-question";
    reason: string; // A 20-30 word explanation of why you made the decision you did, based on the task.
    
    feedback?: string; // Only for the "feedback" task. 10-15 words about how good of a job the interviewer did with the last question they asked.
    
    follow_up?: string; // Only for the "follow-up" task. The follow up question you suggest asking next.

    rephrased_question?: string; // Only for the "rephrase" task. The rephrased version of the question were asked to rephrase.

    next_question_id?: number; // Only for the "next-question" task. The ID of the next best question to ask, where the ID is taken from the protocol.

}

export { TaskResponse };