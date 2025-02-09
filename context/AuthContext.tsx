import { Protocol } from '@/types/Protocol';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ConfigurationMode = "mode_a" | "mode_b" | null;

export interface AuthContextType {
  participantID: Number;
  configurationMode: ConfigurationMode
  protocol: Protocol

  setParticipantID: (id: Number) => void;
  setConfigurationMode: (mode: ConfigurationMode) => void;
  setProtocol: (protocol: Protocol) => void;
}

const DEFAULT_PROTOCOL = [
  {
      "question": "How would you describe your overall experience as a student at this university?",
      "followUps": [
          "What aspects of university life do you find most enjoyable or challenging?"
      ]
  },
  {
      "question": "Can you walk me through a typical day in your life as a student?",
      "followUps": [
          "How do you balance your academic responsibilities with other aspects of your life?"
      ]
  },
  {
      "question": "How would you describe the level of academic stress you experience?",
      "followUps": [
          "Can you give me an example of a particularly stressful academic situation you've faced? How did you handle it?"
      ]
  },
  {
      "question": "How has your university experience affected your mental health and well-being?",
      "followUps": [
          "Have you noticed any changes in your mental health since starting university? If so, can you elaborate?"
      ]
  },
  {
      "question": "Can you tell me about your social relationships at university?",
      "followUps": [
          "How do these relationships impact your mental well-being?"
      ]
  },
  {
      "question": "What strategies or coping mechanisms do you use to manage stress or maintain your mental health?",
      "followUps": [
          "How effective do you find these strategies? Are there any new approaches you'd like to try?"
      ]
  },
  {
      "question": "Are you aware of any mental health resources available at your university?",
      "followUps": [
          "If so, what has been your experience with them?",
          "Have you ever used these resources? If not, what has prevented you from doing so?"
      ]
  },
  {
      "question": "How do you think the university environment affects students' mental health?",
      "followUps": [
          "Are there any changes you think the university could make to better support students' mental well-being?"
      ]
  }
]

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [participantID, setParticipantID] = useState<Number>(12345);
  const [configurationMode, setConfigurationMode] = useState<ConfigurationMode>(null);
  const [protocol, setProtocol] = useState<Protocol>(DEFAULT_PROTOCOL);

  
  return (
    <AuthContext.Provider value={{ participantID, configurationMode, protocol, setParticipantID, setConfigurationMode, setProtocol }}>
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