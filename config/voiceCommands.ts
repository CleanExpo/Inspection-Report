export interface VoiceCommand {
  name: string;
  triggers: string[];
  description: string;
  action: string;
  examples: string[];
  parameters?: {
    name: string;
    type: 'text' | 'number' | 'location' | 'severity' | 'type';
    required: boolean;
    description: string;
    examples: string[];
  }[];
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    name: 'Add Note',
    triggers: ['add note', 'make note', 'note that', 'write down'],
    description: 'Create a new inspection note',
    action: 'ADD_NOTE',
    examples: [
      'add note water damage on ceiling',
      'note that mould growth in corner',
      'make note high moisture readings'
    ],
    parameters: [
      {
        name: 'text',
        type: 'text',
        required: true,
        description: 'The content of the note',
        examples: ['water damage visible', 'mould growth present']
      }
    ]
  },
  {
    name: 'Record Damage',
    triggers: ['record damage', 'damage found', 'damage in', 'damage at'],
    description: 'Document damage observations',
    action: 'ADD_DAMAGE',
    examples: [
      'record damage severe water stains on ceiling',
      'damage found in bathroom corner',
      'damage at north wall with mould'
    ],
    parameters: [
      {
        name: 'description',
        type: 'text',
        required: true,
        description: 'Description of the damage',
        examples: ['water stains', 'mould growth']
      },
      {
        name: 'location',
        type: 'location',
        required: true,
        description: 'Location of the damage',
        examples: ['ceiling', 'north wall', 'bathroom']
      },
      {
        name: 'severity',
        type: 'severity',
        required: false,
        description: 'Severity level of the damage',
        examples: ['high', 'medium', 'low']
      }
    ]
  },
  {
    name: 'Take Measurement',
    triggers: ['measure', 'reading of', 'moisture level', 'humidity level'],
    description: 'Record measurements and readings',
    action: 'ADD_MEASUREMENT',
    examples: [
      'measure moisture level 85% in ceiling',
      'reading of 60% humidity',
      'moisture level 40% in walls'
    ],
    parameters: [
      {
        name: 'value',
        type: 'number',
        required: true,
        description: 'The measurement value',
        examples: ['85', '60', '40']
      },
      {
        name: 'type',
        type: 'type',
        required: true,
        description: 'Type of measurement',
        examples: ['moisture', 'humidity', 'temperature']
      },
      {
        name: 'location',
        type: 'location',
        required: true,
        description: 'Location of the measurement',
        examples: ['ceiling', 'walls', 'floor']
      }
    ]
  },
  {
    name: 'Take Photo',
    triggers: ['take photo', 'capture image', 'photograph', 'photo of'],
    description: 'Capture and attach photos to notes',
    action: 'TAKE_PHOTO',
    examples: [
      'take photo of water damage',
      'capture image of mold growth',
      'photograph ceiling stains'
    ],
    parameters: [
      {
        name: 'subject',
        type: 'text',
        required: true,
        description: 'Subject of the photo',
        examples: ['water damage', 'mold growth', 'ceiling stains']
      },
      {
        name: 'location',
        type: 'location',
        required: false,
        description: 'Location being photographed',
        examples: ['ceiling', 'north wall', 'bathroom']
      }
    ]
  },
  {
    name: 'Edit Note',
    triggers: ['edit note', 'update note', 'change note', 'modify note'],
    description: 'Edit an existing note',
    action: 'EDIT_NOTE',
    examples: [
      'edit note 1',
      'update last note',
      'modify previous note'
    ],
    parameters: [
      {
        name: 'identifier',
        type: 'text',
        required: true,
        description: 'Which note to edit',
        examples: ['last', 'previous', '1', '2']
      },
      {
        name: 'text',
        type: 'text',
        required: true,
        description: 'New content for the note',
        examples: ['updated damage assessment', 'corrected measurement']
      }
    ]
  },
  {
    name: 'Delete Note',
    triggers: ['delete note', 'remove note', 'clear note'],
    description: 'Delete an existing note',
    action: 'DELETE_NOTE',
    examples: [
      'delete last note',
      'remove note 2',
      'clear previous note'
    ],
    parameters: [
      {
        name: 'identifier',
        type: 'text',
        required: true,
        description: 'Which note to delete',
        examples: ['last', 'previous', '1', '2']
      }
    ]
  },
  {
    name: 'Validate Area',
    triggers: ['validate area', 'check area', 'verify', 'confirm'],
    description: 'Mark an area as validated',
    action: 'VALIDATE_AREA',
    examples: [
      'validate area bathroom cleanup complete',
      'verify ceiling repairs done',
      'confirm sanitization complete'
    ],
    parameters: [
      {
        name: 'area',
        type: 'location',
        required: true,
        description: 'Area being validated',
        examples: ['bathroom', 'ceiling', 'north wall']
      },
      {
        name: 'status',
        type: 'text',
        required: true,
        description: 'Validation status or condition',
        examples: ['cleanup complete', 'repairs done', 'sanitized']
      }
    ]
  }
];

export const QUICK_COMMANDS = [
  {
    phrase: 'quick damage',
    description: 'Quick damage report template',
    template: 'record damage {description} in {location} severity {severity}'
  },
  {
    phrase: 'quick measure',
    description: 'Quick measurement template',
    template: 'measure {type} level {value} in {location}'
  },
  {
    phrase: 'quick photo',
    description: 'Quick photo capture template',
    template: 'take photo of {subject} at {location}'
  }
];

export function matchCommand(text: string): {
  command: VoiceCommand;
  matches: RegExpMatchArray | null;
} | null {
  const lowerText = text.toLowerCase();
  
  for (const command of VOICE_COMMANDS) {
    for (const trigger of command.triggers) {
      if (lowerText.includes(trigger)) {
        // Create a regex pattern based on the command parameters
        const pattern = command.parameters?.reduce((acc, param) => {
          return acc.replace(
            new RegExp(`{${param.name}}`, 'g'),
            `(?<${param.name}>[\\w\\s]+)`
          );
        }, trigger) || trigger;

        const matches = lowerText.match(new RegExp(pattern, 'i'));
        if (matches) {
          return { command, matches };
        }
      }
    }
  }

  return null;
}

export function extractParameters(command: VoiceCommand, text: string): Record<string, string> {
  const parameters: Record<string, string> = {};
  
  command.parameters?.forEach(param => {
    const pattern = new RegExp(`${param.name}[:\\s]+(\\w+)`, 'i');
    const match = text.match(pattern);
    if (match) {
      parameters[param.name] = match[1];
    }
  });

  return parameters;
}
