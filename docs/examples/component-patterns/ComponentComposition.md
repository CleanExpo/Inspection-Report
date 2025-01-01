# Component Composition Patterns

This guide demonstrates various component composition patterns used throughout the application, from basic composition to advanced patterns.

## Basic Component Composition

### Simple Wrapper Components

```tsx
// Example of a basic wrapper component
import { Paper, Box } from '@mui/material';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      {children}
    </Paper>
  );
};

// Usage example
const InspectionSection = () => {
  return (
    <SectionCard title="Inspection Details">
      <InspectionForm />
    </SectionCard>
  );
};
```

### Component Composition with Props Forwarding

```tsx
// Example of composition with props forwarding
interface PhotoDisplayWrapperProps extends PhotoDisplayProps {
  showControls?: boolean;
}

export const PhotoDisplayWrapper: React.FC<PhotoDisplayWrapperProps> = ({
  showControls = true,
  ...photoProps
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <PhotoDisplay {...photoProps} />
      {showControls && <PhotoControls onEdit={photoProps.onEdit} />}
    </Box>
  );
};
```

## Higher-Order Components (HOCs)

### Authentication HOC

```tsx
// Example of an authentication HOC
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Usage example
const ProtectedComponent = withAuth(AdminDashboard);
```

### Error Boundary HOC

```tsx
// Example of an error boundary HOC
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ReactNode
) => {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Usage example
const SafeComponent = withErrorBoundary(DataDisplay, <ErrorFallback />);
```

## Render Props Pattern

### List Rendering Pattern

```tsx
// Example of a render props pattern for list rendering
interface ListRendererProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export function ListRenderer<T>({
  items,
  renderItem,
  renderEmpty = () => <Typography>No items to display</Typography>
}: ListRendererProps<T>) {
  if (items.length === 0) {
    return renderEmpty();
  }

  return (
    <List>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </List>
  );
}

// Usage example
const PhotoList = () => {
  const photos = usePhotos();
  
  return (
    <ListRenderer
      items={photos}
      renderItem={(photo) => (
        <ListItem>
          <PhotoDisplay photo={photo} />
        </ListItem>
      )}
      renderEmpty={() => (
        <Typography>No photos uploaded yet</Typography>
      )}
    />
  );
};
```

### Data Fetching Pattern

```tsx
// Example of a render props pattern for data fetching
interface DataFetcherProps<T> {
  fetchFn: () => Promise<T>;
  children: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({
  fetchFn,
  children
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [fetchFn]);

  return <>{children(data, loading, error)}</>;
}

// Usage example
const InspectionData = () => {
  return (
    <DataFetcher fetchFn={() => api.getInspectionData()}>
      {(data, loading, error) => {
        if (loading) return <LoadingSpinner />;
        if (error) return <ErrorMessage error={error} />;
        return <InspectionDisplay data={data} />;
      }}
    </DataFetcher>
  );
};
```

## Best Practices

1. **Component Composition**
   - Keep components focused and single-responsibility
   - Use composition over inheritance
   - Make components reusable and configurable

2. **Higher-Order Components**
   - Use HOCs for cross-cutting concerns
   - Maintain proper prop forwarding
   - Document HOC transformations clearly

3. **Render Props**
   - Use for flexible component logic sharing
   - Keep render functions pure
   - Handle edge cases (loading, errors, empty states)

4. **General Tips**
   - Prefer composition for simple cases
   - Use HOCs for behavior wrapping
   - Use render props for dynamic content
   - Document component interfaces clearly
