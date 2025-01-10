'use client';

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface SpeechRecognitionCallbacks {
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

// Type definitions for browser Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor(options: SpeechRecognitionOptions = {}) {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = options.language || 'en-AU';
      this.recognition.continuous = options.continuous ?? true;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      this.callbacks.onResult?.(transcript, result.isFinal);
    };

    this.recognition.onerror = (event: any) => {
      this.callbacks.onError?.(new Error(event.error));
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();
    };
  }

  public start(callbacks: SpeechRecognitionCallbacks = {}) {
    if (!this.recognition) {
      throw new Error('Speech recognition is not initialized');
    }

    this.callbacks = callbacks;

    try {
      this.recognition.start();
    } catch (error) {
      if (error instanceof Error) {
        callbacks.onError?.(error);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 
      !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

let speechRecognitionInstance: SpeechRecognitionService | null = null;

export function getSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionService {
  if (!speechRecognitionInstance) {
    speechRecognitionInstance = new SpeechRecognitionService(options);
  }
  return speechRecognitionInstance;
}

export function clearSpeechRecognition() {
  if (speechRecognitionInstance) {
    speechRecognitionInstance.stop();
    speechRecognitionInstance = null;
  }
}
