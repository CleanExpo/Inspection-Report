# UploadFile

A form component that handles file uploads by accepting a file name and base64-encoded content. The component manages its own state and communicates with a server-side upload endpoint.

## Features

### State Management
- `fileName`: Tracks the name of the file to be uploaded
- `fileContent`: Stores the base64-encoded content of the file

### API Integration
- Endpoint: `/api/upload`
- Method: POST
- Request Format:
  ```typescript
  {
    fileName: string;
    fileContent: string; // base64 encoded
  }
  ```

## UI Elements

### Input Fields
- File Name input: Text field for entering the file name
- Content textarea: Large text area for base64-encoded file content
- Upload button: Triggers the file upload process

### Styling
- Uses Tailwind CSS for responsive design
- Container with padding and shadow
- Rounded corners and borders for visual appeal
- Hover effects on interactive elements

## Error Handling

The component implements comprehensive error handling:
1. Input Validation
   - Checks for empty file name
   - Validates presence of file content
2. API Error Handling
   - Catches network errors
   - Handles server response errors
   - Displays user-friendly error messages

## Example Usage

```tsx
import UploadFile from './components/UploadFile';

function FileManagementPage() {
  return (
    <div className="container mx-auto">
      <h1>File Upload</h1>
      <UploadFile />
    </div>
  );
}
```

## Best Practices

1. Ensure proper error handling on the server side
2. Implement file size limits if needed
3. Consider adding file type validation
4. Add loading states during upload
5. Implement proper security measures for file uploads

## Limitations

- Currently only handles base64-encoded content
- No built-in file type validation
- No progress indicator during upload
- No drag-and-drop functionality

## Future Improvements

Consider implementing:
1. File type validation
2. Upload progress indicator
3. Drag and drop support
4. Multiple file upload capability
5. Preview functionality for supported file types
