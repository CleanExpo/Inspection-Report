# Auth State Management

This guide demonstrates patterns for managing authentication state in React applications.

## Auth Context Setup

### Basic Auth Context

```tsx
// context/AuthContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import { TokenStorage } from '@/utils/tokenStorage';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const login = useCallback(async (credentials: Credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, tokens } = response.data;

      TokenStorage.setTokens(tokens);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true
      }));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Enhanced Auth Context with Persistence

```tsx
// context/EnhancedAuthContext.tsx
import { createContext, useContext, useReducer, useEffect } from 'react';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: Error }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = TokenStorage.getTokens();
        if (tokens) {
          const { data: user } = await apiClient.get('/auth/me');
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: error as Error });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: Credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, tokens } = response.data;

      TokenStorage.setTokens(tokens);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error as Error });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    logout,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    updateUser: (user: User) => dispatch({ type: 'UPDATE_USER', payload: user })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Auth Context Persistence Layer

```tsx
// utils/authPersistence.ts
const AUTH_STATE_KEY = 'auth_state';

export class AuthPersistence {
  static saveState(state: Partial<AuthState>): void {
    try {
      const serializedState = JSON.stringify(state);
      sessionStorage.setItem(AUTH_STATE_KEY, serializedState);
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  static loadState(): Partial<AuthState> | null {
    try {
      const serializedState = sessionStorage.getItem(AUTH_STATE_KEY);
      return serializedState ? JSON.parse(serializedState) : null;
    } catch (error) {
      console.error('Failed to load auth state:', error);
      return null;
    }
  }

  static clearState(): void {
    sessionStorage.removeItem(AUTH_STATE_KEY);
  }
}
```

### Auth Context with Persistence Integration

```tsx
// context/PersistentAuthContext.tsx
export const PersistentAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    const persistedState = AuthPersistence.loadState();
    return persistedState ? { ...initialState, ...persistedState } : initialState;
  });

  useEffect(() => {
    AuthPersistence.saveState({
      user: state.user,
      isAuthenticated: state.isAuthenticated
    });
  }, [state.user, state.isAuthenticated]);

  // ... rest of the provider implementation
};
```

### Testing Auth Context

```tsx
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  const TestComponent = () => {
    const { isAuthenticated, login, logout } = useAuth();
    return (
      <div>
        <span>Auth: {isAuthenticated ? 'yes' : 'no'}</span>
        <button onClick={() => login({ email: 'test', password: 'test' })}>
          Login
        </button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  it('provides authentication state', () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText('Auth: no')).toBeInTheDocument();
  });

  it('handles login flow', async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Login').click();
    });

    expect(getByText('Auth: yes')).toBeInTheDocument();
  });
});
```

This section covers Auth Context setup and implementation. The next sections will cover state synchronization and multi-tab handling.

## State Synchronization

### Event-Based State Updates

```tsx
// utils/authEvents.ts
type AuthEventType = 'login' | 'logout' | 'update' | 'error';

interface AuthEvent {
  type: AuthEventType;
  payload?: any;
}

export class AuthEventEmitter {
  private static listeners: ((event: AuthEvent) => void)[] = [];

  static subscribe(listener: (event: AuthEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static emit(event: AuthEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}
```

### Real-Time State Management

```tsx
// hooks/useAuthSync.ts
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthEventEmitter } from '@/utils/authEvents';

export const useAuthSync = () => {
  const { updateUser, logout } = useAuth();

  useEffect(() => {
    const unsubscribe = AuthEventEmitter.subscribe(event => {
      switch (event.type) {
        case 'update':
          updateUser(event.payload);
          break;
        case 'logout':
          logout();
          break;
      }
    });

    return unsubscribe;
  }, [updateUser, logout]);
};
```

### Synchronized Auth Provider

```tsx
// context/SyncedAuthProvider.tsx
import { useEffect } from 'react';
import { AuthEventEmitter } from '@/utils/authEvents';

export const SyncedAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const handleAuthEvent = (event: AuthEvent) => {
      switch (event.type) {
        case 'login':
          dispatch({ type: 'LOGIN_SUCCESS', payload: event.payload });
          break;
        case 'logout':
          dispatch({ type: 'LOGOUT' });
          break;
        case 'update':
          dispatch({ type: 'UPDATE_USER', payload: event.payload });
          break;
        case 'error':
          dispatch({ type: 'LOGIN_FAILURE', payload: event.payload });
          break;
      }
    };

    const unsubscribe = AuthEventEmitter.subscribe(handleAuthEvent);
    return unsubscribe;
  }, []);

  const login = async (credentials: Credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, tokens } = response.data;

      TokenStorage.setTokens(tokens);
      AuthEventEmitter.emit({ type: 'login', payload: user });
    } catch (error) {
      AuthEventEmitter.emit({ type: 'error', payload: error });
      throw error;
    }
  };

  // ... rest of provider implementation
};
```

