/// <reference path="./speech.d.ts" />
import type { PhotoAttachment } from './photo';

export interface VoiceCommand {
  type: string;
  parameters: Record<string, string>;
}

export interface VoiceCommandResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface VoiceMacro {
  id: string;
  name: string;
  commands: VoiceCommand[];
  createdAt: string;
}

export interface VoiceNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  type?: 'observation' | 'recommendation' | 'action';
  tags?: string[];
  author?: string;
  confidence?: number;
  audioUrl?: string;
  transcriptionStatus?: 'pending' | 'completed' | 'failed';
  photos?: PhotoAttachment[];
  analysis?: {
    aiProcessed: boolean;
    keyFindings?: string[];
    criticalIssues?: string[];
    nextSteps?: string[];
    confidence?: number;
    processedAt?: string;
  };
}

export interface VoiceNotesState {
  isRecording: boolean;
  isProcessing: boolean;
  isPhotoCaptureOpen: boolean;
  error: string | null;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  filter: {
    type?: VoiceNote['type'];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sort: {
    field: keyof VoiceNote;
    direction: 'asc' | 'desc';
  };
}

export interface VoiceCommandExecutor {
  executeMacro: (macro: VoiceMacro) => Promise<void>;
  executeCommand: (command: VoiceCommand) => Promise<void>;
}

export interface VoiceCommandHandler {
  type: string;
  handler: (parameters: Record<string, string>) => Promise<void>;
}

export interface VoiceCommandOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export interface VoiceCommandState {
  isListening: boolean;
  error: string | null;
  lastCommand?: VoiceCommand;
  lastResult?: VoiceCommandResult;
}

export interface VoiceTranscription {
  id: string;
  text: string;
  confidence: number;
  timestamp: string;
  duration?: number;
  speaker?: string;
  language?: string;
}

export interface VoiceRecordingOptions {
  maxDuration?: number;
  sampleRate?: number;
  channels?: number;
  format?: 'wav' | 'mp3' | 'ogg';
}

export interface VoiceRecordingState {
  isRecording: boolean;
  duration: number;
  volume: number;
  error: string | null;
}
