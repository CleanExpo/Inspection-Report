# State Management Patterns

This guide demonstrates various state management patterns used throughout the application, from local component state to global state integration.

## Local State Management

### useState Hook Patterns

```tsx
// Basic useState example
const PhotoUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      await uploadPhotos(files);
      setFiles([]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <FileInput onChange={setFiles} />
      <Button 
        onClick={handleUpload} 
        disabled={uploading || files.length === 0}
      >
        Upload
      </Button>
      {error && <ErrorMessage error={error} />}
    </Box>
  );
};
```

### useReducer for Complex State

```tsx
// Example of useReducer for complex state management
type InspectionState = {
  photos: Photo[];
  notes: Note[];
  currentSection: string;
  loading: boolean;
  error: Error | null;
};

type InspectionAction =
  | { type: 'ADD_PHOTO'; photo: Photo }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'SET_SECTION'; section: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: Error | null };

const inspectionReducer = (
  state: InspectionState,
  action: InspectionAction
): InspectionState => {
  switch (action.type) {
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [...state.photos, action.photo]
      };
    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.id)
      };
    // ... other cases
  }
};

const InspectionForm: React.FC = () => {
  const [state, dispatch] = useReducer(inspectionReducer, {
    photos: [],
    notes: [],
    currentSection: 'general',
    loading: false,
    error: null
  });

  // Usage example
  const handleAddPhoto = (photo: Photo) => {
    dispatch({ type: 'ADD_PHOTO', photo });
  };
};
```

## Global State Integration

### Context API Integration

```tsx
// Example of Context API usage
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Redux Integration Pattern

```tsx
// Example of Redux integration
interface PhotoState {
  items: Photo[];
  loading: boolean;
  error: string | null;
}

const photoSlice = createSlice({
  name: 'photos',
  initialState: {
    items: [],
    loading: false,
    error: null
  } as PhotoState,
  reducers: {
    addPhoto: (state, action: PayloadAction<Photo>) => {
      state.items.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

// Component using Redux
const PhotoGallery: React.FC = () => {
  const dispatch = useDispatch();
  const photos = useSelector((state: RootState) => state.photos.items);
  const loading = useSelector((state: RootState) => state.photos.loading);

  const handlePhotoUpload = async (file: File) => {
    dispatch(setLoading(true));
    try {
      const photo = await uploadPhoto(file);
      dispatch(addPhoto(photo));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Grid container spacing={2}>
      {photos.map(photo => (
        <Grid item key={photo.id}>
          <PhotoDisplay photo={photo} />
        </Grid>
      ))}
    </Grid>
  );
};
```

## State Lifting Patterns

### Controlled Components

```tsx
// Example of state lifting with controlled components
interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  value,
  onChange,
  onSave
}) => {
  return (
    <Box>
      <TextField
        multiline
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <Button onClick={onSave}>Save</Button>
    </Box>
  );
};

// Parent component managing state
const NotesContainer: React.FC = () => {
  const [noteText, setNoteText] = useState('');
  
  const handleSave = async () => {
    await saveNote(noteText);
    setNoteText('');
  };

  return (
    <NoteEditor
      value={noteText}
      onChange={setNoteText}
      onSave={handleSave}
    />
  );
};
```

### Shared State Pattern

```tsx
// Example of sharing state between sibling components
const InspectionSection: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <Box>
      <ItemList
        items={items}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
      />
      <ActionBar
        selectedCount={selectedItems.length}
        onClearSelection={() => setSelectedItems([])}
        onDelete={() => handleDelete(selectedItems)}
      />
    </Box>
  );
};
```

## Best Practices

1. **Local State Management**
   - Use useState for simple state
   - Use useReducer for complex state logic
   - Keep state as close as possible to where it's used

2. **Global State**
   - Use Context for theme, auth, and other app-wide state
   - Use Redux for complex state with many updates
   - Consider performance implications of context updates

3. **State Lifting**
   - Lift state only as high as necessary
   - Use controlled components for form elements
   - Pass callbacks for state updates

4. **Performance Considerations**
   - Memoize callbacks with useCallback
   - Memoize expensive computations with useMemo
   - Split context to prevent unnecessary rerenders
