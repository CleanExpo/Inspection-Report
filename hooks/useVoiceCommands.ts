import { useCallback, useEffect } from 'react';
import { useVoiceCommand } from '../contexts/VoiceCommandContext';
import type { VoiceCommand, VoiceCommandHandler } from '../types/voice';

export const useVoiceCommands = (handlers: VoiceCommandHandler[]) => {
  const {
    state: { isListening, error },
    startListening,
    stopListening,
    processCommand
  } = useVoiceCommand();

  const handleCommand = useCallback(async (command: VoiceCommand) => {
    const handler = handlers.find(h => h.type === command.type);
    if (handler) {
      await handler.handler(command.parameters);
    } else {
      console.warn(`No handler found for command type: ${command.type}`);
    }
  }, [handlers]);

  useEffect(() => {
    // Clean up any active recognition on unmount
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  const executeCommand = useCallback(async (type: string, parameters: Record<string, string> = {}) => {
    await processCommand({ type, parameters });
  }, [processCommand]);

  return {
    isListening,
    startListening,
    stopListening,
    executeCommand,
    handleCommand,
    error
  };
};

// Predefined command handlers
export const useNoteCommands = () => {
  return useVoiceCommands([
    {
      type: 'ADD_NOTE',
      handler: async ({ text }) => {
        if (!text) return;
        // Handle adding note
        console.log('Adding note:', text);
      }
    },
    {
      type: 'UPDATE_NOTE',
      handler: async ({ id, text }) => {
        if (!id || !text) return;
        // Handle updating note
        console.log('Updating note:', id, text);
      }
    },
    {
      type: 'DELETE_NOTE',
      handler: async ({ id }) => {
        if (!id) return;
        // Handle deleting note
        console.log('Deleting note:', id);
      }
    }
  ]);
};

export const usePhotoCommands = () => {
  return useVoiceCommands([
    {
      type: 'ADD_PHOTO',
      handler: async ({ caption }) => {
        // Handle adding photo
        console.log('Adding photo with caption:', caption);
      }
    },
    {
      type: 'UPDATE_PHOTO',
      handler: async ({ id, caption }) => {
        if (!id) return;
        // Handle updating photo
        console.log('Updating photo:', id, caption);
      }
    },
    {
      type: 'DELETE_PHOTO',
      handler: async ({ id }) => {
        if (!id) return;
        // Handle deleting photo
        console.log('Deleting photo:', id);
      }
    }
  ]);
};

export const useStatusCommands = () => {
  return useVoiceCommands([
    {
      type: 'UPDATE_STATUS',
      handler: async ({ status }) => {
        if (!status) return;
        // Handle status update
        console.log('Updating status:', status);
      }
    }
  ]);
};
