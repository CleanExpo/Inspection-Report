# BatchTagDialog

A Material-UI based dialog component for managing tags in batch operations. This component provides an interface for adding and removing tags, with support for existing tag suggestions and validation.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Controls dialog visibility |
| onClose | () => void | Yes | Callback when dialog is closed |
| onSave | (updates: TagUpdate) => Promise<void> | Yes | Callback to save tag changes |
| isProcessing | boolean | No | Loading state indicator (default: false) |
| existingTags | string[] | No | Array of existing tags for suggestions (default: []) |
| className | string | No | Optional CSS class for styling |

## Features

### Tag Management
- Add new tags individually
- Remove tags with one click
- Reuse existing tags via suggestions
- Prevent duplicate tags
- Enter key support for quick addition

### Validation
- Empty tag prevention
- Duplicate tag detection
- Minimum tag requirement
- Real-time error feedback

### UI States
- Default state with tag input
- Processing state during save
- Error state with feedback
- Empty state handling

## Example Usage

```tsx
import BatchTagDialog from './components/BatchTagDialog';

function TagManager() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  
  const existingTags = ['important', 'review', 'urgent', 'follow-up'];

  const handleSave = async (updates: { tags: string[] }) => {
    try {
      setProcessing(true);
      // Implement tag saving logic
      await api.updateTags(updates.tags);
      setDialogOpen(false);
    } catch (error) {
      throw new Error('Failed to save tags: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Manage Tags
      </Button>

      <BatchTagDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        isProcessing={isProcessing}
        existingTags={existingTags}
      />
    </>
  );
}
```

## Interface

### Tag Input Section
- Text field for new tag entry
- Add button for tag confirmation
- Enter key support for quick addition
- Error message display area

### Existing Tags Section
- Clickable chips for quick addition
- Visual distinction from new tags
- Organized layout with proper spacing
- Only shown when existingTags provided

### New Tags Display
- Chip-based presentation
- Delete functionality
- Clear visual feedback
- Proper spacing and wrapping

## State Management

### Local States
```typescript
const [tags, setTags] = useState<string[]>([]);
const [newTag, setNewTag] = useState('');
const [error, setError] = useState<string | null>(null);
```

### State Cleanup
- Resets all state when dialog opens
- Clears input after tag addition
- Resets errors after successful actions

## Error Handling

1. **Input Validation**
   - Empty tag prevention
   - Duplicate tag detection
   - Minimum tag requirement

2. **Save Operation**
   - Network error handling
   - User feedback
   - State preservation on error

## Best Practices

1. **User Experience**
   - Clear error messages
   - Immediate feedback
   - Keyboard support
   - Responsive design

2. **Performance**
   - Efficient state updates
   - Proper cleanup
   - Optimized rendering

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Clear labeling
   - Focus management

## Dependencies

- @mui/material: Core UI components
- React 'use client' directive for Next.js compatibility

## Notes

- Consider adding tag character limits
- Add tag format validation
- Implement tag categories
- Add tag color support
- Consider adding tag description support
- Implement tag search/filter for large sets of existing tags
