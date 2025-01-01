'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getSpeechRecognition, clearSpeechRecognition } from '../utils/speechRecognition';

interface UseVoiceRecorderOptions {
  onDataAvailable?: (blob: Blob, transcript: string) => void;
  onError?: (error: Error) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  language?: string;
  maxDuration?: number; // in milliseconds
}

export function useVoiceRecorder({
  onDataAvailable,
  onError,
  onTranscript,
  language = 'en-AU',
  maxDuration = 60000 // 1 minute
}: UseVoiceRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<ReturnType<typeof getSpeechRecognition> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Initialize speech recognition
      speechRecognitionRef.current = getSpeechRecognition({
        language,
        continuous: true,
        interimResults: true
      });

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up media recorder
      mediaRecorder.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onDataAvailable?.(audioBlob, currentTranscript);
      };

      // Start recording
      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      setCurrentTranscript('');

      // Start speech recognition
      speechRecognitionRef.current.start({
        onResult: (text, isFinal) => {
          setCurrentTranscript(prev => isFinal ? text : prev);
          onTranscript?.(text, isFinal);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          onError?.(error);
        }
      });

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1000;
        });
      }, 1000);

      // Auto stop after maxDuration
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, maxDuration);

    } catch (error) {
      console.error('Recording error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }, [language, maxDuration, onDataAvailable, onError, onTranscript, currentTranscript, isRecording]);

  const stopRecording = useCallback(() => {
    // Stop media recorder
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
    }

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setDuration(0);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      
      // Resume speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start({
          onResult: (text, isFinal) => {
            setCurrentTranscript(prev => isFinal ? text : prev);
            onTranscript?.(text, isFinal);
          },
          onError
        });
      }

      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1000;
        });
      }, 1000);
    }
  }, [maxDuration, onTranscript, onError, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearSpeechRecognition();
    };
  }, []);

  return {
    isRecording,
    duration,
    currentTranscript,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cleanup: useCallback(() => {
      stopRecording();
      clearSpeechRecognition();
    }, [stopRecording])
  };
}