### WebSocket Integration for Real-Time Updates

```tsx
// services/authWebSocket.ts
export class AuthWebSocket {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;

  static connect(): void {
    if (this.ws) return;

    this.ws = new WebSocket(process.env.REACT_APP_WS_URL!);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'auth_update':
          AuthEventEmitter.emit({ 
            type: 'update', 
            payload: data.user 
          });
          break;
        case 'auth_revoked':
          AuthEventEmitter.emit({ type: 'logout' });
          break;
      }
    };

    this.ws.onclose = () => {
      this.handleDisconnect();
    };
  }

  private static handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  static disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Error State Synchronization

```tsx
// hooks/useAuthError.ts
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthEventEmitter } from '@/utils/authEvents';

export const useAuthError = () => {
  const { clearError } = useAuth();

  useEffect(() => {
    const handleError = (error: Error) => {
      if (error.name === 'TokenExpiredError') {
        AuthEventEmitter.emit({ type: 'logout' });
      } else {
        AuthEventEmitter.emit({ 
          type: 'error', 
          payload: error 
        });
      }
    };

    return () => {
      clearError();
    };
  }, [clearError]);

  const handleAuthError = (error: Error) => {
    AuthEventEmitter.emit({ 
      type: 'error', 
      payload: error 
    });
  };

  return { handleAuthError };
};
```

### Integration Example

```tsx
// components/AuthenticatedApp.tsx
export const AuthenticatedApp: React.FC = () => {
  useAuthSync();
  const { handleAuthError } = useAuthError();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    AuthWebSocket.connect();
    return () => AuthWebSocket.disconnect();
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary onError={handleAuthError}>
      <UserProfile user={user} />
      <ProtectedContent />
    </ErrorBoundary>
  );
};
```

### Testing State Synchronization

```tsx
import { render, act } from '@testing-library/react';
import { AuthEventEmitter } from '@/utils/authEvents';
import { SyncedAuthProvider } from './SyncedAuthProvider';

describe('State Synchronization', () => {
  it('synchronizes state across components', () => {
    const { getByText } = render(
      <SyncedAuthProvider>
        <TestComponent />
      </SyncedAuthProvider>
    );

    act(() => {
      AuthEventEmitter.emit({
        type: 'update',
        payload: { id: '1', name: 'Test User' }
      });
    });

    expect(getByText('Test User')).toBeInTheDocument();
  });

  it('handles auth errors correctly', () => {
    const { getByText } = render(
      <SyncedAuthProvider>
        <TestComponent />
      </SyncedAuthProvider>
    );

    act(() => {
      AuthEventEmitter.emit({
        type: 'error',
        payload: new Error('Auth Error')
      });
    });

    expect(getByText('Auth Error')).toBeInTheDocument();
  });
});
```

This section covers state synchronization patterns. The final section covers multi-tab handling.

## Multi-Tab Handling

### Cross-Tab Communication

```tsx
// utils/tabSync.ts
export class TabSyncManager {
  private static channel: BroadcastChannel | null = null;
  private static storageKey = 'auth_master_tab';
  private static heartbeatInterval: NodeJS.Timeout | null = null;
  private static isMasterTab = false;

  static init(): void {
    if (!this.channel && window.BroadcastChannel) {
      this.channel = new BroadcastChannel('auth_sync');
      this.channel.onmessage = this.handleMessage;
      this.setupMasterTabElection();
    }
  }

  private static setupMasterTabElection(): void {
    // Elect master tab
    const timestamp = Date.now().toString();
    localStorage.setItem(this.storageKey, timestamp);
    
    this.startHeartbeat();
    window.addEventListener('storage', this.handleStorageChange);
  }

