# VoiceMacros

A React component that displays and manages voice command macros, allowing users to execute sequences of voice commands and manage saved macros.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| macros | VoiceMacro[] | No | Array of voice command macros (defaults to []) |
| onExecute | (macro: VoiceMacro) => Promise<void> | No | Callback when executing a macro |
| onDelete | (macroId: string) => Promise<void> | No | Callback when deleting a macro |
| className | string | No | Optional CSS class for styling |

## Types

```typescript
interface VoiceMacro {
  id: string;           // Unique identifier
  name: string;         // Display name
  commands: VoiceCommand[]; // List of commands
  createdAt: string;    // Creation timestamp
}

interface VoiceCommand {
  type: string;         // Command type/name
  parameters: Record<string, string>; // Command parameters
}
```

## Features

### Core Functionality
- Display list of voice command macros
- Execute macro sequences
- Delete saved macros
- Error handling and feedback
- Command parameter formatting

### UI Elements
1. **Macro List**
   - Macro name and creation date
   - Command sequence display
   - Execute and delete actions
   - Empty state handling

2. **Action Controls**
   - Play button for execution
   - Delete button (if onDelete provided)
   - Loading indicators
   - Disabled states

3. **Error Display**
   - Error alerts
   - Error message formatting
   - Error state handling

## Example Usage

```tsx
import VoiceMacros from './components/VoiceMacros';

function VoiceControlPanel() {
  const macros = [
    {
      id: '1',
      name: 'Inspection Start',
      createdAt: new Date().toISOString(),
      commands: [
        {
          type: 'start_inspection',
          parameters: { location: 'main entrance' }
        },
        {
          type: 'take_photo',
          parameters: { subject: 'entrance condition' }
        }
      ]
    }
  ];

  const handleExecute = async (macro: VoiceMacro) => {
    // Implement macro execution logic
    console.log('Executing macro:', macro.name);
  };

  const handleDelete = async (macroId: string) => {
    // Implement macro deletion logic
    console.log('Deleting macro:', macroId);
  };

  return (
    <VoiceMacros
      macros={macros}
      onExecute={handleExecute}
      onDelete={handleDelete}
      className="my-4"
    />
  );
}
```

## Component Structure

### Material-UI Components
```typescript
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
```

### Icons
```typescript
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
```

## UI States

### 1. Empty State
- "No macros available" message
- Centered text display
- Secondary color text

### 2. List State
- Macro entries with details
- Command sequences
- Action buttons
- Creation timestamps

### 3. Active State
- Loading indicator
- Disabled controls
- Visual feedback
- Error handling

## Utility Functions

### Command Formatting
```typescript
const formatCommand = (command: VoiceCommand): string => {
  const params = Object.entries(command.parameters)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  return `${command.type}${params ? ` (${params})` : ''}`;
};
```

## Error Handling

1. **Execution Errors**
   - Try-catch blocks
   - Error state management
   - User feedback
   - Error recovery

2. **Deletion Errors**
   - Error messaging
   - State updates
   - Console logging
   - Recovery options

## Styling

The component uses Material-UI styling with:
- Paper container
- List layout
- Spacing utilities
- Typography hierarchy
- Icon buttons
- Loading states

## Best Practices

1. **User Experience**
   - Clear macro listing
   - Immediate feedback
   - Loading states
   - Error messages
   - Disabled states

2. **Accessibility**
   - ARIA labels
   - Focus management
   - Keyboard support
   - Screen reader text
   - Color contrast

3. **Performance**
   - Async operations
   - State management
   - Error boundaries
   - Loading indicators

## Dependencies

- React
- Material-UI
- Material Icons
- Tailwind CSS (for utility classes)

## Notes

- Consider adding macro creation UI
- Implement macro editing
- Add macro categories
- Support macro scheduling
- Add execution history
- Implement macro sharing
