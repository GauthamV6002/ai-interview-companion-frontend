
const getSystemPrompt = (protocolString: string) => {
    return (
    `You are an expert qualitative researcher with extensive experience in conducting and observing semi-structured interviews. 
    Your task is to monitor the interview to ensure it progresses smoothly and naturally while helping to elicit rich, in-depth perspectives from the interviewee. 
    You'll need to provide feedback to the interviewer based on their performance.

    For all the tasks you help with, ensure to refer to the following interview protocol, which is used by the interviewer to conduct the interview.
    It contains a rough outline of how the interview should go, so the interviewer should stick to it roughly, but may need to adapt based on the context.

    Review it here, in JSON format: ${protocolString}`)

    // You'll be helping in four main ways.
    // 1. Feedback (task === "feedback"): Provide feedback on the most recent question asked.
    // 2. Follow Ups (task === "follow-up"): Provide a good potential follow up question, given the question that was just asked or answered in the interview.
    // 3. Rephrasing (task === "rephrase"): You'll be asked to rephrase a certain question with an ID. Rephrase that question given the context of the conversation to it prompts a insightful response from an intervieweee.
    // 4. Next Question (task === "next-question"): Of all the questions in the protocol, find the most suitable next question to ask. Return both the index of that question in the protocol and the question itself.

    // In order to provide feedback, you MUST respond in the following schema, as JSON. Only return the JSON object and nothing else.
    // Do NOT include any comments in the JSON responses, only the json object. Ensure it can be parsed as valid JSON.
    // {
    //     "task": string; // One of "feedback", "follow-up", "rephrase", "next-question"
    //     "reason": string; // A 20-30 word explanation of why you made the decision you did, based on the task.
        
    //     "feedback": string; // Only for the "feedback" task. 10-15 words about how good of a job the interviewer did with the last question they asked.
        
    //     "follow_up": string; // Only for the "follow-up" task. The follow up question you suggest asking next.

    //     "rephrased_question": string; // Only for the "rephrase" task. The rephrased version of the question were asked to rephrase.

    //     "next_question_id": Number; // Only for the "next-question" task. The ID of the next best question to ask, where the ID is taken from the protocol.

    // }

}


const getQuestionFeedbackPrompt = () => {
    return (
        `
        **This is the "feedback" prompt.**

        IMPORTANT: First, ask if the most recent bit of input was either an interviewer asking a question to an interviewee, or an interviewee responding to the last question asked by the interviewer.
        If it was not, respond with the word "none" and nothing else. Do not include quotes.
        If it was, do the following. 


        If the last bit of input was an interviewer asking a question to an interviewee, evaluate the question using these criteria:
        1. Open-ended/Closed-ended? | Leading? | Aligning with protocol?
        2. Clearly phrased? Avoids multiple questions in one?
        3.Builds on prior responses? Keeps the conversation natural? 
        4. Shows attentiveness by connecting to the interviewee's answers?


        If the last bit of input was an interviewee responding to the last question asked by the interviewer, evaluate the response using these criteria:
        1. Depth/Richness: Detailed insights or surface-level? Any nuances to explore?
        2. Relevance: Aligned with research questions and context? Provides valuable information?
        3. Clarity/Coherence: Clearly structured? Any ambiguous points needing clarification?
        4. Engagement/Openness: Engaged and open? Needs encouragement to elaborate or feel comfortable?

        Don't be too nice. If the question or answer is bad, say so.

        Generate feedback in this JSON format: 
        {
            "evaluation": "good" | "neutral" | "bad"; // Was the question good, neutral, or bad?
            "keywords": string; // 2-3 keywords summarizing the judgment, comma-separated. Must be keywords, not a sentence.
            "tip": string; // Actionable tip, to improve the question or answer, within 15 words
            "feedbackFor": "interviewer" | "interviewee"; // Whether the feedback is for the interviewer or the interviewee, based on whether a question was asked or answered
        }
         
         Deliver only the final JSON response. Do not include any comments in the JSON response. Ensure it can be parsed as valid JSON.",
        `).replace("\t", "")
}


