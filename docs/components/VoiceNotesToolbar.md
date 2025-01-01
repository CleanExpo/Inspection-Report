# VoiceNotesToolbar

A React component that provides a toolbar interface for controlling voice recording and photo capture functionality, with state-based controls and visual feedback.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isRecording | boolean | Yes | Current recording state |
| isProcessing | boolean | Yes | Processing state indicator |
| onStartRecording | () => void | Yes | Callback when recording starts |
| onStopRecording | () => void | Yes | Callback when recording stops |
| onOpenPhotoCapture | () => void | Yes | Callback to open photo capture |
| className | string | No | Optional CSS class for styling |

## Features

### Core Functionality
- Voice recording controls
- Photo capture trigger
- Processing state handling
- Visual feedback
- State-based interactions

### UI Elements
1. **Recording Controls**
   - Start/Stop recording button
   - Color-coded states (primary/error)
   - Loading indicator during processing
   - Disabled states

2. **Photo Capture**
   - Camera button
   - Disabled during recording/processing
   - Tooltip guidance

3. **Visual Feedback**
   - Loading indicators
   - State-based colors
   - Tooltips
   - Disabled states

## Example Usage

```tsx
import VoiceNotesToolbar from './components/VoiceNotesToolbar';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement recording start logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Implement recording stop logic
  };

  const handleOpenPhotoCapture = () => {
    // Implement photo capture logic
  };

  return (
    <VoiceNotesToolbar
      isRecording={isRecording}
      isProcessing={isProcessing}
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
      onOpenPhotoCapture={handleOpenPhotoCapture}
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
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
```

### Icons
```typescript
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
```

## UI States

### 1. Idle State
- Blue microphone icon
- Enabled camera button
- Ready for recording

### 2. Recording State
- Red stop icon
- Disabled camera button
- Active recording indicator

### 3. Processing State
- Loading spinner
- Disabled controls
- Visual feedback

## Button States

### Recording Button
1. **Start Recording (Idle)**
   - Blue microphone icon
   - "Start Recording" tooltip
   - Enabled when not processing

2. **Stop Recording (Active)**
   - Red stop icon
   - "Stop Recording" tooltip
   - Enabled when not processing

3. **Processing**
   - Loading spinner
   - Disabled state
   - Visual feedback

### Photo Button
1. **Enabled**
   - Camera icon
   - "Take Photo" tooltip
   - Available when not recording/processing

2. **Disabled**
   - Grayed out camera icon
   - Disabled during recording/processing
   - Visual feedback

## Styling

The component uses:
- Material-UI components
- Tailwind CSS utilities
- Flex layout
- Consistent spacing
- State-based colors
- Icon sizing

## Best Practices

1. **User Experience**
   - Clear button states
   - Immediate feedback
   - Intuitive controls
   - Visual consistency
   - State transitions

2. **Accessibility**
   - ARIA labels
   - Tooltip guidance
   - Color contrast
   - Disabled states
   - Focus management

3. **Performance**
   - Minimal re-renders
   - Efficient state handling
   - Loading indicators
   - Smooth transitions

## Dependencies

- React
- Material-UI
- Material Icons
- Tailwind CSS

## Notes

- Consider adding keyboard shortcuts
- Implement recording timer
- Add audio level indicator
- Support multiple recording modes
- Add quick settings access
- Implement undo/redo
