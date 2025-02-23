# AI Interviewer Companion

## Overview

This is a video chat app that is being developed as a AI companion for interviewers during interviews. The AI is intended to automatically provide feedback to interviewers about the tone, content, and relevance of their 
questions, and provide suggestions on how they can move forward.

The application is built with a peer-to-peer webRTC connection, and is connected to OpenAI's realtime API as a third party listener. Realtime API was chosen over transcription solutions due to latency concerns during the interview.

## Research Intent

This platform is being developed for a Human Computer Interaction (HCI) research study measuring the impact of AI assistance on an interviewer's ability to effectively conduct an interview. The study is scheduled for submission to  [UIST 2025](https://uist.acm.org/2025/) this April.

## Feature Set

- Automatic Question and Interviewee Response Analysis
- On-demand follow-up question generation
- On-demand question rephrasing
- Finding the best next question to ask

## Try it

The currently deployed version on Vercel probably won't work, as it is turned off when not in use.
This may change with a future version for ongoing research studies.

To try it locally,
1. Clone the repo
2. Create a `.env` file in the root directory, and add your openAI API Key as `OPENAI_API_KEY=<yourkey>`
3. Run `npm run dev`, and open it up on localhost :)
