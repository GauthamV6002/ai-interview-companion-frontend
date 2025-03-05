
type AIEvent = "feedback" | "follow-up" | "next-question" | "rephrase" | "start-ai" | "stop-ai" | "recording-started" | "recording-stopped";
type TranscriptItem = {
    timestamp: string;
    
    // Human
    speaker?: ("interviewer" | "interviewee");
    text?: string;

    // Pause Detected
    pauseDuration?: number;

    // AI
    aiEvent?: AIEvent;
    aiEventDirection?: "ask" | "response";
    aiEventData?: string; // JSON string

    // Interaction Event
    interactionEvent?: "mute" | "unmute" | "video-off" | "video-on" | "end-call";
}

type Transcript = TranscriptItem[];

export type { TranscriptItem, Transcript, AIEvent };
