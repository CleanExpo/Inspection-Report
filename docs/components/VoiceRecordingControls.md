# VoiceRecordingControls

A React component that provides a user interface for controlling voice recording sessions, including recording controls, duration display, and transcript visibility.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isRecording | boolean | Yes | Current recording state |
| isProcessing | boolean | Yes | Processing state indicator |
| duration | number | Yes | Current recording duration in milliseconds |
| showTranscript | boolean | Yes | Transcript visibility state |
| liveTranscript | string | Yes | Current live transcript text |
| onStartRecording | () => void | Yes | Callback when recording starts |
| onStopRecording | () => void | Yes | Callback when recording stops |
| onToggleTranscript | () => void | Yes | Callback to toggle transcript visibility |
| onVoiceCommand | (command: string) => void | No | Optional callback for voice commands |

## Features

### Core Functionality
- Voice recording controls
- Recording duration display
- Live transcript toggle
- Processing state handling
- Progress tracking

### UI Elements
1. **Recording Controls**
   - Start/Stop button
   - Color-coded states
   - Tooltip guidance
   - Disabled states during processing

2. **Duration Display**
   - Timer icon
   - Formatted time (MM:SS)
   - Only visible during recording

3. **Progress Indicator**
   - Linear progress bar
   - Duration-based progress
   - Only visible during recording

4. **Transcript Controls**
   - Toggle button
   - Visibility state
   - Disabled state handling

## Example Usage

```tsx
import VoiceRecordingControls from './components/VoiceRecordingControls';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement recording start logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Implement recording stop logic
  };

  const handleToggleTranscript = () => {
    setShowTranscript(prev => !prev);
  };

  return (
    <VoiceRecordingControls
      isRecording={isRecording}
      isProcessing={isProcessing}
      duration={duration}
      showTranscript={showTranscript}
      liveTranscript={liveTranscript}
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
      onToggleTranscript={handleToggleTranscript}
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
  Typography,
  Tooltip,
  LinearProgress
} from '@mui/material';
```

### Icons
```typescript
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  TextFields as TranscriptIcon
} from '@mui/icons-material';
```

## UI States

### 1. Idle State
- Blue microphone icon
- Disabled transcript toggle
- No progress bar
- No duration display

### 2. Recording State
- Red stop icon
- Duration display
- Progress bar
- Enabled transcript toggle

### 3. Processing State
- Disabled controls
- Visual processing indicator
- Maintained duration display
- Maintained progress bar

## Utility Functions

### Duration Formatting
```typescript
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
```

## Styling

The component uses Material-UI styling with:
- Flexible layout using Box
- Consistent spacing
- Color-coded states
- Progress visualization
- Icon alignment
- Typography hierarchy

## Best Practices

1. **User Experience**
   - Clear recording status
   - Visual feedback
   - Progress indication
   - Intuitive controls
   - State transitions

2. **Accessibility**
   - ARIA labels
   - Color contrast
   - Disabled states
   - Tooltip guidance
   - Keyboard support

3. **Performance**
   - Efficient re-renders
   - State management
   - Progress updates
   - Duration calculation

## Dependencies

- React
- Material-UI
- Material Icons

## Notes

- Consider adding waveform visualization
- Implement recording time limits
- Add audio level indicator
- Support multiple audio formats
- Add pause/resume functionality
- Implement audio preview
