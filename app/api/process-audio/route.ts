import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { audio } = req.body;

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Create a temporary file or stream the audio data
    const audioFile = new File([audioBuffer], 'audio.webm', {
      type: 'audio/webm'
    });

    // Get transcription from OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    // Analyze the transcription for interviewer feedback
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Analyze the interviewer's questions and 
          provide real-time feedback on interviewing techniques. Focus on:
          - Question clarity and structure
          - Follow-up technique
          - Active listening indicators
          - Potential bias in questions
          - Professional tone and language
          Provide brief, actionable feedback.`
        },
        {
          role: 'user',
          content: transcription.text
        }
      ]
    });

    // Determine if the feedback is positive or an area for improvement
    const feedbackType = completion.choices[0].message.content?.toLowerCase().includes('great') 
      || completion.choices[0].message.content?.toLowerCase().includes('good')
      ? 'positive' 
      : 'improvement';

    return res.status(200).json({
      transcription: transcription.text,
      feedback: completion.choices[0].message.content,
      feedbackType
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ message: 'Error processing audio' });
  }
}