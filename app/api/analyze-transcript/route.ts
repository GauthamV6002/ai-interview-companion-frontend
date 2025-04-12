"use server";

import { config } from "dotenv";
import { TranscriptItem } from "@/types/Transcript";
import OpenAI from "openai";

config();

// Initialize the OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
	try {
		// Get transcript data from request
		const { transcript, protocol } = await req.json();

		// Filter out non-speech items and extract only text
		const speechOnly = transcript
			.filter((item: TranscriptItem) => item.text && item.speaker)
			.map((item: TranscriptItem) => ({
				text: item.text,
			}));

		// Format the transcript for the OpenAI request
		const formattedTranscript = speechOnly
			.map((item: any) => `${item.text}`)
			.join("\n");
      
      const transcriptPrompt = `
			Here is the transcript of an interview. 
			Extract the questions and follow-up questions from the transcript.
      
      First, take a look at the protocol of the interview. 
      Use the main questions and follow-up questions from the protocol to identify the questions and follow-up questions in the transcript.
      If a question is asked in the interview and is a main question on the protocol, it is a question.
      If a question is asked in the interview and is a follow-up question on the protocol, it is a follow-up question.
      
      <protocol>
      ${JSON.stringify(protocol)}
      </protocol>
			
			<transcript>
      ${formattedTranscript}
			</transcript>`;

      console.log("Transcript: \n", transcriptPrompt);

		// Call OpenAI API using chat.completions with JSON response format
		const response = await openai.responses.create({
			model: "gpt-4o",
			temperature: 0, // Prefer deterministic output
			input: [
				{
					role: "system",
					content:
						"You are an expert at structured data extraction. \
						You will be given text from from an interview transcript and should convert it into the given structure.",
				},
				{ role: "user", content: transcriptPrompt },
			],
			text: {
				format: {
					type: "json_schema",
					name: "interview_analysis",
					schema: {
						type: "object",
						properties: {
							questions: {
								type: "array",
								items: { type: "string" },
							},
							followUpQuestions: {
								type: "array",
								items: { type: "string" },
							},
						},
						required: ["questions", "followUpQuestions"],
						additionalProperties: false,
					},
					strict: true,
				},
			},
		});

		// Parse the response from JSON string to object
		const analysisResult = JSON.parse(response.output_text);

		// Return the analysis results
		return Response.json(analysisResult);
	} catch (error) {
		console.error("Error analyzing transcript:", error);
		return Response.json(
			{ error: "Failed to analyze transcript" },
			{ status: 500 }
		);
	}
}

