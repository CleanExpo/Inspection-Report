"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { VoiceCommand } from '../types/voice';

interface VoiceCommandState {
  isListening: boolean;
  lastCommand?: VoiceCommand;
  commandHistory: VoiceCommand[];
  error: string | null;
}

interface VoiceCommandContextType {
  state: VoiceCommandState;
  startListening: () => void;
  stopListening: () => void;
  processCommand: (command: VoiceCommand) => Promise<void>;
  clearHistory: () => void;
}

const initialState: VoiceCommandState = {
  isListening: false,
  commandHistory: [],
  error: null
};

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(undefined);

export const useVoiceCommand = () => {
  const context = useContext(VoiceCommandContext);
  if (!context) {
    throw new Error('useVoiceCommand must be used within a VoiceCommandProvider');
  }
  return context;
};

interface VoiceCommandProviderProps {
  children: React.ReactNode;
}

export const VoiceCommandProvider: React.FC<VoiceCommandProviderProps> = ({ children }) => {
  const [state, setState] = useState<VoiceCommandState>(initialState);

  const startListening = useCallback(() => {
    try {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      setState(prev => ({ ...prev, isListening: true, error: null }));

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-AU';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.start();

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice command:', transcript);
        // Process voice command here
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setState(prev => ({
          ...prev,
          isListening: false,
          error: 'Failed to recognize speech'
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: error instanceof Error ? error.message : 'Failed to start voice recognition'
      }));
    }
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const processCommand = useCallback(async (command: VoiceCommand) => {
    try {
      setState(prev => ({
        ...prev,
        lastCommand: command,
        commandHistory: [...prev.commandHistory, command],
        error: null
      }));

      console.log(`Processing command: ${command.type}`, command.parameters);
      // Handle different command types here
      switch (command.type) {
        case 'ADD_NOTE':
          // Handle adding note
          break;
        case 'UPDATE_STATUS':
          // Handle status update
          break;
        case 'ADD_PHOTO':
          // Handle photo addition
          break;
        default:
          console.warn('Unknown command type:', command.type);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process command'
      }));
    }
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      commandHistory: [],
      lastCommand: undefined
    }));
  }, []);

  return (
    <VoiceCommandContext.Provider
      value={{
        state,
        startListening,
        stopListening,
        processCommand,
        clearHistory
      }}
    >
      {children}
    </VoiceCommandContext.Provider>
  );
};
