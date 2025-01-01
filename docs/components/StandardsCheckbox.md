# StandardsCheckbox

A checkbox component that controls the inclusion of Australian Standards and industry best practices in reports. This component integrates with the application's global state through AppContext.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | "" | Optional CSS classes to apply to the container |

## Context Integration

The component uses the following values from AppContext:
- `includeStandards`: Boolean state indicating if standards should be included
- `setIncludeStandards`: Function to toggle standards inclusion
- `isSyncing`: Boolean indicating if the application is currently syncing

## Features

### UI States
- **Default**: Displays checkbox with label
- **Checked**: Shows additional descriptive text
- **Syncing**: Displays animated spinner and disables interaction
- **Hover**: Label text darkens for better visibility

### Accessibility
- Proper `aria-label` for screen readers
- Keyboard navigation support through native checkbox
- Visual feedback through hover states
- Disabled state handling during sync operations

## Example Usage

```tsx
import StandardsCheckbox from './components/StandardsCheckbox';

function ReportSettings() {
  return (
    <div className="settings-panel">
      <StandardsCheckbox className="mb-6" />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes for styling:
- Responsive layout with flex positioning
- Smooth transitions for hover states
- Consistent spacing and alignment
- Animated spinner during sync operations

## Best Practices

1. Place the checkbox in a form or settings panel where report configuration occurs
2. Ensure AppContext is properly set up in the parent component tree
3. Handle sync states appropriately to prevent multiple simultaneous toggles
