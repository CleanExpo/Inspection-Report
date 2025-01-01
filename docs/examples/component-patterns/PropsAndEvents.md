# Props and Event Handling Patterns

This guide demonstrates common patterns for handling props and events in React components, including event propagation, props drilling solutions, and custom event handlers.

## Event Propagation Examples

### Bubble and Capture Phase

```tsx
const NestedButtons: React.FC = () => {
  const handleParentClick = (e: React.MouseEvent) => {
    console.log('Parent clicked');
  };

  const handleChildClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching parent
    console.log('Child clicked');
  };

  return (
    <div onClick={handleParentClick}>
      <button onClick={handleChildClick}>
        Click Me
      </button>
    </div>
  );
};
```

### Custom Event Bubbling

```tsx
interface PhotoSelectEvent {
  photoId: string;
  selected: boolean;
}

const PhotoGrid: React.FC = () => {
  const handlePhotoSelect = (event: PhotoSelectEvent) => {
    console.log(`Photo ${event.photoId} ${event.selected ? 'selected' : 'deselected'}`);
  };

  return (
    <div>
      {photos.map(photo => (
        <PhotoItem
          key={photo.id}
          photo={photo}
          onSelect={handlePhotoSelect}
        />
      ))}
    </div>
  );
};
```

## Props Drilling Solutions

### Component Composition

```tsx
// Instead of drilling props through multiple levels
const PhotoGallery: React.FC<{ toolbar: React.ReactNode }> = ({ toolbar }) => {
  return (
    <div>
      {toolbar}
      <PhotoGrid />
    </div>
  );
};

// Usage
const App: React.FC = () => (
  <PhotoGallery
    toolbar={
      <Toolbar>
        <DeleteButton />
        <ShareButton />
      </Toolbar>
    }
  />
);
```

### Render Props Pattern

```tsx
interface SelectionProps {
  render: (selectedIds: string[]) => React.ReactNode;
}

const SelectionManager: React.FC<SelectionProps> = ({ render }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div>
      {render(selectedIds)}
    </div>
  );
};

// Usage
<SelectionManager
  render={selectedIds => (
    <PhotoGrid
      selectedIds={selectedIds}
      onSelect={handleSelect}
    />
  )}
/>
```

### Custom Hooks for Props

```tsx
const usePhotoSelection = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const toggleSelection = useCallback((photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  }, []);

  return { selectedPhotos, toggleSelection };
};

// Usage in components
const PhotoList: React.FC = () => {
  const { selectedPhotos, toggleSelection } = usePhotoSelection();
  return (
    <div>
      {photos.map(photo => (
        <PhotoItem
          key={photo.id}
          selected={selectedPhotos.includes(photo.id)}
          onSelect={() => toggleSelection(photo.id)}
        />
      ))}
    </div>
  );
};
```

## Custom Event Handlers

### Type-Safe Event Handlers

```tsx
interface PhotoUploadEvent {
  file: File;
  preview: string;
  metadata: {
    size: number;
    type: string;
  };
}

type PhotoUploadHandler = (event: PhotoUploadEvent) => Promise<void>;

const PhotoUploader: React.FC<{
  onUpload: PhotoUploadHandler;
}> = ({ onUpload }) => {
  const handleFileSelect = async (file: File) => {
    const preview = await generatePreview(file);
    await onUpload({
      file,
      preview,
      metadata: {
        size: file.size,
        type: file.type
      }
    });
  };

  return <FileInput onSelect={handleFileSelect} />;
};
```

### Event Handler Composition

```tsx
const useComposedHandlers = (...handlers: Array<() => void>) => {
  return useCallback(() => {
    handlers.forEach(handler => handler?.());
  }, [handlers]);
};

// Usage
const Button: React.FC<{
  onClick?: () => void;
  onAnalytics?: () => void;
}> = ({ onClick, onAnalytics }) => {
  const handleClick = useComposedHandlers(
    onClick,
    onAnalytics
  );

  return <button onClick={handleClick}>Click Me</button>;
};
```

## Best Practices

1. **Event Handling**
   - Use TypeScript for type-safe event handlers
   - Consider event propagation carefully
   - Implement proper cleanup in useEffect

2. **Props Management**
   - Avoid deep props drilling
   - Use composition when possible
   - Consider context for widely used props

3. **Performance**
   - Memoize handlers with useCallback
   - Use memo for expensive renders
   - Avoid inline handler definitions

4. **Type Safety**
   - Define clear interfaces for events
   - Use discriminated unions for complex events
   - Leverage TypeScript's event types
