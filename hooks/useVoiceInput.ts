'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { transcribeVoice, streamVoiceToText, analyzeVoiceCommand } from '../utils/gemini';

interface UseVoiceInputOptions {
  onTranscription?: (text: string) => void;
  onCommand?: (command: {
    intent: string;
    action: string;
    parameters: Record<string, any>;
  }) => void;
  onError?: (error: Error) => void;
  language?: string;
  autoStop?: boolean;
  maxDuration?: number; // in seconds
  commandMode?: boolean;
}

interface VoiceInputState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: Error | null;
}

export function useVoiceInput({
  onTranscription,
  onCommand,
  onError,
  language = 'en-AU',
  autoStop = true,
  maxDuration = 300, // 5 minutes
  commandMode = false
}: UseVoiceInputOptions = {}) {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);

          // If in streaming mode, process chunks immediately
          if (!commandMode) {
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            const text = await transcribeVoice(audioBlob, { language });
            onTranscription?.(text.text);
          }
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        try {
          if (commandMode) {
            // Process as a command
            const text = await transcribeVoice(audioBlob, { language });
            const command = await analyzeVoiceCommand(text.text);
            onCommand?.(command);
          } else {
            // Process as regular transcription
            const text = await transcribeVoice(audioBlob, { language });
            onTranscription?.(text.text);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Transcription failed');
          setState(prev => ({ ...prev, error: err }));
          onError?.(err);
        }
      };

      mediaRecorder.current.start(1000); // Collect data every second

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          
          // Auto stop if max duration reached
          if (autoStop && newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 1000);

      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording');
      setState(prev => ({ ...prev, error: err }));
      onError?.(err);
    }
  }, [language, commandMode, autoStop, maxDuration, onTranscription, onCommand, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }

    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      duration: 0
    }));
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearError
  };
}
