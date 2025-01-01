# ShortcutsHelp Component

A lightweight dialog component for displaying keyboard shortcuts in a list format. This component serves as a simpler alternative to the KeyboardShortcutsGuide, focusing on straightforward presentation of shortcuts grouped by category.

## Component Interface

```typescript
interface ShortcutsHelpProps {
  open: boolean;         // Controls dialog visibility
  onClose: () => void;   // Handler for closing dialog
  shortcutGroups: ShortcutGroup[]; // Array of shortcut groups to display
}

interface ShortcutGroup {
  title: string;           // Group title
  shortcuts: ShortcutAction[]; // Array of shortcuts in the group
}
```

## Key Features

### 1. Dialog Display
- Uses Material-UI Dialog component
- Responsive width with `maxWidth="sm"` and `fullWidth`
- Clean header with keyboard icon and title
- Close button in the top-right corner

### 2. Shortcut Organization
- Groups shortcuts by category
- Each group includes:
  - Title section
  - List of shortcuts with descriptions
  - Visual dividers between groups
- Dense list layout for compact presentation

### 3. Shortcut Formatting

```typescript
const formatShortcut = (shortcut: ShortcutAction): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
};
```

Features:
- Consistent key combination formatting
- Automatic uppercase conversion for key names
- Support for Ctrl, Shift, and Alt modifiers
- Monospace font display in Chip component

### 4. Visual Elements
- Material-UI components for consistent styling
- Chip components for shortcut display
- Dividers for group separation
- Informative footer note about shortcut availability
- Background color variation for the help text section

## Usage Example

```typescript
const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      {
        key: "f",
        description: "Focus search",
        ctrl: true
      },
      {
        key: "/",
        description: "Show shortcuts help"
      }
    ]
  }
];

<ShortcutsHelp
  open={isHelpOpen}
  onClose={() => setHelpOpen(false)}
  shortcutGroups={shortcutGroups}
/>
```

## Implementation Notes

1. Integration with useKeyboardShortcuts
   - Uses ShortcutAction type from the hook
   - Maintains consistency with keyboard handling system
   - Enables reuse of shortcut definitions

2. Accessibility Considerations
   - Proper ARIA labels for close button
   - Semantic HTML structure with DialogTitle
   - Keyboard navigation support

3. Responsive Design
   - Adapts to different screen sizes
   - Dense list layout for efficient space usage
   - Readable typography at all breakpoints
