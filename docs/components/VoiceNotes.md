# VoiceNotes

A comprehensive React component that combines voice recording, note management, and photo capture functionality into a unified interface for creating and managing voice notes with optional photo attachments.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| jobNumber | string | Yes | Identifier for the current job/session |
| className | string | No | Optional CSS class for styling |

## Features

### Core Functionality
- Voice note recording
- Live transcription display
- Note management (create, update, delete)
- Photo capture integration
- Error handling and feedback

### Component Integration
1. **Voice Recording**
   - Recording controls via VoiceNotesToolbar
   - Live transcription via VoiceTranscriptDisplay
   - Processing state management

2. **Note Management**
   - Note list display
   - Note editing capabilities
   - Note deletion
   - Photo attachment management

3. **Photo Integration**
   - Photo capture modal
   - Photo attachment to notes
   - Photo management (update, delete)

## Example Usage

```tsx
import VoiceNotes from './components/VoiceNotes';

function InspectionNotes() {
  return (
    <VoiceNotes
      jobNumber="INS-2024-001"
      className="my-4"
    />
  );
}
```

## Component Structure

### Subcomponents
```typescript
import VoiceNotesToolbar from './VoiceNotesToolbar';
import VoiceTranscriptDisplay from './VoiceTranscriptDisplay';
import NoteList from './NoteList';
import PhotoCapture from './PhotoCapture';
```

### Custom Hook
```typescript
import { useVoiceNotesLogic } from '../hooks/useVoiceNotesLogic';

// Hook provides:
interface VoiceNotesLogic {
  notes: VoiceNote[];
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  isPhotoCaptureOpen: boolean;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleUpdateNote: (note: VoiceNote) => void;
  handleDeleteNote: (noteId: string) => void;
  handleAddPhoto: (photo: PhotoAttachment) => void;
  handleUpdatePhoto: (noteId: string, photo: PhotoAttachment) => void;
  handleDeletePhoto: (noteId: string, photoId: string) => void;
  handleOpenPhotoCapture: () => void;
  handleClosePhotoCapture: () => void;
}
```

## Types

```typescript
interface VoiceNote {
  id: string;
  text: string;
  timestamp: string;
  photos?: PhotoAttachment[];
}

interface PhotoAttachment {
  id: string;
  url: string;
  caption?: string;
  // ... other photo properties
}
```

## UI States

### 1. Initial State
- Empty notes list
- Recording controls ready
- Photo capture button available

### 2. Recording State
- Active recording indicator
- Live transcription display
- Disabled photo capture

### 3. Processing State
- Loading indicators
- Disabled controls
- Progress feedback

### 4. Error State
- Error message display
- Recovery options
- Continued functionality

### 5. Photo Capture State
- Modal overlay
- Camera preview
- Capture controls

## Event Handlers

### Recording Controls
- Start recording
- Stop recording
- Processing management

### Note Management
- Note updates
- Note deletion
- Photo attachment

### Photo Management
- Photo capture
- Photo updates
- Photo deletion

## Styling

The component uses:
- Material-UI Paper container
- Tailwind CSS utilities
- Consistent spacing
- Responsive layout
- Error state styling

## Best Practices

1. **User Experience**
   - Clear recording status
   - Immediate feedback
   - Error recovery
   - Intuitive controls
   - Progress indication

2. **Performance**
   - Efficient state management
   - Optimized re-renders
   - Resource cleanup
   - Error boundaries

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

4. **Error Handling**
   - Clear error messages
   - Recovery options
   - Graceful degradation
   - State preservation

## Dependencies

- React
- Material-UI
- Tailwind CSS
- useVoiceNotesLogic hook
- VoiceNotesToolbar component
- VoiceTranscriptDisplay component
- NoteList component
- PhotoCapture component

## Notes

- Consider adding note categories
- Implement note search
- Add voice command support
- Support note templates
- Add batch operations
- Implement note sharing
- Add export functionality
