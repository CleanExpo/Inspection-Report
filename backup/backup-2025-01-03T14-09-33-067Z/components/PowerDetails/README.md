# PowerDetails Component

A React component for managing and validating power readings for equipment in a job.

## Features

- Real-time power reading validation
- Equipment-specific power limits
- Keyboard shortcuts support
- Unsaved changes detection
- Accessibility compliant
- Responsive design

## Usage

```tsx
import PowerDetails from './components/PowerDetails/PowerDetails';

function JobPage() {
  const handleSave = async (readings) => {
    // Handle saving readings
  };

  return (
    <PowerDetails
      jobNumber="123456-01"
      totalEquipmentPower={5000}
      onSave={handleSave}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| jobNumber | string | Yes | The unique identifier for the job |
| totalEquipmentPower | number | Yes | Maximum allowed power in watts |
| onSave | (readings: PowerReading[]) => Promise<void> | No | Callback when readings are saved |
| className | string | No | Additional CSS classes |

## Features

### Validation
- Negative value prevention
- Power calculation consistency (W = A × V)
- Equipment-specific power limits
- Total power limit enforcement

### User Experience
- Real-time feedback
- Keyboard shortcuts (Ctrl/Cmd + S to save)
- Unsaved changes warning
- Loading states
- Error handling
- Success notifications

### Accessibility
- ARIA labels
- Role attributes
- Live regions
- Keyboard navigation
- Screen reader support

## Development

### Adding New Equipment

Add new equipment to the `EQUIPMENT_LIST` array:

```typescript
const EQUIPMENT_LIST = [
  { 
    id: 'equipment-id', 
    name: 'Equipment Name', 
    maxWatts: 1500 
  },
  // ...
];
```

### Validation Rules

Add new validation rules in the `validateReading` function:

```typescript
const validateReading = (reading: PowerReading): string[] => {
  const errors: string[] = [];
  // Add validation rules here
  return errors;
};
```

### Keyboard Shortcuts

Current shortcuts:
- `Ctrl/Cmd + S`: Save readings

Add new shortcuts in the `handleKeyPress` effect:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey)) {
      switch(e.key) {
        case 's':
          // Save
          break;
        // Add new shortcuts here
      }
    }
  };
}, []);
```

## Testing

Run tests:
```bash
npm test
```

Key test cases:
- Input validation
- Power calculations
- Error handling
- Loading states
- Keyboard shortcuts
- Accessibility compliance

## Future Improvements

1. Move equipment list to API/database
2. Add unit conversion support
3. Implement undo/redo functionality
4. Add data export capabilities
5. Add visualization of power readings
6. Implement auto-save functionality
7. Add bulk actions support
8. Improve performance for large datasets
9. Add offline support
10. Implement real-time collaboration

## Contributing

1. Follow TypeScript best practices
2. Ensure accessibility compliance
3. Add tests for new features
4. Update documentation
5. Follow existing code style
