# ImageUploader

A React component that provides a drag-and-drop interface for uploading images with support for multiple files, type validation, and progress feedback.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onUpload | (images: InspectionImage[]) => void | Yes | Callback function called with array of uploaded images |
| maxFiles | number | Yes | Maximum number of files allowed per upload |
| acceptedTypes | string[] | Yes | Array of accepted MIME types |
| className | string | No | Optional CSS class for styling |

## Types

```typescript
interface InspectionImage {
  id: string;
  url: string;
  uploadedAt: string;
  caption: string;
}
```

## Features

### File Handling
- Multiple file selection
- File type validation
- Maximum file limit enforcement
- Automatic file input clearing after upload

### Upload Process
- FormData-based upload
- Sequential file processing
- Error handling per file
- Upload progress indication

### UI States
- Default upload prompt
- Uploading state
- Error state with feedback
- Disabled state during upload

## Example Usage

```tsx
import ImageUploader from './components/ImageUploader';
import { InspectionImage } from '../types/inspection';

function InspectionForm() {
  const handleImagesUploaded = (images: InspectionImage[]) => {
    // Handle the uploaded images
    console.log('Uploaded images:', images);
  };

  return (
    <div className="inspection-form">
      <ImageUploader
        onUpload={handleImagesUploaded}
        maxFiles={5}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        className="mb-4"
      />
    </div>
  );
}
```

## UI Components

### Upload Zone
- Dashed border container
- Upload icon
- Informative text
- File type information
- Visual feedback on hover

### Error Display
- Red background alert
- Clear error message
- Proper spacing
- Automatic dismissal on retry

## Implementation Details

### File Processing
```typescript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### Response Handling
```typescript
const uploadedImages: InspectionImage[] = [];
// ... upload process ...
uploadedImages.push({
  id: `img-${Date.now()}-${i}`,
  url: data.url,
  uploadedAt: new Date().toISOString(),
  caption: file.name
});
```

## Error Handling

1. **Pre-upload Validation**
   - File count check
   - File type validation
   - Clear error messaging

2. **Upload Process**
   - Network error handling
   - Server response validation
   - Individual file upload failures

## Best Practices

1. **User Experience**
   - Clear upload instructions
   - Visual feedback during upload
   - Error recovery guidance
   - Progress indication

2. **Performance**
   - Sequential file processing
   - Proper cleanup after upload
   - Efficient state management
   - Input reset after completion

3. **Security**
   - File type validation
   - Size limit enforcement
   - Secure upload endpoint
   - Error sanitization

## Styling

The component uses Tailwind CSS for styling:
- Responsive layout
- Hover effects
- Loading states
- Error presentation

## Dependencies

- React with TypeScript support
- Tailwind CSS for styling
- Fetch API for uploads

## Notes

- Consider adding file size limits
- Add preview functionality
- Implement drag-and-drop support
- Add upload progress percentage
- Consider chunked uploads for large files
- Add retry mechanism for failed uploads
- Consider adding image compression options
