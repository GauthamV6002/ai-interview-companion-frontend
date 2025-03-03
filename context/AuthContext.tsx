import { Protocol } from '@/types/Protocol';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ConfigurationMode = "interactive" | "responsive" | "none" | "full" | "post" | null;

export interface AuthContextType {
    participantID: Number;
    configurationMode: ConfigurationMode
    protocol: Protocol,
    protocolString: string,

    setParticipantID: (id: Number) => void;
    setConfigurationMode: (mode: ConfigurationMode) => void;
    setProtocol: (protocol: Protocol) => void;
    setProtocolString: React.Dispatch<React.SetStateAction<string>>
}

const DEFAULT_PROTOCOL_STRING = `1: How would you describe your overall experience as a student at this university? 
1.1: What aspects of university life do you find most enjoyable or challenging?
2: Can you walk me through a typical day in your life as a student? 
2.1: How do you balance your academic responsibilities with other aspects of your life?
3: How would you describe the level of academic stress you experience? 
3.1: Can you give me an example of a particularly stressful academic situation you've faced? How did you handle it?
4: How has your university experience affected your mental health and well-being? 
4.1: Have you noticed any changes in your mental health since starting university? If so, can you elaborate?
5: Can you tell me about your social relationships at university? 
5.1: How do these relationships impact your mental well-being?
6: What strategies or coping mechanisms do you use to manage stress or maintain your mental health? 
6.1: How effective do you find these strategies? Are there any new approaches you'd like to try?
7: Are you aware of any mental health resources available at your university? 
7.1: If so, what has been your experience with them? 
7.2: Have you ever used these resources? If not, what has prevented you from doing so?
8: How do you think the university environment affects students' mental health? 
8.1: Are there any changes you think the university could make to better support students' mental well-being?`

const DEFAULT_PROTOCOL = [
    {
        id: 0,
        "question": "How would you describe your overall experience as a student at this university?",
        "followUps": [
            "What aspects of university life do you find most enjoyable or challenging?"
        ]
    },
    {
        id: 1,
        "question": "Can you walk me through a typical day in your life as a student?",
        "followUps": [
            "How do you balance your academic responsibilities with other aspects of your life?"
        ]
    },
    {
        id: 2,
        "question": "How would you describe the level of academic stress you experience?",
        "followUps": [
            "Can you give me an example of a particularly stressful academic situation you've faced? How did you handle it?"
        ]
    },
    {
        id: 3,
        "question": "How has your university experience affected your mental health and well-being?",
        "followUps": [
            "Have you noticed any changes in your mental health since starting university? If so, can you elaborate?"
        ]
    },
    {
        id: 4,
        "question": "Can you tell me about your social relationships at university?",
        "followUps": [
            "How do these relationships impact your mental well-being?"
        ]
    },
    {
        id: 5,
        "question": "What strategies or coping mechanisms do you use to manage stress or maintain your mental health?",
        "followUps": [
            "How effective do you find these strategies? Are there any new approaches you'd like to try?"
        ]
    },
    {
        id: 6,
        "question": "Are you aware of any mental health resources available at your university?",
        "followUps": [
            "If so, what has been your experience with them?",
            "Have you ever used these resources? If not, what has prevented you from doing so?"
        ]
    },
    {
        id: 7,
        "question": "How do you think the university environment affects students' mental health?",
        "followUps": [
            "Are there any changes you think the university could make to better support students' mental well-being?"
        ]
    }
]

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [participantID, setParticipantID] = useState<Number>(12345);
    const [configurationMode, setConfigurationMode] = useState<ConfigurationMode>('full');
    const [protocol, setProtocol] = useState<Protocol>(DEFAULT_PROTOCOL);
    const [protocolString, setProtocolString] = useState<string>(DEFAULT_PROTOCOL_STRING);



    return (
        <AuthContext.Provider value={{ participantID, configurationMode, protocol, protocolString, setParticipantID, setConfigurationMode, setProtocol, setProtocolString }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 