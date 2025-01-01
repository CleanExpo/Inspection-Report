# Protected Routes Setup

This guide demonstrates patterns and best practices for implementing protected routes in React applications.

## Overview

Protected routes ensure that certain parts of your application are only accessible to authenticated users. This pattern involves:
- Route guards to check authentication status
- Redirect logic for unauthorized access
- Authentication state persistence

## Implementation Examples

### Basic Route Guard

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### Usage Example

```tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from './Dashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
```

## Redirect Logic

### Handling Return URLs

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    await login(credentials);
    // Redirect to intended destination or default route
    const destination = location.state?.from?.pathname || '/dashboard';
    navigate(destination, { replace: true });
  };

  return (
    // Login form implementation
  );
};
```

## Authentication Persistence

### Local Storage Strategy

```tsx
const AUTH_KEY = 'auth_token';

export const useAuthPersistence = () => {
  const persistToken = (token: string) => {
    localStorage.setItem(AUTH_KEY, token);
  };

  const getPersistedToken = () => {
    return localStorage.getItem(AUTH_KEY);
  };

  const clearPersistedAuth = () => {
    localStorage.removeItem(AUTH_KEY);
  };

  return {
    persistToken,
    getPersistedToken,
    clearPersistedAuth
  };
};
```

### Session Check on App Load

```tsx
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

export const AuthInitializer = ({ children }) => {
  const { initializeAuth } = useAuth();
  const { getPersistedToken } = useAuthPersistence();

  useEffect(() => {
    const token = getPersistedToken();
    if (token) {
      initializeAuth(token);
    }
  }, []);

  return <>{children}</>;
};
```

## Best Practices

1. **Always Preserve Return URLs**: Store the intended destination when redirecting to login
2. **Secure Token Storage**: Use secure storage methods for auth tokens (HttpOnly cookies preferred)
3. **Clear Routes on Logout**: Ensure protected routes are inaccessible after logout
4. **Loading States**: Show loading indicators while checking auth status
5. **Error Handling**: Gracefully handle authentication errors and expired sessions

## Common Pitfalls

1. **Direct Route Access**: Ensure routes are protected even when accessed directly via URL
2. **Token Expiration**: Handle expired tokens and refresh token flows
3. **Race Conditions**: Manage auth state updates during route transitions
4. **Memory Leaks**: Clean up auth listeners and subscriptions

## Related Patterns

- Role-based Access Control (RBAC)
- Session Management
- Auth State Management
- Error Boundary Integration

## Testing Considerations

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
