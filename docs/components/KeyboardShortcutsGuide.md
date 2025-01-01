# KeyboardShortcutsGuide Component

## Core Functionality

### Shortcut Groups Organization

The component organizes keyboard shortcuts into logical groups for better user comprehension:

- Each group contains:
  - Title (e.g., "Recording", "Navigation")
  - Associated icon
  - List of related shortcuts

```typescript
interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: {
    key: string;
    description: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  }[];
}
```

The component comes with predefined groups:
1. Recording - Voice recording controls
2. Navigation - Search and keyboard shortcut help
3. Editing - Standard editing operations
4. Actions - Export and sharing functionality

### Shortcut Formatting

The component includes a robust shortcut formatting system:

```typescript
const formatShortcut = (shortcut: ShortcutGroup['shortcuts'][0]): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key);
  return parts.join(' + ');
};
```

Key features:
- Combines modifier keys (Ctrl, Shift, Alt) with the main key
- Uses consistent "+" separator between keys
- Displays shortcuts in a monospace font for clarity
- Presents shortcuts in Chip components for visual distinction

Example outputs:
- `Ctrl + R` for starting recording
- `Ctrl + Shift + S` for sharing notes
- Single key shortcuts like `/` for showing the guide

## Dialog Display

The component uses Material-UI's Dialog component for a modal display:

```typescript
interface KeyboardShortcutsGuideProps {
  open: boolean;
  onClose: () => void;
}
```

Key dialog features:
- Responsive width using `maxWidth="md"` and `fullWidth`
- Custom paper background styling
- Closeable via icon button or dialog backdrop
- Clear header with keyboard icon and title

### Visual Layout

The component implements a grid-based layout for organized presentation:

1. Dialog Header
   - Keyboard icon
   - "Keyboard Shortcuts" title
   - Close button aligned to the right

2. Content Organization
   - Grid system with responsive columns (xs={12} sm={6})
   - Each group rendered in a separate Paper component
   - Consistent padding and spacing
   - Border styling for visual separation

3. Visual Elements
   - Group headers with icons
   - Description and shortcut pairs
   - Chip components for shortcut display
   - Monospace font for shortcut keys
   - Outlined variant for visual distinction

4. Helper Section
   - Bottom tip section with light background
   - Informative text about shortcut availability
   - Visual separation using background color

## Data Structures

### Component Props Interface

```typescript
interface KeyboardShortcutsGuideProps {
  open: boolean;    // Controls dialog visibility
  onClose: () => void;  // Handler for closing the dialog
}
```

### Shortcut Group Interface

```typescript
interface ShortcutGroup {
  title: string;          // Group title (e.g., "Recording")
  icon: React.ReactNode;  // Material-UI icon component
  shortcuts: {
    key: string;         // Main key (e.g., "R", "ESC")
    description: string; // Action description
    ctrl?: boolean;      // Requires Ctrl modifier
    shift?: boolean;     // Requires Shift modifier
    alt?: boolean;       // Requires Alt modifier
  }[];
}
```

### Predefined Data Structure

The component uses a predefined array of shortcut groups:

```typescript
const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Recording',
    icon: <MicIcon />,
    shortcuts: [
      { key: 'R', description: 'Start recording', ctrl: true },
      { key: 'S', description: 'Stop recording', ctrl: true },
      // ...
    ]
  },
  // Additional groups...
];
```

Key characteristics:
- Type-safe through TypeScript interfaces
- Extensible structure for adding new groups
- Optional modifier keys for flexibility
- Icon integration with Material-UI

## Modifier Key Support

### Implementation

The component provides comprehensive support for keyboard modifier keys:

```typescript
interface ShortcutDefinition {
  key: string;
  description: string;
  ctrl?: boolean;    // Control key modifier
  shift?: boolean;   // Shift key modifier
  alt?: boolean;     // Alt key modifier
}
```

### Usage Examples

1. Single Modifier:
```typescript
{ key: 'R', description: 'Start recording', ctrl: true }
// Outputs: Ctrl + R
```

2. Multiple Modifiers:
```typescript
{ key: 'S', description: 'Share selected notes', ctrl: true, shift: true }
// Outputs: Ctrl + Shift + S
```

3. No Modifiers:
```typescript
{ key: '/', description: 'Show keyboard shortcuts' }
// Outputs: /
```

### Key Features

1. Flexible Combinations
   - Support for any combination of Ctrl, Shift, and Alt
   - Clear visual representation in the UI
   - Consistent ordering (Ctrl → Shift → Alt → Key)

2. Optional Nature
   - All modifier keys are optional
   - Allows for simple single-key shortcuts
   - Enables complex multi-modifier combinations

3. Display Formatting
   - Consistent separator usage
   - Monospace font for clarity
   - Chip component visual treatment
