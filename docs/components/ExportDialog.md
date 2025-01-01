# ExportDialog

A Material-UI based dialog component for exporting voice notes with configurable options. The component provides a user-friendly interface for selecting export preferences and handles the export process with proper feedback.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Controls dialog visibility |
| onClose | () => void | Yes | Callback when dialog is closed |
| notes | VoiceNote[] | Yes | Array of voice notes to export |
| onExport | (options: ExportOptions) => Promise<void> | Yes | Callback to handle export process |
| className | string | No | Optional CSS class for styling |

## Export Options

```typescript
interface ExportOptions {
  includePhotos: boolean;    // Include attached photos
  includeAnalysis: boolean;  // Include AI analysis
  includeMetadata: boolean;  // Include note metadata
  format: 'pdf' | 'docx';    // Export file format
}
```

## Features

### Dynamic Option States
- Automatically disables photo inclusion if no photos exist
- Disables analysis option if no analyzed notes present
- Shows count of available photos and analyzed notes
- Real-time option toggling

### Export Formats
- PDF format support
- DOCX format support
- Visual format selection with toggle buttons

### Progress & Feedback
- Loading state during export
- Error handling with user feedback
- Disabled controls during export
- Success feedback via dialog closure

## Example Usage

```tsx
import ExportDialog from './components/ExportDialog';
import { VoiceNote } from '../types/voice';

function NotesManager() {
  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<VoiceNote[]>([]);

  const handleExport = async (options: ExportOptions) => {
    try {
      // Implement export logic
      await api.exportNotes(selectedNotes, options);
      // Handle success (e.g., show notification)
    } catch (error) {
      // Handle error
      throw new Error('Export failed: ' + error.message);
    }
  };

  return (
    <>
      <Button onClick={() => setExportDialogOpen(true)}>
        Export Notes
      </Button>

      <ExportDialog
        open={isExportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        notes={selectedNotes}
        onExport={handleExport}
      />
    </>
  );
}
```

## UI States

### Default State
- All options visible and configurable
- Format selection available
- Export button enabled

### Loading State
- Progress indicator on export button
- All controls disabled
- Cancel button disabled
- "Exporting..." text shown

### Error State
- Error alert displayed at top
- All controls re-enabled
- Original button state restored

## Best Practices

1. **Error Handling**
   - Provide clear error messages
   - Allow retry after failure
   - Preserve user selections
   - Log errors for debugging

2. **Performance**
   - Optimize photo processing
   - Handle large note sets
   - Consider batch processing
   - Cache export options

3. **User Experience**
   - Preserve last used settings
   - Show progress for large exports
   - Provide export size estimates
   - Clear success/failure feedback

## Dependencies

- @mui/material: Core UI components
- React 'use client' directive for Next.js compatibility

## Accessibility

- Proper dialog role and attributes
- Keyboard navigation support
- Screen reader friendly labels
- Focus management during export

## Notes

- Consider implementing export templates
- Add preview functionality
- Support batch export limits
- Add export format customization options
- Consider implementing export progress tracking
- Add support for custom export naming conventions
