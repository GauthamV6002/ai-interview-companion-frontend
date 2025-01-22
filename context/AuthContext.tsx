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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [participantID, setParticipantID] = useState<Number>(12345);
  const [configurationMode, setConfigurationMode] = useState<ConfigurationMode>(null);
  const [protocol, setProtocol] = useState<Protocol>([]);

  
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