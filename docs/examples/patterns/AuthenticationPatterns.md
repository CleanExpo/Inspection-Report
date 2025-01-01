# Authentication Patterns

This guide demonstrates common patterns for implementing authentication and authorization in React applications.

## Protected Routes Setup

### Route Guards
```tsx
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : null;
};

// Usage in router setup
const Router = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/public" element={<PublicPage />} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      }
    />
  </Routes>
);
```

### Redirect Logic
```tsx
const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const intendedPath = new URLSearchParams(location.search).get('redirect');
    
    if (isAuthenticated && intendedPath) {
      navigate(intendedPath);
    } else if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location, navigate]);
};

// Usage in login component
const LoginPage = () => {
  useAuthRedirect();
  
  const handleLogin = async (credentials) => {
    await login(credentials);
    // useAuthRedirect will handle navigation after successful login
  };

  return <LoginForm onSubmit={handleLogin} />;
};
```

### Auth Persistence
```tsx
const useAuthPersistence = () => {
  const [authState, setAuthState] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  useEffect(() => {
    if (authState) {
      localStorage.setItem('auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authState]);

  const clearAuth = useCallback(() => {
    setAuthState(null);
  }, []);

  return { authState, setAuthState, clearAuth };
};

// Usage in auth context
const AuthProvider = ({ children }) => {
  const { authState, setAuthState, clearAuth } = useAuthPersistence();

  const login = async (credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    setAuthState(data);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Role-Based Access Control

### Permission Hooks
```tsx
const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) ?? false;
  }, [user]);

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  const canAccess = useCallback((resource) => {
    const resourcePermissions = {
      'users': ['manage_users'],
      'reports': ['view_reports'],
      'settings': ['manage_settings']
    };

    return resourcePermissions[resource]?.some(hasPermission) ?? false;
  }, [hasPermission]);

  return { hasPermission, hasRole, canAccess };
};
```

### Component-Level RBAC
```tsx
const withPermission = (WrappedComponent, requiredPermission) => {
  return function WithPermissionComponent(props) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(requiredPermission)) {
      return <AccessDenied />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Usage example
const AdminPanel = withPermission(
  ({ children }) => (
    <div className="admin-panel">{children}</div>
  ),
  'admin_access'
);

// Conditional rendering based on permissions
const ActionButton = ({ permission, children, ...props }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return null;
  }

  return (
    <button {...props}>
      {children}
    </button>
  );
};
```

### Route-Level RBAC
```tsx
const PermissionRoute = ({ permission, children }) => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hasPermission(permission)) {
      navigate('/unauthorized', { replace: true });
    }
  }, [hasPermission, permission, navigate]);

  return hasPermission(permission) ? children : null;
};

// Usage in router
const Router = () => (
  <Routes>
    <Route
      path="/admin"
      element={
        <PermissionRoute permission="admin_access">
          <AdminDashboard />
        </PermissionRoute>
      }
    />
  </Routes>
);
```

## Session Management

### Token Handling
```tsx
const useTokenManagement = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );

  const updateTokens = useCallback(({ accessToken, refreshToken }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  return {
    accessToken,
    refreshToken,
    updateTokens,
    clearTokens
  };
};
```

### Refresh Flows
```tsx
const useAuthRefresh = () => {
  const { refreshToken, updateTokens, clearTokens } = useTokenManagement();
  const refreshMutex = useRef(null);

  const refreshAccessToken = async () => {
    if (!refreshMutex.current) {
      refreshMutex.current = (async () => {
        try {
          const response = await fetch('/api/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });
          
          if (!response.ok) throw new Error('Refresh failed');
          
          const tokens = await response.json();
          updateTokens(tokens);
          return tokens.accessToken;
        } catch (error) {
          clearTokens();
          throw error;
        } finally {
          refreshMutex.current = null;
        }
      })();
    }

    return refreshMutex.current;
  };

  return { refreshAccessToken };
};
```

### Logout Patterns
```tsx
const useLogout = () => {
  const { clearTokens } = useTokenManagement();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Attempt to notify server
      await fetch('/api/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout notification failed:', error);
    } finally {
      // Clear local state regardless of server response
      clearTokens();
      navigate('/login');
    }
  };

  return { logout };
};
```

## Auth State Handling

### Auth Context Setup
```tsx
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, updateTokens, clearTokens } = useTokenManagement();

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        try {
          const response = await fetch('/api/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            clearTokens();
          }
        } catch (error) {
          clearTokens();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [accessToken, clearTokens]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    updateTokens,
    clearTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### State Synchronization
```tsx
const useAuthSync = () => {
  const { clearTokens } = useTokenManagement();
  
  useEffect(() => {
    const channel = new BroadcastChannel('auth');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        clearTokens();
      }
    };
    
    return () => channel.close();
  }, [clearTokens]);

  const broadcastLogout = () => {
    const channel = new BroadcastChannel('auth');
    channel.postMessage({ type: 'LOGOUT' });
    channel.close();
  };

  return { broadcastLogout };
};
```

### Multi-Tab Handling
```tsx
const useMultiTabAuth = () => {
  const { user, clearTokens } = useAuth();
  const lastActivity = useRef(Date.now());
  
  useEffect(() => {
    const handleActivity = () => {
      lastActivity.current = Date.now();
      localStorage.setItem('lastActivity', lastActivity.current.toString());
    };

    const handleStorageChange = (e) => {
      if (e.key === 'lastActivity') {
        const otherTabActivity = parseInt(e.newValue, 10);
        if (otherTabActivity > lastActivity.current) {
          // Other tab is more active, defer to it
          lastActivity.current = otherTabActivity;
        }
      }
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('storage', handleStorageChange);

    const checkActivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity.current;
      if (inactiveTime > 30 * 60 * 1000) { // 30 minutes
        clearTokens();
      }
    }, 60000);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkActivity);
    };
  }, [clearTokens]);

  return { lastActivity: lastActivity.current };
};
```

## Best Practices and Tips

1. Always use HTTPS for authentication requests
2. Implement proper token storage and handling
3. Use refresh tokens for better security
4. Implement proper session timeout handling
5. Use proper RBAC patterns
6. Handle multi-tab scenarios properly
7. Implement proper error handling
8. Use secure password handling
9. Implement proper logout flows
10. Use proper state management for auth state
