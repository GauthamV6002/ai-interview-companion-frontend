"use server"

import { config } from 'dotenv';


config();

export async function GET(req: Request) {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Allow all origins
            // "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow specific methods
            // "Access-Control-Allow-Headers": "Content-Type, Authorization" // Allow specific headers
        },
        body: JSON.stringify({
            // model: "gpt-4o-realtime-preview",
            model: "gpt-4o-mini-realtime-preview",
            voice: "verse",
            input_audio_transcription: {
                model: "whisper-1"
            },
        }),
    });

    const data = await r.json();

    // Send back the JSON we received from the OpenAI REST API
    return Response.json(data);
}