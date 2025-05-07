const getSystemPrompt = (protocolString: string) => {
    return (
    `You are an expert qualitative researcher with extensive experience in conducting and observing semi-structured interviews. 
    Your task is to monitor the interview to ensure it progresses smoothly and naturally while helping to elicit rich, in-depth perspectives from the interviewee. 
    You'll need to provide feedback and assistance to the interviewer based on their performance and requests.

    For all the tasks you help with, ensure to refer to the following interview protocol for the overall research objective, which is used by the interviewer to conduct the interview.
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
const getAIAnalysisPrompt = (protocolString: string, currentQuestion: string, currentInformation: string) => {
    return (
        `
        You are assisting an interviewer conducting an interview based on a predefined protocol provided in JSON format: ${protocolString}. The protocol includes a rough outline of questions or topics to cover, indicating the overall research objective. The interviewer should generally follow this outline but may adapt based on context.

        Your task is to analyze the interviewee’s latest answer using the protocol’s questions or topics, the current target question, and the existing information. The current target question is: ${currentQuestion}. Existing information collected for this question is: ${currentInformation}, which may be empty. 
        
        Provide the following feedback to the interviewer in JSON format:
   
        1. Summary
        - Extract 0 to 3 key pieces of new information from the latest answer.
        - Each piece must be a keyword or short phrase (max 10 words).
        - Include only content relevant to the target question and protocol’s questions/topics.
        - Exclude information already in the existing information summary.

        2. Information Gap Analysis

        - Assess what’s missing, unclear, or worth exploring further based on the protocol, target question, and existing information.
        - If any gaps exist, or anything worth exploring further, provide 1 to 2 keywords or short phrases (max 10 words each), each describing a distinct gap or a probeable aspect of the interviewee's answer.
        - If no gaps remain and nothing worth exploring further, use an empty array [].
        - As you are expected to support the interviewers to collect richer and more insightful information, you must be careful when providing information gap analysis as empty array.

        3. Follow-up Suggestion

        - If gaps exist, or anything worth exploring further, suggest a follow-up question (max 15 words) to explore the gaps.
        - If no gaps remain and nothing worth exploring further, state "Proceed to the next question."

        Summary must reflect new, relevant information only.
        Information gap analysis must align with protocol, target question, and existing information.
        Follow-up suggestion must aim to collect more information about the gaps if they exist.
        
        Provide feedback in this JSON format:
        {
        "summary": [
            "keyword/phrase 1",
            "keyword/phrase 2",
            "keyword/phrase 3"
        ], // An array of up to 3 strings. Use fewer if less information is relevant.
        "informationGap": [
            "keyword/phrase 1",
            "keyword/phrase 2"
        ], // An array of up to 2 strings. Use fewer if fewer information gaps are found.
        "followUp": string // A ready-to-use follow-up question within 15 words or "Proceed to the next protocol question".
        }

        Deliver only the JSON response, without comments or rationale.
        Ensure the response is valid JSON.
        ,
        `).replace("\t", "")
}

const getAIFeedbackPrompt = (protocolString: string, currentQuestion: string, currentInformation: string) => {
    return (
        `
        You are assisting an interviewer conducting an interview based on a predefined protocol provided in JSON format: ${protocolString}. The protocol includes a rough outline of questions or topics to cover, indicating the overall research objective. The interviewer should generally follow this outline but may adapt based on context.

        Your task is to analyze the interviewee’s latest answer using the protocol’s questions or topics, the current target question, and the existing information. The current target question is: ${currentQuestion}. Existing information collected for this question is: ${currentInformation}, which may be empty. Based on your analysis, you must provide feedback to the interviewer to help them collect richer and more insightful information.

        Therefore, during the conversation, for each input:
        - If the speaker pauses and then continues speaking, you must respond only with "none".
        - If you confirm the speaker has finished speaking, you must check whether the most recent message is part of the interview conversation. If not, you must respond only with "none".
        - If you confirm the speaker has finished speaking, you must check whether the most recent message is from the interviewer asking a question to the interviewee. If so, you must respond only with "none".
        - Only if you confirm the speaker has finished speaking, and the most recent message is the interviewee responding to the last question asked by the interviewer, you should provide feedback in the following JSON format:

        1. Summary
        - Extract 0 to 3 key pieces of new information from the latest answer.
        - Each piece must be a keyword or short phrase (max 10 words).
        - Include only content relevant to the target question and protocol’s questions/topics.
        - Exclude information already in the existing information summary.

        2. Information Gap Analysis

        - Assess what’s missing, unclear, or worth exploring further based on the protocol, target question, and existing information.
        - If gaps exist, or anything worth exploring further, provide 1 to 2 keywords or short phrases (max 10 words each), each describing a distinct gap or a probeable aspect of the interviewee's answer.
        - If no gaps remain and nothing worth exploring further, use an empty array [].

        3. Follow-up Suggestion

        - If gaps exist, or anything worth exploring further, suggest a follow-up question (max 15 words) to explore the gaps.
        - If no gaps remain and nothing worth exploring further, state "Proceed to the next question."
        - As you are expected to support the interviewers to collect richer and more insightful information, you must be careful when providing follow-up suggestion as "Proceed to the next question."

        Summary must reflect new, relevant information only.
        Information gap analysis must align with protocol, target question, and existing information.
        Follow-up suggestion must aim to collect more information about the gaps if they exist.

        Provide the feedback in this JSON format: {
        "summary": [
            "keyword/phrase 1",
            "keyword/phrase 2",
            "keyword/phrase 3"
        ], // An array of up to 3 strings. Use fewer if less information is relevant.
        "informationGap": [
            "keyword/phrase 1",
            "keyword/phrase 2"
        ], // An array of up to 2 strings. Use fewer if fewer information gaps are found.
        "followUp": string // A ready-to-use follow-up question within 15 words or "Proceed to the next protocol question".
        }

        Deliver only the JSON response, without comments or rationale.
        Ensure the response is valid JSON.
        `).replace("\t", "")
}


const getNextStepPrompt = () => {
    return (
        `Generate a follow-up question that deepens the conversation, based on the last question asked or answered.

        Ensure the generated follow-up question: 
        1. Acknowledges interviewee's response and extends discussion.
        2. Prompts reflection, personal experiences, or specific examples.
        3. Uses an open-ended, empathetic tone.
        4. Precise and aligned with interview protocol.
        5. Does not repeat or slightly rephrase previous question.
        6. Stays within 25 words.

        Example: You mentioned feeling more motivated under stress. Can you describe a time when that led to a significant outcome?
        Deliver only the final follow-up question—no extra commentary. Don't include any quotes, just the question itself.
        `).replace("\t", "")
}

const getEvaluationPrompt = (questionToRephrase: string) => {
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
    getAIAnalysisPrompt,
    getAIFeedbackPrompt,
    getNextStepPrompt,
    getEvaluationPrompt,
}

/*
Function 1: Assess and Provide Feedback on the Interviewer's Question
Prompt:
"Analyze the following question asked by the interviewer in the context of a semi-structured research interview: '[Insert Question]'. Provide open-ended feedback on its effectiveness, highlighting strengths and areas for improvement. Explain the rationale behind your feedback to help the interviewer refine their questioning skills. Evaluate factors such as clarity, relevance to the research objectives, ability to elicit rich responses, and avoidance of leading or biased phrasing."
Function 2: Suggest a Suitable Next Response
Prompt:
"Based on the current state of the interview, including the previous questions and responses, suggest an appropriate next step for the interviewer. This could be the next main question, a follow-up question, or another response type (e.g., probing for detail or shifting topics). Provide a clear suggestion and explain the reasoning behind it, considering the conversation's flow and the research goals."
Function 1: Assess and Provide Feedback on the Interviewer's Question
Prompt:
"Evaluate the following question asked by the interviewer in a semi-structured research interview: '[Insert Question]'. Provide concise, closed-ended feedback indicating its effectiveness. Use a simple rating (e.g., 'Effective' or 'Needs Improvement') or a brief statement (e.g., 'Well-phrased' or 'Too broad'). Do not include rationale or detailed explanation."
Function 2: Suggest a Suitable Next Response
Prompt:
"Based on the current state of the interview, suggest a straightforward next response for the interviewer. This could be the next main question, a follow-up question, or another type of response. Provide the suggestion without any explanation or reasoning."
*/



/*




const getSystemPrompt = (protocolString: string) => {
    return (
    `You are an expert qualitative researcher with extensive experience in conducting and observing semi-structured interviews. 
    Your task is to monitor the interview and provide assistance to ensure it progresses smoothly and naturally while helping to elicit rich, in-depth perspectives from the interviewee. 

    For all the tasks you help with, ensure to refer to the following interview protocol for the overall research objective, which is used by the interviewer to conduct the interview.
    It contains a rough outline of how the interview should go, so the interviewer should stick to it roughly, but may need to adapt based on the context.

    Review it here, in JSON format: ${protocolString}`)

}
*/

/*
const getAIFeedbackPrompt = (protocolString: string) => {
    return (
        `
        AS a context, this is the interview protocol in JSON format: ${protocolString}.
        Refer to it for the overall research objective, which is used by the interviewer to conduct the interview. It contains a rough outline of how the interview should go, so the interviewer should stick to it roughly, but may need to adapt based on the context.

        During the conversation, when receiving an input, determine if the person has finished speaking. If not, respond only with the word "none" and nothing else. You need to wait for the person to finish speaking before you can provide any feedback.

        Once you confirm the person has finished speaking, determine whether the most recent bit of input was either from an interviewer, or an interviewee.
        If neither, respond only with the word "none" and nothing else.
        
        If the last bit of input was not related to the interview, respond only with the word "none" and nothing else.        

        If the last bit of input was an interviewer asking a question to an interviewee, evaluate the question whether has any issues using these criteria:
        1. Closed-ended? | Leading? | Not aligning with protocol?
        2. Not clearly phrased? Multiple questions in one?
        Provide concise, closed-ended feedback. Do not include rationale or detailed explanation.

        Generate feedback in this JSON format: 
        {
            "evaluation": "good" | "warning"; // For questions: "good" if well-formed, "warning" if issues are found  
            "feedback": string; // 2-3 keywords summarizing the judgment, comma-separated. Must be keywords, not a sentence. If "warning", add a ready-to-use rephrased question within 15 words.
            "feedbackFor": "interviewer";  
        }

        If the last bit of input was an interviewee responding to the last question asked by the interviewer, suggest a ready-to-use response for the interviewer to use next. You must make sure your suggestion aligns with the conversation flow, interview protocol, and the research goal. This could be a protocol question, a follow-up question, or another type of response. If the suggestion is a protocol question, you must select an unasked question from the protocol. Provide the suggested response without any explanation or reasoning.

        Generate feedback in this JSON format: 
        {
            "evaluation": "protocol question" | "follow-up" | "other"; //
            "feedback": string; // A ready-to-use suggested response within 15 words.
            "feedbackFor": "interviewee";
        }
         
         Deliver only the final JSON response. Do not include any comments, quotes, rationale in the JSON response. Ensure it can be parsed as valid JSON.",
        `).replace("\t", "")
}


const getNextStepPrompt = (protocolString: string) => {
    return (
        `
        AS a context, this is the interview protocol in JSON format: ${protocolString}.
        Refer to it for the overall research objective, which is used by the interviewer to conduct the interview. It contains a rough outline of how the interview should go, so the interviewer should stick to it roughly, but may need to adapt based on the context.

        During the conversation, when receiving an input, determine whether the most recent bit of input was either an interviewer asking a question to an interviewee, or an interviewee responding to the last question asked by the interviewer.

        If the last bit of input was an interviewer asking a question to an interviewee, evaluate the question whether has any issues using these criteria:
        1. Closed-ended? | Leading? | Not aligning with protocol?
        2. Not clearly phrased? Multiple questions in one?
        Provide concise, open-ended feedback with a detailed explanation within 15 words. Do not provide any ready-to-use responses directly to the interviewer.

        Generate feedback in this JSON format: 
        {
            "evaluation": "good" | "warning"; // For questions: "good" if well-formed, "warning" if issues are found  
            "feedback": string; // A concise explanation about the evaluation within 15 words.
            "feedbackFor": "interviewer";  
        }

        If the last bit of input was an interviewee responding to the last question asked by the interviewer, suggest an appropriate next step for the interviewer. You must make sure your suggestion aligns with the conversation flow, interview protocol, and the research goal. This could be a protocol question, a follow-up question, or another type of response. If the suggestion is a protocol question, you must select an unasked question from the protocol.
        Provide a concise explanation about the suggestion within 15 words. Do not provide a ready-to-use response directly to the interviewer.

        Generate feedback in this JSON format: 
        {
            "evaluation": "protocol question" | "follow-up" | "other"; //
            "feedback": string; // A concise explanation about the suggestion within 15 words.
            "feedbackFor": "interviewee";
        }
         
         Deliver only the final JSON response. Do not include any comments, quotes, rationale in the JSON response. Ensure it can be parsed as valid JSON.",
        `).replace("\t", "")
}

const getEvaluationPrompt = () => {
    return (
        `
        Evaluate the last question asked by the interviewer whether it has any issues using these criteria:
        1. Closed-ended? | Leading? | Not aligning with protocol?
        2. Not clearly phrased? Multiple questions in one?

        Provide a concise explanation about the evaluation within 15 words. Do not provide any rephrased ready-to-use questions directly to the interviewer.

        Generate feedback in this JSON format: 
        {
            "evaluation": "good" | "warning"; // For questions: "good" if well-formed, "warning" if issues are found.
            "explanation": string; // An open-ended explanation about the suggestion within 15 words.
        }`).replace("\t", "")
}

export {
    getSystemPrompt,
    getAIAnalysisPrompt,
    getAIFeedbackPrompt,
    getNextStepPrompt,
    getEvaluationPrompt,
}

    //    `According to the interviewee's response to the last question asked by the interviewer, suggest an appropriate next step for the interviewer. This could be the next main question, a follow-up question, or another type of response.

    //     In additon to the suggested next step, provide a concise explanation about the suggestion within 15 words.Do not provide a ready-to-use response directly to the interviewer.
        
    //     Your explanation may consider the following criteria: 
    //     1. Acknowledges interviewee's response and extends discussion?
    //     2. Align with the conversation flow, interview protocol, and the research goal?
    //     3. Not repeat previous question?

    //     Generate feedback in this JSON format: 
    //     {
    //         "suggestion": "main question" | "follow-up" | "other"; //
    //         "explanation": string; // An open-ended explanation about the suggestion within 15 words.
    //     }         
    //     `).replace("\t", "")
    // */