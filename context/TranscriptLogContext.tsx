import { Transcript } from '@/types/Transcript';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for the segmented audio
export type AudioSegment = 
    | { type: 'audio'; timestamp: string; blob: Blob }
    | { type: 'pause'; timestamp: string; pauseDuration: number };

export interface TranscriptLogContextType {
    transcript: Transcript;
    elapsedTime: number;
    audioBlobs: Blob[];
    audioSegments: AudioSegment[];
    setTranscript: React.Dispatch<React.SetStateAction<Transcript>>;
    setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
    addAudioBlob: (blob: Blob) => void;
    addAudioSegment: (segment: AudioSegment) => void;
}

const TranscriptLogContext = createContext<TranscriptLogContextType | undefined>(undefined);

export const TranscriptLogProvider = ({ children }: { children: ReactNode }) => {

    const [transcript, setTranscript] = useState<Transcript>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
    const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);

    const addAudioBlob = (blob: Blob) => {
        setAudioBlobs(prevBlobs => [...prevBlobs, blob]);
    };

    const addAudioSegment = (segment: AudioSegment) => {
        setAudioSegments(prevSegments => [...prevSegments, segment]);
    };

    return (
        <TranscriptLogContext.Provider value={{ 
            transcript, 
            elapsedTime, 
            audioBlobs,
            audioSegments,
            setTranscript, 
            setElapsedTime,
            addAudioBlob,
            addAudioSegment
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