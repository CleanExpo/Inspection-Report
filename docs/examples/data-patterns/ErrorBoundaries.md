# Error Boundary Implementation

This guide demonstrates patterns for implementing error boundaries in React applications, including global error handling, component-level boundaries, and recovery patterns.

## Global Error Boundary

### Basic Error Boundary Implementation
```tsx
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
const App = () => (
  <GlobalErrorBoundary>
    <Router>
      <AppContent />
    </Router>
  </GlobalErrorBoundary>
);
```

## Component-Level Boundaries

### Feature-Specific Error Boundary
```tsx
class FeatureErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
const Dashboard = () => (
  <div className="dashboard">
    <FeatureErrorBoundary
      fallback={<DashboardErrorState />}
      onError={(error) => logError('Dashboard', error)}
    >
      <DashboardContent />
    </FeatureErrorBoundary>
  </div>
);
```

### Retry Pattern
```tsx
class RetryErrorBoundary extends React.Component<{
  children: React.ReactNode;
  maxRetries?: number;
}> {
  state = {
    hasError: false,
    error: null as Error | null,
    retryCount: 0
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState(state => ({
      hasError: false,
      retryCount: state.retryCount + 1
    }));
  };

  render() {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.hasError) {
      if (this.state.retryCount >= maxRetries) {
        return (
          <div className="error-state">
            <h2>Too many retries</h2>
            <p>Please refresh the page to try again.</p>
          </div>
        );
      }

      return (
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={this.reset}>
            Retry (Attempt {this.state.retryCount + 1} of {maxRetries})
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Recovery Patterns

### Graceful Degradation
```tsx
const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{ error: Error }>
) => {
  return class WithErrorBoundary extends React.Component<P> {
    state = { hasError: false, error: null as Error | null };

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }

      return <Component {...this.props} />;
    }
  };
};

// Usage
const DataGrid = withErrorBoundary(
  ComplexDataGrid,
  ({ error }) => (
    <div className="fallback-grid">
      <p>Unable to load grid: {error.message}</p>
      <SimplifiedDataView />
    </div>
  )
);
```

### State Recovery
```tsx
class StatefulErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onReset?: () => void;
}> {
  state = {
    hasError: false,
    error: null as Error | null,
    errorInfo: null as React.ErrorInfo | null
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-recovery">
          <h2>An error occurred</h2>
          <p>{this.state.error?.message}</p>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={this.handleReset}>
            Reset Component State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage with state reset
const DataComponent = () => {
  const [data, setData] = useState<Data[]>([]);

  const resetState = () => {
    setData([]);
  };

  return (
    <StatefulErrorBoundary onReset={resetState}>
      <DataDisplay data={data} />
    </StatefulErrorBoundary>
  );
};
```

## Best Practices

1. **Error Boundary Placement**
   - Place global boundaries at the root level
   - Use component-specific boundaries for isolated features
   - Consider granularity vs. complexity trade-offs

2. **Error Reporting**
   - Implement proper error logging
   - Include relevant context in error reports
   - Consider user privacy when logging errors

3. **Recovery Strategies**
   - Provide clear user feedback
   - Implement appropriate retry mechanisms
   - Consider graceful degradation options

4. **State Management**
   - Handle state reset appropriately
   - Preserve important user data when possible
   - Implement proper cleanup on error

5. **Performance Considerations**
   - Avoid unnecessary error boundary nesting
   - Implement efficient error tracking
   - Consider the impact on bundle size

These patterns provide a robust foundation for handling errors in React applications. Adapt them based on your specific requirements and use cases.