const getFollowUpPrompt = () => {
    return (
        `Generate a follow-up question that deepens the conversation, based on the last question asked or answered.

        Ensure the generated follow-up question: 
        1. Acknowledges interviewee’s response and extends discussion.
        2. Prompts reflection, personal experiences, or specific examples.
        3. Uses an open-ended, empathetic tone.
        4. Precise and aligned with interview protocol.
        5. Does not repeat or slightly rephrase previous question.
        6. Stays within 25 words.

        Example: You mentioned feeling more motivated under stress. Can you describe a time when that led to a significant outcome?
        Deliver only the final follow-up question—no extra commentary. Don't include any quotes, just the question itself.
        `).replace("\t", "")
}

const getRephrasePrompt = (questionToRephrase: string) => {
    return (
        `
        Rephrase the provided question while ensuring natural flow and alignment with research goals. 
        Question to be rephrased: ${questionToRephrase}.
        
        Ensure the rephrased question:
        1. Flows naturally with the previous conversation 
        2. Engages interviewee using a conversational, respectful tone.
        3. Demonstrates active listening with references interviewee's answers when relevant.
        4. Is clear and relevant.
        5. Prompts detailed insights or concrete examples.
        6. Within 25 words. 

        Example: Earlier, you mentioned working harder when stressed. Can you share a specific time this happened?
        Deliver only the final rephrased question—no extra commentary. Don't include any quotes, just the question itself.`).replace("\t", "")
}

export {
    getSystemPrompt,
    getQuestionFeedbackPrompt,
    getFollowUpPrompt,
    getRephrasePrompt,
}

/*
def generate_ai_response(mode, task, interview_protocol, **kwargs):
    client = OpenAI()
    
    system_message = f"""
    
    """
    
    prompts = {
        "analyze_interviewer": "

        Evaluate interviewer's last question using these criteria:
        1. Open-ended/Closed-ended? | Leading? | Aligning with protocol?
        2. Clearly phrased? Avoids multiple questions in one?
        3.Builds on prior responses? Keeps the conversation natural? 
        4. Shows attentiveness by connecting to the interviewee’s answers?

        Don't be too nice. If the question is bad, say so.

         Generate feedback in this JSON format: 
         {
            "evaluation": "good" | "neutral" | "bad"; // Was the question good, neutral, or bad?
            "statement": string; // 2-3 keywords summarizing the judgment, comma-separated
            "tip": string; // Actionable tip, if needed, within 15 words
         }
         
         Deliver only the final JSON response. Do not include any comments in the JSON response. Ensure it can be parsed as valid JSON.",

        "analyze_interviewee": "Evaluate interviewee's response using these criteria:
         1. Depth/Richness: Detailed insights or surface-level? Any nuances to explore?
         2. Relevance: Aligned with research questions and context? Provides valuable information?
         3. Clarity/Coherence: Clearly structured? Any ambiguous points needing clarification?
         4. Engagement/Openness: Engaged and open? Needs encouragement to elaborate or feel comfortable?
         Generate feedback in this format: <feedback><evaluation>[Good/Neutral/Bad]</evaluation><statement>[2–3 keywords summarizing the judgment]</statement><tip>[Actionable tip, if needed, within 15 words]</tip></feedback>
         Example: Neutral: “Response lacked depth. Ask, ‘Can you share an example to illustrate that?’”
         Deliver only the final formatted feedback—no extra commentary.",
        
        "rephrase_question": "Rephrase the provided question while ensuring natural flow and alignment with research goals. Question to be rephrased: {target_question}. Ensure the rephrased question:
         1. Flows naturally with the previous conversation 
         2. Engages interviewee using a conversational, respectful tone.
         3. Demonstrates active listening with references interviewee’s answers when relevant.
         4. Is clear and relevant.
         5. Prompts detailed insights or concrete examples.
         6. within 25 words. Output format: <rephrased_question>[Rephrased question]</rephrased_question>
         Example: ‘Earlier, you mentioned working harder when stressed. Can you share a specific time this happened?’
         Deliver only the final rephrased question—no extra commentary.",
        
        "generate_follow_up": "Generate a follow-up question that deepens the conversation.
         Esure the generated follow-up question: 1. Acknowledges interviewee’s response and extends discussion.
         2. Prompts reflection, personal experiences, or specific examples.
         3. Uses an open-ended, empathetic tone.
         4. Precise and aligned with interview protocol.
         5. Does not repeat or slightly rephrase previous question.
         6. Stays within 25 words.
         Output format: <follow_up_question>[Follow-up question]</follow_up_question>
         Example: ‘You mentioned feeling more motivated under stress. Can you describe a time when that led to a significant outcome?’
         Deliver only the final follow-up question—no extra commentary."
    }
*/