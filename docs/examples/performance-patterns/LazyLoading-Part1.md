# Lazy Loading Implementation - Part 1

## Image Lazy Loading

### Native Lazy Loading

```html
<!-- Basic usage -->
<img src="large-image.jpg" loading="lazy" alt="Lazy loaded image" />
```

### React Implementation

```jsx
// Image component with lazy loading
function LazyImage({ src, alt, width, height }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'fallback-image.jpg';
      }}
    />
  );
}

// Usage with placeholder
function ImageWithPlaceholder({ src, alt, width, height }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="image-container">
      {!isLoaded && <div className="skeleton-loader" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
}
```

### Intersection Observer Implementation

```jsx
function LazyImageObserver({ src, alt }) {
  const [isIntersecting, setIntersecting] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={isIntersecting ? src : 'placeholder.jpg'}
      alt={alt}
      className={isIntersecting ? 'loaded' : 'loading'}
    />
  );
}
```

## Component Lazy Loading

### Basic Component Lazy Loading

```jsx
import React, { Suspense, lazy } from 'react';

// Lazy load a complex component
const DataGrid = lazy(() => import('./components/DataGrid'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid />
    </Suspense>
  );
}
```

### Advanced Loading States

```jsx
// Custom loading component with delay
function DelayedFallback({ delay = 500 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;
  return <div>Loading...</div>;
}

// Usage with error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong!</h2>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Combining everything
function LazyLoadedSection() {
  const ComplexComponent = lazy(() => import('./ComplexComponent'));

  return (
    <ErrorBoundary>
      <Suspense fallback={<DelayedFallback delay={300}>}>
        <ComplexComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Conditional Lazy Loading

```jsx
function FeatureToggle({ featureName, children }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const LazyComponent = lazy(() => import(`./features/${featureName}`));

  useEffect(() => {
    // Check if feature should be loaded
    const checkFeatureFlag = async () => {
      const flags = await fetchFeatureFlags();
      setShouldLoad(flags[featureName]);
    };
    checkFeatureFlag();
  }, [featureName]);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={<DelayedFallback />}>
      <LazyComponent>{children}</LazyComponent>
    </Suspense>
  );
}

// Usage
function App() {
  return (
    <div>
      <FeatureToggle featureName="beta-feature">
        <h2>Beta Feature Content</h2>
      </FeatureToggle>
    </div>
  );
}
```

### Route-Based Lazy Loading with Loading States

```jsx
const routes = {
  home: lazy(() => import('./pages/Home')),
  dashboard: lazy(() => import('./pages/Dashboard')),
  settings: lazy(() => import('./pages/Settings')),
};

function LoadingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loading-container">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <p>Loading... {progress}%</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<routes.home />} />
            <Route path="/dashboard" element={<routes.dashboard />} />
            <Route path="/settings" element={<routes.settings />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}
