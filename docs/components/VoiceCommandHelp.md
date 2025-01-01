# VoiceCommandHelp

A comprehensive help dialog component that provides documentation and examples for available voice commands, including quick commands, detailed explanations, and interactive examples.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onExecuteExample | (command: string) => void | No | Callback function to execute example commands |

## Features

### Core Functionality
- Voice command documentation display
- Quick command shortcuts
- Interactive example playback
- Text-to-speech example pronunciation
- Command parameter documentation
- Trigger phrase listing

### UI Elements
1. **Help Dialog**
   - Trigger button with help icon
   - Full-screen dialog
   - Scrollable content
   - Close button

2. **Quick Commands Section**
   - Clickable command chips
   - Common command shortcuts
   - Visual command grouping

3. **Detailed Command Documentation**
   - Expandable accordions
   - Command descriptions
   - Parameter lists
   - Example sections
   - Interactive controls

## Example Usage

```tsx
import VoiceCommandHelp from './components/VoiceCommandHelp';

function VoiceControlPanel() {
  const handleExecuteExample = (command: string) => {
    console.log('Executing example command:', command);
    // Implement command execution logic
  };

  return (
    <VoiceCommandHelp onExecuteExample={handleExecuteExample} />
  );
}
```

## Command Configuration

The component uses two configuration arrays from `config/voiceCommands`:

### Quick Commands
```typescript
interface QuickCommand {
  phrase: string;    // Display text
  template: string;  // Command template
}

const QUICK_COMMANDS: QuickCommand[] = [
  { phrase: "Add Note", template: "add note {text}" },
  // ... more quick commands
];
```

### Voice Commands
```typescript
interface VoiceCommand {
  name: string;
  description: string;
  triggers: string[];
  parameters?: {
    name: string;
    description: string;
    required: boolean;
  }[];
  examples: string[];
}

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    name: "Add Note",
    description: "Adds a new note to the inspection",
    triggers: ["add note", "create note"],
    parameters: [
      {
        name: "text",
        description: "The note content",
        required: true
      }
    ],
    examples: [
      "add note water damage in corner",
      "create note ceiling shows signs of mold"
    ]
  },
  // ... more commands
];
```

## Component Structure

### Material-UI Components
```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  // ... other components
} from '@mui/material';
```

### Icons
```typescript
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Mic as MicIcon,
  PlayArrow as PlayIcon,
  VolumeUp as SpeakIcon
} from '@mui/icons-material';
```

## Interactive Features

### 1. Example Playback
- Play button to execute example commands
- Integration with command execution system
- Visual feedback during playback

### 2. Text-to-Speech
- Speak button for command pronunciation
- Australian English voice (en-AU)
- Native browser speech synthesis

### 3. Command Navigation
- Expandable sections
- Quick command shortcuts
- Searchable content (via browser)

## UI States

### 1. Dialog States
- Closed (default)
- Open
- Loading content
- Scrolling content

### 2. Command Display
- Collapsed (summary only)
- Expanded (full details)
- Interactive elements
- Parameter highlighting

## Styling

The component uses Material-UI styling with:
- Responsive dialog sizing
- Flexible content layout
- Interactive element styling
- Consistent spacing
- Typography hierarchy
- Color theming

## Best Practices

1. **User Experience**
   - Clear organization
   - Easy navigation
   - Interactive examples
   - Visual hierarchy
   - Responsive design

2. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Focus management
   - Color contrast

3. **Performance**
   - Lazy loading
   - State management
   - Event handling
   - Memory cleanup

## Dependencies

- React
- Material-UI
- Material Icons
- Web Speech API
- voiceCommands config

## Notes

- Consider adding search functionality
- Implement command categories
- Add command history integration
- Support custom command examples
- Add video tutorials
- Implement command chaining examples
