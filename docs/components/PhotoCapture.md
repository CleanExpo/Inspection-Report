# PhotoCapture

A comprehensive camera interface component built with Material-UI that provides photo capture capabilities with real-time preview, camera switching, quality controls, and caption support.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onCapture | (photo: Omit<PhotoAttachment, 'id'>) => void | Yes | Callback when photo is captured and saved |
| onClose | () => void | No | Optional callback when dialog is closed |
| className | string | No | Optional CSS class for styling |
| maxWidth | number | No | Maximum photo width (default: 1920) |
| maxHeight | number | No | Maximum photo height (default: 1080) |
| defaultQuality | number | No | Default photo quality (0.0-1.0, default: 0.8) |

## Types

```typescript
interface PhotoAttachment {
  url: string;
  dataUrl: string;
  caption?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  metadata: {
    width?: number;
    height?: number;
    deviceInfo: {
      make?: string;
      model?: string;
    };
  };
}

type CameraError = 
  | 'permission_denied'
  | 'device_not_found'
  | 'constraint_error'
  | 'unknown_error';
```

## Features

### Camera Controls
- Real-time camera preview
- Front/back camera switching
- Quality level selection
- Capture button
- Retake capability

### Photo Processing
- JPEG compression
- Quality settings (Low/Medium/High)
- Metadata preservation
- Device information capture
- Automatic file naming

### UI States
1. **Preview Mode**
   - Live camera feed
   - Camera controls
   - Capture button

2. **Review Mode**
   - Captured photo display
   - Caption input
   - Save/Retake options

3. **Processing State**
   - Loading indicators
   - Disabled controls
   - Progress feedback

## Example Usage

```tsx
import PhotoCapture from './components/PhotoCapture';
import { PhotoAttachment } from '../types/photo';

function PhotoManager() {
  const handlePhotoCapture = (photo: Omit<PhotoAttachment, 'id'>) => {
    console.log('Captured photo:', photo);
    // Handle the captured photo
    // e.g., upload to server, add to collection, etc.
  };

  return (
    <PhotoCapture
      onCapture={handlePhotoCapture}
      onClose={() => console.log('Camera closed')}
      maxWidth={1280}
      maxHeight={720}
      defaultQuality={0.8}
    />
  );
}
```

## Implementation Details

### Camera Initialization
```typescript
const startCamera = async () => {
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: cameraSettings.facingMode,
      width: { ideal: maxWidth },
      height: { ideal: maxHeight }
    }
  };

  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  // ... stream handling
};
```

### Photo Capture Process
```typescript
const capturePhoto = () => {
  // Draw video frame to canvas
  context.drawImage(video, 0, 0);
  
  // Convert to data URL with quality setting
  const dataUrl = canvas.toDataURL('image/jpeg', cameraSettings.quality);
};
```

## Error Handling

### Error Types
1. **Permission Denied**
   - User rejected camera access
   - Browser security restrictions

2. **Device Not Found**
   - No camera available
   - Hardware disconnected

3. **Constraint Error**
   - Resolution not supported
   - Camera mode unavailable

4. **Unknown Errors**
   - Network issues
   - Browser compatibility

## Best Practices

1. **Performance**
   - Proper stream cleanup
   - Memory management
   - Resource release
   - Efficient canvas usage

2. **User Experience**
   - Clear error messages
   - Loading indicators
   - Responsive controls
   - Preview feedback

3. **Security**
   - Permission handling
   - Secure data handling
   - Error sanitization
   - Resource cleanup

## Dependencies

- @mui/material: UI components
- @mui/icons-material: Icons
- React 'use client' directive for Next.js
- MediaStream API support

## Browser Support

- Requires modern browser with:
  - getUserMedia API
  - Canvas API
  - MediaStream API
  - Blob API

## Notes

- Consider adding flash support
- Add image filters/effects
- Implement face detection
- Add burst mode
- Consider adding video capture
- Implement image stabilization
- Add focus controls
