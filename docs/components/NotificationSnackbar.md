# NotificationSnackbar

A Material-UI based notification component that displays temporary messages at the bottom of the screen. This component wraps MUI's Snackbar and Alert components to provide a consistent notification system.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| notification | `{ message: string; severity: 'success' \| 'error' \| 'warning' \| 'info' } \| null` | Yes | The notification data to display. Set to null to hide the snackbar |
| onClose | `() => void` | Yes | Callback function to handle snackbar dismissal |

## Features

### Material-UI Integration
- Uses MUI's Snackbar for positioning and auto-hide functionality
- Implements MUI's Alert component for severity-based styling
- Supports all standard MUI Alert severities (success, error, warning, info)

### Behavior
- Auto-hides after 3 seconds (3000ms)
- Positioned at the bottom center of the screen
- Elevated appearance with shadow
- Filled variant for better visibility

## Example Usage

```tsx
import NotificationSnackbar from './components/NotificationSnackbar';

function App() {
  const [notification, setNotification] = React.useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const handleClose = () => {
    setNotification(null);
  };

  const showSuccess = () => {
    setNotification({
      message: 'Operation completed successfully',
      severity: 'success'
    });
  };

  return (
    <div>
      <button onClick={showSuccess}>Show Success</button>
      <NotificationSnackbar 
        notification={notification}
        onClose={handleClose}
      />
    </div>
  );
}
```

## Best Practices

1. **State Management**
   - Keep notification state in a parent component or global state
   - Clear notifications after they're dismissed
   - Avoid showing multiple notifications simultaneously

2. **Message Content**
   - Keep messages concise and clear
   - Use appropriate severity levels
   - Include actionable information when relevant

3. **Timing**
   - Consider adjusting autoHideDuration based on message length
   - Allow manual dismissal for important messages

## Accessibility

- Uses semantic HTML through MUI components
- Supports keyboard navigation
- Screen reader friendly
- Color contrast meets WCAG guidelines through MUI theming

## Dependencies

- @mui/material: For Snackbar and Alert components
- React 'use client' directive for Next.js compatibility

## Customization

The component can be customized through:
1. MUI theme customization
2. Direct style overrides using the sx prop
3. Custom duration through autoHideDuration
4. Different anchor positions if needed
