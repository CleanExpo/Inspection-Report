# VoiceTranscriptDisplay

A React component that displays voice transcription text with various states including recording, processing, and confidence scoring.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isRecording | boolean | Yes | Current recording state |
| isProcessing | boolean | Yes | Processing state indicator |
| transcript | string | No | Transcribed text content |
| confidence | number | No | Transcription confidence score (0-1) |
| className | string | No | Optional CSS class for styling |

## Features

### Core Functionality
- Live transcription display
- Recording status indicator
- Processing feedback
- Confidence score display
- Empty state handling

### UI Elements
1. **Status Indicators**
   - Recording animation
   - Processing spinner
   - Empty state message
   - Confidence score

2. **Display States**
   - Recording feedback
   - Processing feedback
   - Transcript content
   - Empty content

3. **Visual Feedback**
   - Animated recording dot
   - Loading spinner
   - State-based messages
   - Confidence percentage

## Example Usage

```tsx
import VoiceTranscriptDisplay from './components/VoiceTranscriptDisplay';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0.85);

  return (
    <VoiceTranscriptDisplay
      isRecording={isRecording}
      isProcessing={isProcessing}
      transcript={transcript}
      confidence={confidence}
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
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
```

## UI States

### 1. Recording State
```tsx
<Box className="flex items-center space-x-2 text-red-500">
  <span className="animate-pulse">●</span>
  <Typography>Recording...</Typography>
</Box>
```
- Pulsing red dot
- "Recording..." text
- Animated feedback

### 2. Processing State
```tsx
<Box className="flex items-center space-x-2">
  <CircularProgress size={20} />
  <Typography>Processing audio...</Typography>
</Box>
```
- Loading spinner
- Processing message
- Visual feedback

### 3. Transcript Display State
```tsx
<Box>
  <Typography>{transcript}</Typography>
  {confidence !== undefined && (
    <Typography variant="caption" color="textSecondary">
      Confidence: {Math.round(confidence * 100)}%
    </Typography>
  )}
</Box>
```
- Transcribed text
- Confidence score
- Secondary text styling

### 4. Empty State
```tsx
<Typography color="textSecondary">
  No transcript available
</Typography>
```
- Default message
- Secondary text color
- Placeholder content

## Layout Structure

### Container
- Paper component
- Padding
- Minimum height
- Flexible spacing

### Content Organization
- Title section
- Status display
- Transcript content
- Confidence score

## Styling

The component uses:
- Material-UI components
- Tailwind CSS utilities
- Flex layouts
- Consistent spacing
- Animation effects
- Color states

## Best Practices

1. **User Experience**
   - Clear state indication
   - Immediate feedback
   - Smooth transitions
   - Readable layout
   - Informative display

2. **Accessibility**
   - Color contrast
   - Text hierarchy
   - Status messages
   - Screen reader support
   - Focus states

3. **Performance**
   - Efficient updates
   - Smooth animations
   - State management
   - Layout stability

## Dependencies

- React
- Material-UI
- Tailwind CSS

## Notes

- Consider adding text selection
- Implement auto-scroll
- Add word highlighting
- Support interim results
- Add error states
- Implement text formatting
