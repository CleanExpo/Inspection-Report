# Code Splitting Patterns - Part 1

## Route-Based Code Splitting

Route-based code splitting is a technique to split your application code into smaller chunks that are loaded on demand when a specific route is accessed.

### Basic Implementation

```jsx
// Before Code Splitting
import HomePage from './pages/Home';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';

// After Code Splitting
import React, { lazy } from 'react';

const HomePage = lazy(() => import('./pages/Home'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const SettingsPage = lazy(() => import('./pages/Settings'));

// Wrap with Suspense
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Best Practices
- Use meaningful chunk names for better debugging
- Implement proper loading states
- Handle loading errors gracefully

```jsx
// Using webpack magic comments for chunk naming
const UserProfile = lazy(() => import(
  /* webpackChunkName: "user-profile" */
  './components/UserProfile'
));
```

## Component-Based Code Splitting

Component-based code splitting allows you to split specific components that might not be immediately needed by the user.

### Modal Example

```jsx
const Modal = lazy(() => import('./components/Modal'));

function ModalWrapper({ isOpen, ...props }) {
  if (!isOpen) return null;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Modal {...props} />
    </Suspense>
  );
}
```

### Feature-Based Example

```jsx
const AdvancedChart = lazy(() => import('./components/AdvancedChart'));

function Dashboard({ showAdvancedFeatures }) {
  return (
    <div>
      <BasicStats />
      {showAdvancedFeatures && (
        <Suspense fallback={<SimpleChart />}>
          <AdvancedChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Error Boundary Integration

```jsx
class ChunkErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error loading component. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
```

### Performance Tips
1. Analyze bundle sizes using tools like `webpack-bundle-analyzer`
2. Set appropriate loading states for better UX
3. Implement retry mechanisms for failed chunk loads
4. Use preloading for critical paths

```jsx
// Preloading example
const UserProfile = lazy(() => import('./components/UserProfile'));

// Preload on hover
function NavLink({ to, children }) {
  const prefetchProfile = () => {
    const componentPromise = import('./components/UserProfile');
  };
  
  return (
    <Link 
      to={to}
      onMouseEnter={prefetchProfile}
      onFocus={prefetchProfile}
    >
      {children}
    </Link>
  );
}
