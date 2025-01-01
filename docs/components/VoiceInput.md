# VoiceInput

A React component that provides voice input functionality using the Web Speech API, allowing users to capture speech input and convert it to text.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onCapture | (text: string) => void | Yes | Callback function that receives the transcribed text |
| className | string | No | Optional CSS class for styling the container |

## Features

### Core Functionality
- Speech-to-text conversion using Web Speech API
- Australian English language support (en-AU)
- Browser compatibility detection
- Error handling and user feedback

### UI States
1. **Idle State**
   - Blue button with microphone icon
   - "Start Voice Input" text
   - Hover and focus states

2. **Recording State**
   - Red button color
   - Pulsing microphone animation
   - "Listening..." text
   - Disabled state to prevent multiple recordings

3. **Error State**
   - Error message display
   - Red text color
   - Graceful fallback for unsupported browsers

## Example Usage

```tsx
import VoiceInput from './components/VoiceInput';

function VoiceNoteApp() {
  const handleVoiceCapture = (text: string) => {
    console.log('Captured text:', text);
    // Process the transcribed text
  };

  return (
    <VoiceInput
      onCapture={handleVoiceCapture}
      className="my-4"
    />
  );
}
```

## Technical Details

### Speech Recognition Setup
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-AU";
recognition.continuous = false;
recognition.interimResults = false;
```

### Event Handlers
1. **onresult**
   - Captures final transcription
   - Calls onCapture callback
   - Resets listening state

2. **onerror**
   - Handles recognition errors
   - Updates error state
   - Resets listening state

3. **onend**
   - Cleanup when recognition ends
   - Resets listening state

## Styling

The component uses Tailwind CSS for styling with:
- Flexible container sizing
- Responsive button design
- State-based colors
- Microphone icon animation
- Focus and hover states
- Disabled state styling

## Browser Support

- Chrome/Edge: Full support
- Firefox: Requires permissions
- Safari: Limited support
- Mobile: Varies by platform

## Error Handling

1. **Browser Compatibility**
   - Checks for SpeechRecognition API
   - Provides user feedback for unsupported browsers

2. **Recognition Errors**
   - Network issues
   - Permission denied
   - No speech detected
   - Visual error feedback

## Best Practices

1. **User Experience**
   - Clear visual feedback
   - Disabled states during recording
   - Error messages for issues
   - Smooth state transitions

2. **Accessibility**
   - Focus management
   - Color contrast
   - Button states
   - Error announcements

3. **Performance**
   - Cleanup on unmount
   - Optimized re-renders
   - Memory management

## Dependencies

- React
- Tailwind CSS
- Web Speech API

## Notes

- Consider adding language selection
- Add support for continuous recording
- Implement interim results
- Add noise cancellation
- Support for multiple dialects
- Add voice command parsing
