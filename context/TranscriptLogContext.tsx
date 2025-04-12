import { Transcript } from '@/types/Transcript';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TranscriptLogContextType {
    transcript: Transcript;
    elapsedTime: number;
    audioBlobs: Blob[];
    setTranscript: React.Dispatch<React.SetStateAction<Transcript>>;
    setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
    addAudioBlob: (blob: Blob) => void;
}

const DEFAULT_TRANSCRIPT: Transcript = [
  {
    text: "Hello, how are you?",
    speaker: "interviewer",
    timestamp: "00:00",
  },
  {
    text: "I'm good, thank you!",
    speaker: "interviewer",
    timestamp: "00:01",
  },
  {
    text: "What is your name?",
    speaker: "interviewer",
    timestamp: "00:02",
  },
  {
    pauseDuration: 1000,
    timestamp: "00:03",
  },
  {
    text: "My name is John Doe.",
    speaker: "interviewer",
    timestamp: "00:04",
  },
  {
    text: "What is your favorite color?",
    speaker: "interviewer",
    timestamp: "00:05",
  },
];

const TranscriptLogContext = createContext<TranscriptLogContextType | undefined>(undefined);

export const TranscriptLogProvider = ({ children }: { children: ReactNode }) => {

    const [transcript, setTranscript] = useState<Transcript>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);

    const addAudioBlob = (blob: Blob) => {
        setAudioBlobs(prevBlobs => [...prevBlobs, blob]);
    };

    return (
        <TranscriptLogContext.Provider value={{ 
            transcript, 
            elapsedTime, 
            audioBlobs,
            setTranscript, 
            setElapsedTime,
            addAudioBlob
        }}>
            {children}
        </TranscriptLogContext.Provider>
    );
};

export const useTranscriptLog = () => {
    const context = useContext(TranscriptLogContext);
    if (!context) {
        throw new Error('useTranscriptLog must be used within an TranscriptLogProvider');
    }
    return context;
}; 