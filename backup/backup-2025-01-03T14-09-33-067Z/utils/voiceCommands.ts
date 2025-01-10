import { MoistureReading } from '@/types/moisture';

// Voice command types
export type VoiceCommand = 
  | 'START_DRAWING'
  | 'STOP_DRAWING'
  | 'ADD_READING'
  | 'ADD_EQUIPMENT'
  | 'MEASURE'
  | 'UNDO'
  | 'SAVE'
  | 'CANCEL'
  | 'SWITCH_TOOL'
  | 'SET_MATERIAL';

export interface VoiceCommandHandler {
  command: VoiceCommand;
  handler: () => void;
  feedback: string;
}

export interface VoiceReadingInput {
  value: number;
  materialType: string;
  location?: string;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: SpeechRecognitionAlternative;
      isFinal: boolean;
      length: number;
    };
  };
}

// Command patterns for natural language processing
const COMMAND_PATTERNS = {
  START_DRAWING: /^(start|begin) drawing$/i,
  STOP_DRAWING: /^(stop|end) drawing$/i,
  ADD_READING: /^add (reading|measurement)( of (\d+(\.\d+)?))?( on (.+))?$/i,
  ADD_EQUIPMENT: /^add (equipment|dehumidifier|fan|heater)$/i,
  MEASURE: /^(start |begin )?measure(ment)?$/i,
  UNDO: /^undo( last)?$/i,
  SAVE: /^save( changes)?$/i,
  CANCEL: /^cancel$/i,
  SWITCH_TOOL: /^switch to (.+)$/i,
  SET_MATERIAL: /^(set |change )?material to (.+)$/i,
};

export class VoiceCommandManager {
  private recognition: any; // SpeechRecognition
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private commandHandlers: Map<VoiceCommand, VoiceCommandHandler>;
  private onReadingInput?: (reading: VoiceReadingInput) => void;
  private currentContext: 'COMMAND' | 'READING' = 'COMMAND';

  constructor() {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.synthesis = window.speechSynthesis;
    this.commandHandlers = new Map();

    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex][0];
      if (event.results[event.resultIndex].isFinal) {
        this.processCommand(result.transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.speak('Sorry, there was an error with voice recognition.');
    };
  }

  registerCommand(command: VoiceCommand, handler: () => void, feedback: string) {
    this.commandHandlers.set(command, { command, handler, feedback });
  }

  setReadingInputHandler(handler: (reading: VoiceReadingInput) => void) {
    this.onReadingInput = handler;
  }

  start() {
    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
      this.speak('Voice commands activated');
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.speak('Voice commands deactivated');
    }
  }

  private speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    this.synthesis.speak(utterance);
  }

  private processCommand(transcript: string) {
    if (this.currentContext === 'READING') {
      this.processReadingInput(transcript);
      return;
    }

    // Check for command patterns
    for (const [command, pattern] of Object.entries(COMMAND_PATTERNS)) {
      const match = transcript.match(pattern);
      if (match) {
        const handler = this.commandHandlers.get(command as VoiceCommand);
        if (handler) {
          handler.handler();
          this.speak(handler.feedback);
          
          // Special handling for reading input
          if (command === 'ADD_READING') {
            const value = match[3] ? parseFloat(match[3]) : undefined;
            const location = match[6];
            if (value) {
              this.processReadingValue(value, location);
            } else {
              this.currentContext = 'READING';
              this.speak('Please say the reading value');
            }
          }
        }
        return;
      }
    }

    this.speak('Command not recognized. Please try again.');
  }

  private processReadingInput(transcript: string) {
    const numberMatch = transcript.match(/(\d+(\.\d+)?)/);
    if (numberMatch) {
      const value = parseFloat(numberMatch[1]);
      this.processReadingValue(value);
    } else {
      this.speak('Please say a number for the reading value');
    }
  }

  private processReadingValue(value: number, location?: string) {
    if (this.onReadingInput) {
      this.onReadingInput({
        value,
        materialType: 'drywall', // Default material, can be changed via SET_MATERIAL command
        location,
      });
    }
    this.currentContext = 'COMMAND';
    this.speak(`Reading of ${value} recorded${location ? ` at ${location}` : ''}`);
  }

  // Helper method to get available commands
  getAvailableCommands(): string[] {
    return Object.keys(COMMAND_PATTERNS).map(command => {
      const pattern = COMMAND_PATTERNS[command as keyof typeof COMMAND_PATTERNS];
      return pattern.toString().replace(/[\/\^$]/g, '').replace(/\(\?:|\)/g, '');
    });
  }
}

// Create and export singleton instance
export const voiceCommandManager = new VoiceCommandManager();

// React hook for voice commands
export const useVoiceCommands = () => {
  return {
    startListening: () => voiceCommandManager.start(),
    stopListening: () => voiceCommandManager.stop(),
    registerCommand: (
      command: VoiceCommand,
      handler: () => void,
      feedback: string
    ) => voiceCommandManager.registerCommand(command, handler, feedback),
    setReadingInputHandler: (
      handler: (reading: VoiceReadingInput) => void
    ) => voiceCommandManager.setReadingInputHandler(handler),
    getAvailableCommands: () => voiceCommandManager.getAvailableCommands(),
  };
};
