type TranscriptItem = {
    timestamp: string;
    
    // Human
    speaker?: string;
    text?: string;

    // Pause Detected
    pauseDuration?: number;

    // AI
    aiEvent?: "feedback" | "follow-up" | "next-question" | "rephrase" | "start-ai" | "stop-ai" | "recording-started" | "recording-stopped";
    aiEventDirection?: "ask" | "response";
    aiEventData?: string; // JSON string

    // Interaction Event
    interactionEvent?: "mute" | "unmute" | "video-off" | "video-on" | "end-call";
}

type Transcript = TranscriptItem[];

export type { TranscriptItem, Transcript };
