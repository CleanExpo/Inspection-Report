# ShareDialog

A comprehensive Material-UI based dialog component for sharing voice notes with configurable settings, link management, and access control.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Controls dialog visibility |
| onClose | () => void | Yes | Callback when dialog is closed |
| notes | VoiceNote[] | Yes | Array of voice notes to be shared |
| onGenerateShareLink | (notes: VoiceNote[], settings: ShareSettings) => Promise<string> | Yes | Callback to generate share link |
| onRevokeAccess | (shareId: string) => Promise<void> | No | Optional callback to revoke access to a shared link |

## Features

### Tab-Based Interface
1. **Share Link Tab**
   - Generate new share links
   - Copy link to clipboard
   - QR code generation
   - Quick access to settings

2. **Settings Tab**
   - Link expiration configuration
   - Optional password protection
   - Watermark settings
   - Permission controls (download/comments)

3. **Active Links Tab**
   - List of active share links
   - Access statistics
   - Expiration status
   - Revoke access functionality

### Share Settings

```typescript
interface ShareSettings {
  expiresIn: number;     // Duration in hours
  allowDownload: boolean; // Permission to download
  allowComments: boolean; // Permission to comment
  password?: string;      // Optional protection
  watermark?: string;     // Optional watermark
}
```

### Share Records

```typescript
interface ShareRecord {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  settings: ShareSettings;
  accessCount: number;
}
```

## Example Usage

```tsx
import ShareDialog from './components/ShareDialog';
import { VoiceNote } from '../types/voice';

function NotesManager() {
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<VoiceNote[]>([]);

  const handleGenerateLink = async (notes: VoiceNote[], settings: ShareSettings) => {
    // Implement link generation logic
    const response = await api.generateShareLink({ notes, settings });
    return response.url;
  };

  const handleRevokeAccess = async (shareId: string) => {
    // Implement access revocation logic
    await api.revokeAccess(shareId);
  };

  return (
    <>
      <Button onClick={() => setShareDialogOpen(true)}>
        Share Notes
      </Button>

      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        notes={selectedNotes}
        onGenerateShareLink={handleGenerateLink}
        onRevokeAccess={handleRevokeAccess}
      />
    </>
  );
}
```

## UI/UX Features

### Visual Feedback
- Loading states during operations
- Success indicators for copied links
- Error alerts for failed operations
- Color-coded expiration status

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Clear visual hierarchy
- Responsive design

### Error Handling
- Comprehensive error states
- User-friendly error messages
- Graceful fallbacks
- Network error handling

## Best Practices

1. **State Management**
   - Keep track of loading states
   - Handle errors gracefully
   - Maintain share records
   - Clear state on dialog close

2. **Security**
   - Implement proper access controls
   - Secure password handling
   - Regular link expiration
   - Access revocation

3. **Performance**
   - Lazy loading of tabs
   - Efficient record updates
   - Optimized re-renders
   - Proper cleanup

## Dependencies

- @mui/material: Core UI components
- @mui/icons-material: Icon components
- React 'use client' directive for Next.js compatibility

## Customization

The component can be customized through:
1. Material-UI theme customization
2. Props for behavior control
3. Share settings configuration
4. Custom styling via className prop

## Notes

- Ensure proper backend implementation for link generation and revocation
- Consider implementing rate limiting for link generation
- Add analytics tracking for shared link usage
- Consider implementing bulk operations for multiple notes
