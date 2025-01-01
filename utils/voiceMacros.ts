import { VOICE_COMMANDS } from '../app/api/voice/route';

export interface VoiceMacro {
  id: string;
  name: string;
  description: string;
  trigger: string[];
  commands: {
    type: keyof typeof VOICE_COMMANDS;
    parameters: Record<string, any>;
    delay?: number; // Delay in ms before executing this command
  }[];
  createdAt: string;
  updatedAt: string;
}

// Predefined macros for common inspection scenarios
export const DEFAULT_MACROS: VoiceMacro[] = [
  {
    id: 'water-damage-inspection',
    name: 'Water Damage Inspection',
    description: 'Complete sequence for water damage inspection',
    trigger: ['start water inspection', 'begin water damage check'],
    commands: [
      {
        type: 'ADD_NOTE',
        parameters: {
          text: 'Starting water damage inspection'
        }
      },
      {
        type: 'ADD_MEASUREMENT',
        parameters: {
          type: 'moisture',
          location: 'affected area'
        },
        delay: 1000
      },
      {
        type: 'ADD_PHOTO',
        parameters: {
          subject: 'water damage',
          location: 'affected area'
        },
        delay: 2000
      },
      {
        type: 'ADD_EQUIPMENT',
        parameters: {
          type: 'dehumidifier',
          location: 'affected area'
        },
        delay: 3000
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mould-inspection',
    name: 'Mould Inspection',
    description: 'Complete sequence for mould inspection',
    trigger: ['start mould inspection', 'begin mould check'],
    commands: [
      {
        type: 'ADD_NOTE',
        parameters: {
          text: 'Starting mould inspection'
        }
      },
      {
        type: 'ADD_MEASUREMENT',
        parameters: {
          type: 'humidity',
          location: 'affected area'
        },
        delay: 1000
      },
      {
        type: 'ADD_PHOTO',
        parameters: {
          subject: 'mould growth',
          location: 'affected area'
        },
        delay: 2000
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface MacroExecutionContext {
  location?: string;
  severity?: string;
  notes?: string[];
}

export class MacroExecutor {
  private macros: VoiceMacro[];
  private context: MacroExecutionContext;

  constructor(customMacros: VoiceMacro[] = []) {
    this.macros = [...DEFAULT_MACROS, ...customMacros];
    this.context = {};
  }

  setContext(context: MacroExecutionContext) {
    this.context = { ...this.context, ...context };
  }

  findMacro(text: string): VoiceMacro | null {
    return this.macros.find(macro => 
      macro.trigger.some(trigger => 
        text.toLowerCase().includes(trigger.toLowerCase())
      )
    ) || null;
  }

  async executeMacro(macro: VoiceMacro, callbacks: {
    onCommand: (command: { type: keyof typeof VOICE_COMMANDS; parameters: Record<string, any> }) => Promise<void>;
    onProgress?: (progress: number, total: number) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }) {
    const { onCommand, onProgress, onComplete, onError } = callbacks;
    const total = macro.commands.length;

    try {
      for (let i = 0; i < macro.commands.length; i++) {
        const command = macro.commands[i];
        
        // Apply context to command parameters
        const parameters = {
          ...command.parameters,
          location: command.parameters.location === 'affected area' ? 
            this.context.location || command.parameters.location :
            command.parameters.location,
          severity: this.context.severity || command.parameters.severity
        };

        // Execute command
        await onCommand({ type: command.type, parameters });

        // Wait for specified delay
        if (command.delay) {
          await new Promise(resolve => setTimeout(resolve, command.delay));
        }

        // Report progress
        onProgress?.(i + 1, total);
      }

      onComplete?.();
    } catch (error) {
      onError?.(error as Error);
    }
  }

  addMacro(macro: Omit<VoiceMacro, 'id' | 'createdAt' | 'updatedAt'>) {
    const newMacro: VoiceMacro = {
      ...macro,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.macros.push(newMacro);
    return newMacro;
  }

  updateMacro(id: string, updates: Partial<VoiceMacro>) {
    const index = this.macros.findIndex(m => m.id === id);
    if (index === -1) return null;

    const updatedMacro = {
      ...this.macros[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.macros[index] = updatedMacro;
    return updatedMacro;
  }

  deleteMacro(id: string) {
    const index = this.macros.findIndex(m => m.id === id);
    if (index === -1) return false;

    // Don't allow deletion of default macros
    if (DEFAULT_MACROS.some(m => m.id === id)) {
      return false;
    }

    this.macros.splice(index, 1);
    return true;
  }

  getMacros() {
    return this.macros;
  }

  getMacro(id: string) {
    return this.macros.find(m => m.id === id) || null;
  }
}

// Helper function to create a new macro executor with persisted custom macros
export async function createMacroExecutor(): Promise<MacroExecutor> {
  // In a real app, you would load custom macros from storage here
  const customMacros: VoiceMacro[] = [];
  return new MacroExecutor(customMacros);
}
