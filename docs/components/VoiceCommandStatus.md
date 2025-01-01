# VoiceCommandStatus

A React component that provides a status interface for voice command functionality, including controls for starting/stopping voice recognition and displaying command history.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| className | string | No | Optional CSS class for styling the container |

## Features

### Core Functionality
- Voice command status monitoring
- Start/stop voice recognition controls
- Command history display
- Error state handling
- Integration with VoiceCommandContext

### UI Elements
1. **Header Section**
   - Title "Voice Commands"
   - Control buttons (Start/Stop, Clear History)
   - Status indicators

2. **Status Display**
   - Current listening state
   - Last executed command
   - Command parameters
   - Error messages

3. **Control Actions**
   - Toggle voice recognition
   - Clear command history
   - Error acknowledgment

## Example Usage

```tsx
import VoiceCommandStatus from './components/VoiceCommandStatus';
import { VoiceCommandProvider } from '../contexts/VoiceCommandContext';

function VoiceControlPanel() {
  return (
    <VoiceCommandProvider>
      <VoiceCommandStatus className="my-4" />
    </VoiceCommandProvider>
  );
}
```

## Context Integration

The component uses the VoiceCommandContext which provides:

```typescript
interface VoiceCommandState {
  isListening: boolean;
  lastCommand: {
    type: string;
    parameters: Record<string, any>;
  } | null;
  commandHistory: Array<any>;
  error: string | null;
}

interface VoiceCommandContextValue {
  state: VoiceCommandState;
  startListening: () => void;
  stopListening: () => void;
  clearHistory: () => void;
}
```

## UI States

### 1. Idle State
- Microphone icon (blue)
- "Click the microphone to start" message
- Clear history button (if history exists)

### 2. Listening State
- Stop icon (red)
- "Listening for commands..." message
- Disabled clear history button

### 3. Error State
- Error alert message
- Error details
- Recovery options

## Component Structure

### Material-UI Components
```typescript
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
```

### Icons
```typescript
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
```

## Styling

The component uses a combination of Material-UI and Tailwind CSS:
- Paper container with padding
- Flex layout for header
- Spacing utilities
- Color schemes for different states
- Responsive design considerations

## Command Display

### Last Command Format
```typescript
{
  type: string;           // Command type/name
  parameters: {           // Command parameters
    [key: string]: any;  // Parameter key-value pairs
  }
}
```

Example display:
```
Last command: setVolume (level: 50)
```

## Error Handling

1. **Visual Feedback**
   - Error alerts
   - Color-coded status
   - Clear error messages

2. **Recovery Actions**
   - Stop listening
   - Clear history
   - Restart recognition

## Best Practices

1. **User Experience**
   - Clear status indication
   - Immediate feedback
   - Intuitive controls
   - Error recovery paths

2. **Accessibility**
   - Color contrast
   - Button labels
   - Screen reader support
   - Keyboard navigation

3. **Performance**
   - Context optimization
   - State management
   - Error boundaries

## Dependencies

- React
- Material-UI
- Material Icons
- Tailwind CSS
- VoiceCommandContext

## Notes

- Consider adding command suggestions
- Implement command validation
- Add command categories
- Support command shortcuts
- Add command search/filter
- Implement undo/redo for commands
