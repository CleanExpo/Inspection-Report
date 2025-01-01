# PhotoDisplay

A feature-rich photo display component built with Material-UI that provides image viewing, zooming, fullscreen capabilities, metadata display, and navigation controls.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| photo | PhotoAttachment | Yes | Photo object to display |
| options | PhotoDisplayOptions | No | Display configuration options |
| onDelete | (photo: PhotoAttachment) => void | No | Callback when photo is deleted |
| className | string | No | Optional CSS class for styling |
| nextPhoto | PhotoAttachment | No | Next photo for navigation |
| prevPhoto | PhotoAttachment | No | Previous photo for navigation |
| onNavigate | (direction: 'next' \| 'prev') => void | No | Navigation callback |

## Types

```typescript
interface PhotoAttachment {
  id: string;
  url: string;
  caption?: string;
  fileName: string;
  uploadedAt: string;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    deviceInfo?: {
      make?: string;
      model?: string;
    };
    location?: {
      lat: number;
      lng: number;
    };
  };
}

interface PhotoDisplayOptions {
  showCaption?: boolean;    // Show photo caption (default: true)
  showMetadata?: boolean;   // Show photo metadata (default: true)
  showTags?: boolean;       // Show photo tags (default: true)
  allowDownload?: boolean;  // Show download button (default: true)
  allowDelete?: boolean;    // Show delete button (default: true)
  maxHeight?: number;       // Maximum display height (default: 300)
  maxWidth?: number;        // Maximum display width (default: 400)
}
```

## Features

### Display Modes
1. **Thumbnail View**
   - Constrained size display
   - Hover controls overlay
   - Caption and metadata
   - Quick action buttons

2. **Zoomed View**
   - Full-size image display
   - Navigation controls
   - Metadata overlay
   - Fullscreen support

### Interactive Controls
- Zoom functionality
- Download capability
- Delete option
- Navigation arrows
- Fullscreen toggle
- Metadata toggle

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Esc | Close zoomed view |
| ← | Previous photo |
| → | Next photo |
| f | Toggle fullscreen |
| i | Toggle metadata overlay |

## Example Usage

```tsx
import PhotoDisplay from './components/PhotoDisplay';
import { PhotoAttachment } from '../types/photo';

function PhotoGallery() {
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDelete = (photo: PhotoAttachment) => {
    setPhotos(photos.filter(p => p.id !== photo.id));
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    setCurrentIndex(prev => 
      direction === 'next' 
        ? Math.min(prev + 1, photos.length - 1)
        : Math.max(prev - 1, 0)
    );
  };

  return (
    <PhotoDisplay
      photo={photos[currentIndex]}
      nextPhoto={photos[currentIndex + 1]}
      prevPhoto={photos[currentIndex - 1]}
      onDelete={handleDelete}
      onNavigate={handleNavigate}
      options={{
        maxWidth: 600,
        maxHeight: 400,
        showCaption: true,
        showMetadata: true,
        showTags: true
      }}
    />
  );
}
```

## UI States

### Loading State
- Skeleton placeholder
- Progress indicators
- Error handling
- Lazy loading support

### Interactive States
- Hover effects
- Active controls
- Loading feedback
- Error messages

### Responsive Design
- Mobile optimization
- Fullscreen support
- Flexible sizing
- Touch controls

## Error Handling

1. **Image Loading**
   - Load failure detection
   - Error message display
   - Fallback UI
   - Retry capability

2. **Download Errors**
   - Network error handling
   - Progress feedback
   - Error notifications
   - Recovery options

## Best Practices

1. **Performance**
   - Lazy loading
   - Image optimization
   - Memory management
   - Event cleanup

2. **Accessibility**
   - Keyboard navigation
   - ARIA labels
   - Focus management
   - Screen reader support

3. **User Experience**
   - Smooth transitions
   - Clear feedback
   - Intuitive controls
   - Responsive layout

## Dependencies

- @mui/material: UI components
- @mui/icons-material: Icons
- React 'use client' directive for Next.js

## Notes

- Consider adding image editing capabilities
- Implement zoom levels
- Add rotation controls
- Support touch gestures
- Add image comparison view
- Implement batch operations
- Add sharing capabilities