  private static startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isMasterTab) {
        localStorage.setItem(this.storageKey, Date.now().toString());
      }
    }, 1000);
  }

  private static handleStorageChange = (event: StorageEvent) => {
    if (event.key === this.storageKey) {
      this.checkMasterTab();
    }
  };

  private static checkMasterTab(): void {
    const currentMaster = localStorage.getItem(this.storageKey);
    const timestamp = parseInt(currentMaster || '0', 10);
    const isStale = Date.now() - timestamp > 3000; // 3 seconds threshold

    if (isStale) {
      this.becomeMasterTab();
    }
  }

  private static becomeMasterTab(): void {
    this.isMasterTab = true;
    localStorage.setItem(this.storageKey, Date.now().toString());
    this.broadcastState();
  }

  private static handleMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'AUTH_STATE_SYNC':
        AuthEventEmitter.emit({ type: 'update', payload });
        break;
      case 'AUTH_LOGOUT':
        AuthEventEmitter.emit({ type: 'logout' });
        break;
    }
  };

  static broadcastState(): void {
    if (!this.isMasterTab) return;

    const state = AuthPersistence.loadState();
    this.channel?.postMessage({
      type: 'AUTH_STATE_SYNC',
      payload: state
    });
  }

  static cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
    this.channel?.close();
  }
}
```

### Tab-Aware Auth Provider

```tsx
// context/TabAwareAuthProvider.tsx
export const TabAwareAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    TabSyncManager.init();
    return () => TabSyncManager.cleanup();
  }, []);

  useEffect(() => {
    const syncState = () => {
      TabSyncManager.broadcastState();
    };

    window.addEventListener('focus', syncState);
    return () => window.removeEventListener('focus', syncState);
  }, [state]);

  // ... rest of provider implementation
};
```

### Shared Worker for State Management

```tsx
// workers/authWorker.ts
const connections: MessagePort[] = [];
let authState: AuthState | null = null;

self.onconnect = (event: MessageEvent) => {
  const port = event.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'UPDATE_STATE':
        authState = payload;
        broadcastToAll(port, {
          type: 'STATE_UPDATED',
          payload: authState
        });
        break;
      case 'REQUEST_STATE':
        port.postMessage({
          type: 'STATE_SYNC',
          payload: authState
        });
        break;
    }
  };

  port.start();
};

function broadcastToAll(sender: MessagePort, message: any): void {
  connections.forEach(port => {
    if (port !== sender) {
      port.postMessage(message);
    }
  });
}
```

### Shared Worker Integration

```tsx
// hooks/useSharedWorker.ts
export const useSharedWorker = () => {
  const workerRef = useRef<SharedWorker | null>(null);
  const { dispatch } = useAuth();

  useEffect(() => {
    if ('SharedWorker' in window) {
      workerRef.current = new SharedWorker('authWorker.ts');
      const port = workerRef.current.port;

      port.onmessage = (event) => {
        const { type, payload } = event.data;
        
        if (type === 'STATE_UPDATED') {
          dispatch({ type: 'SYNC_STATE', payload });
        }
      };

      port.start();
      port.postMessage({ type: 'REQUEST_STATE' });

      return () => {
        port.close();
      };
    }
  }, [dispatch]);

  const updateSharedState = useCallback((state: AuthState) => {
    workerRef.current?.port.postMessage({
      type: 'UPDATE_STATE',
      payload: state
    });
  }, []);

  return { updateSharedState };
};
```

### Conflict Resolution

```tsx
// utils/stateConflictResolver.ts
export class StateConflictResolver {
  static resolveAuthState(
    localState: AuthState,
    remoteState: AuthState
  ): AuthState {
    // Prefer the most recent state based on timestamp
    if (localState.timestamp > remoteState.timestamp) {
      return localState;
    }
    return remoteState;
  }

  static resolveUserData(
    localUser: User | null,
    remoteUser: User | null
  ): User | null {
    if (!localUser || !remoteUser) {
      return remoteUser || localUser;
    }

    // Merge user data, preferring remote data for conflicts
    return {
      ...localUser,
      ...remoteUser,
      // Merge arrays like roles
      roles: [...new Set([...localUser.roles, ...remoteUser.roles])]
    };
  }
}
```

### Integration Example

```tsx
// App.tsx
export const App = () => {
  return (
    <TabAwareAuthProvider>
      <AuthStateSync>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthStateSync>
    </TabAwareAuthProvider>
  );
};

// components/AuthStateSync.tsx
export const AuthStateSync: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { updateSharedState } = useSharedWorker();
  const { state } = useAuth();

  useEffect(() => {
    updateSharedState(state);
  }, [state, updateSharedState]);

  return <>{children}</>;
};
```

This completes the authentication state management documentation covering context setup, state synchronization, and multi-tab handling.
