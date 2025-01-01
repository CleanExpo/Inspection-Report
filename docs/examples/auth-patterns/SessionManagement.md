# Session Management

This guide demonstrates patterns and best practices for managing authentication sessions in React applications.

## Token Handling

### Token Storage Strategy

```tsx
// utils/tokenStorage.ts
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenStorage {
  private static ACCESS_TOKEN_KEY = 'auth_access_token';
  private static REFRESH_TOKEN_KEY = 'auth_refresh_token';

  // Store tokens securely
  static setTokens({ accessToken, refreshToken }: TokenPair): void {
    // Use HttpOnly cookies in production
    if (process.env.NODE_ENV === 'production') {
      document.cookie = `${this.ACCESS_TOKEN_KEY}=${accessToken}; path=/; HttpOnly; Secure; SameSite=Strict`;
      document.cookie = `${this.REFRESH_TOKEN_KEY}=${refreshToken}; path=/; HttpOnly; Secure; SameSite=Strict`;
    } else {
      // For development/testing, use localStorage
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Retrieve tokens
  static getTokens(): TokenPair | null {
    if (process.env.NODE_ENV === 'production') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const accessToken = cookies[this.ACCESS_TOKEN_KEY];
      const refreshToken = cookies[this.REFRESH_TOKEN_KEY];

      return accessToken && refreshToken 
        ? { accessToken, refreshToken }
        : null;
    }

    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    return accessToken && refreshToken 
      ? { accessToken, refreshToken }
      : null;
  }

  // Clear tokens on logout
  static clearTokens(): void {
    if (process.env.NODE_ENV === 'production') {
      document.cookie = `${this.ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${this.REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }
}
```

### Token Management Hook

```tsx
// hooks/useTokenManagement.ts
import { useState, useCallback } from 'react';
import { TokenStorage } from '@/utils/tokenStorage';

interface UseTokenManagementReturn {
  isAuthenticated: boolean;
  setTokens: (tokens: TokenPair) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
}

export const useTokenManagement = (): UseTokenManagementReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return TokenStorage.getTokens() !== null;
  });

  const setTokens = useCallback((tokens: TokenPair) => {
    TokenStorage.setTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const clearTokens = useCallback(() => {
    TokenStorage.clearTokens();
    setIsAuthenticated(false);
  }, []);

  const getAccessToken = useCallback(() => {
    const tokens = TokenStorage.getTokens();
    return tokens?.accessToken ?? null;
  }, []);

  return {
    isAuthenticated,
    setTokens,
    clearTokens,
    getAccessToken
  };
};
```

### JWT Token Decoder

```tsx
// utils/tokenDecoder.ts
interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

export class TokenDecoder {
  static decode(token: string): DecodedToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  static isExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  static getTimeUntilExpiry(token: string): number {
    try {
      const decoded = this.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - currentTime);
    } catch {
      return 0;
    }
  }
}
```

### Token Interceptor for API Calls

```tsx
// utils/apiClient.ts
import axios from 'axios';
import { TokenStorage } from './tokenStorage';
import { TokenDecoder } from './tokenDecoder';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

apiClient.interceptors.request.use(async config => {
  const tokens = TokenStorage.getTokens();
  
  if (tokens) {
    const { accessToken } = tokens;
    
    if (!TokenDecoder.isExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  
  return config;
});
```

### Usage Example

```tsx
// components/AuthenticatedApp.tsx
import { useTokenManagement } from '@/hooks/useTokenManagement';
import { apiClient } from '@/utils/apiClient';

export const AuthenticatedApp: React.FC = () => {
  const { 
    isAuthenticated, 
    setTokens, 
    clearTokens 
  } = useTokenManagement();

  const handleLogin = async (credentials: Credentials) => {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    clearTokens();
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <ProtectedContent />
        </>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  );
};
```

### Security Considerations

1. **Token Storage**
   - Use HttpOnly cookies in production
   - Implement proper CSRF protection
   - Set appropriate cookie flags (Secure, SameSite)

2. **Token Validation**
   - Always validate tokens on the server
   - Check expiration before using tokens
   - Implement proper signature verification

3. **Token Transmission**
   - Use HTTPS for all API calls
   - Implement proper CORS policies
   - Never expose tokens in URLs or logs

4. **Token Lifecycle**
   - Implement proper token rotation
   - Handle token revocation
   - Clean up tokens on logout

### Testing Token Management

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenManagement } from './useTokenManagement';
import { TokenStorage } from '@/utils/tokenStorage';

describe('useTokenManagement', () => {
  beforeEach(() => {
    TokenStorage.clearTokens();
  });

  it('initializes with correct authentication state', () => {
    const { result } = renderHook(() => useTokenManagement());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets tokens correctly', () => {
    const { result } = renderHook(() => useTokenManagement());
    
    act(() => {
      result.current.setTokens({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.getAccessToken()).toBe('test-access-token');
  });

  it('clears tokens correctly', () => {
    const { result } = renderHook(() => useTokenManagement());
    
    act(() => {
      result.current.setTokens({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token'
      });
      result.current.clearTokens();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.getAccessToken()).toBeNull();
  });
});
```

This section covers token handling implementation. The next sections will cover token refresh mechanisms and logout flows.

## Token Refresh Mechanisms

### Refresh Token Service

```tsx
// services/refreshToken.ts
import { apiClient } from '@/utils/apiClient';
import { TokenStorage } from '@/utils/tokenStorage';
import { TokenDecoder } from '@/utils/tokenDecoder';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  private static isRefreshing = false;
  private static refreshSubscribers: ((token: string) => void)[] = [];

  static async refreshTokens(): Promise<RefreshResponse> {
    const tokens = TokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const { data } = await apiClient.post<RefreshResponse>(
        '/auth/refresh',
        { refreshToken: tokens.refreshToken }
      );

      TokenStorage.setTokens(data);
      return data;
    } catch (error) {
      TokenStorage.clearTokens();
      throw error;
    }
  }

  static subscribeToRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  static onRefreshComplete(newToken: string): void {
    this.refreshSubscribers.forEach(callback => callback(newToken));
    this.refreshSubscribers = [];
  }

  static isTokenRefreshNeeded(token: string): boolean {
    if (!token) return true;
    
    // Refresh when token is about to expire (e.g., less than 5 minutes remaining)
    const timeUntilExpiry = TokenDecoder.getTimeUntilExpiry(token);
    return timeUntilExpiry < 300; // 5 minutes in seconds
  }
}
```

### Auto-Refresh Implementation

```tsx
// hooks/useAutoRefresh.ts
import { useEffect, useRef } from 'react';
import { useTokenManagement } from './useTokenManagement';
import { RefreshTokenService } from '@/services/refreshToken';

export const useAutoRefresh = () => {
  const { getAccessToken, setTokens } = useTokenManagement();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const scheduleRefresh = (token: string) => {
    const timeUntilExpiry = TokenDecoder.getTimeUntilExpiry(token);
    const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000); // Refresh 5 minutes before expiry

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const newTokens = await RefreshTokenService.refreshTokens();
        setTokens(newTokens);
        scheduleRefresh(newTokens.accessToken);
      } catch (error) {
        console.error('Failed to refresh tokens:', error);
      }
    }, refreshTime);
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token && RefreshTokenService.isTokenRefreshNeeded(token)) {
      RefreshTokenService.refreshTokens()
        .then(newTokens => {
          setTokens(newTokens);
          scheduleRefresh(newTokens.accessToken);
        })
        .catch(console.error);
    } else if (token) {
      scheduleRefresh(token);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [getAccessToken, setTokens]);
};
```

### API Client with Refresh Integration

```tsx
// utils/apiClient.ts
import axios, { AxiosError } from 'axios';
import { TokenStorage } from './tokenStorage';
import { RefreshTokenService } from '@/services/refreshToken';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

apiClient.interceptors.request.use(async config => {
  const tokens = TokenStorage.getTokens();
  
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await RefreshTokenService.refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Refresh Token Rotation

```tsx
// services/refreshTokenRotation.ts
import { TokenStorage } from '@/utils/tokenStorage';
import { apiClient } from '@/utils/apiClient';

interface RotateTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenRotation {
  private static readonly ROTATION_THRESHOLD = 3; // Number of uses before rotation

  private static usageCount: Record<string, number> = {};

  static trackTokenUsage(refreshToken: string): void {
    this.usageCount[refreshToken] = (this.usageCount[refreshToken] || 0) + 1;

    if (this.shouldRotateToken(refreshToken)) {
      this.rotateRefreshToken(refreshToken).catch(console.error);
    }
  }

  private static shouldRotateToken(refreshToken: string): boolean {
    return (this.usageCount[refreshToken] || 0) >= this.ROTATION_THRESHOLD;
  }

  private static async rotateRefreshToken(currentRefreshToken: string): Promise<void> {
    try {
      const { data } = await apiClient.post<RotateTokenResponse>(
        '/auth/rotate-refresh-token',
        { refreshToken: currentRefreshToken }
      );

      TokenStorage.setTokens(data);
      delete this.usageCount[currentRefreshToken];
    } catch (error) {
      console.error('Failed to rotate refresh token:', error);
    }
  }

  static clearUsageTracking(): void {
    this.usageCount = {};
  }
}
```

### Error Handling for Refresh Flows

```tsx
// hooks/useRefreshErrorHandler.ts
import { useEffect } from 'react';
import { useTokenManagement } from './useTokenManagement';
import { RefreshTokenService } from '@/services/refreshToken';

export const useRefreshErrorHandler = () => {
  const { clearTokens } = useTokenManagement();

  useEffect(() => {
    const handleRefreshError = (error: Error) => {
      console.error('Refresh token error:', error);
      clearTokens();
      window.location.href = '/login';
    };

    // Subscribe to refresh token errors
    const unsubscribe = RefreshTokenService.subscribeToRefresh(() => {
      // Handle successful refresh
    });

    return () => {
      unsubscribe();
    };
  }, [clearTokens]);
};
```

### Integration Example

```tsx
// components/AuthProvider.tsx
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useRefreshErrorHandler } from '@/hooks/useRefreshErrorHandler';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  useAutoRefresh();
  useRefreshErrorHandler();

  return <>{children}</>;
};

// App.tsx
export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Your routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};
```

This section covers token refresh mechanisms. The final section covers logout flows and session cleanup.

## Logout Flows and Session Cleanup

### Secure Logout Implementation

```tsx
// services/authService.ts
import { apiClient } from '@/utils/apiClient';
import { TokenStorage } from '@/utils/tokenStorage';
import { RefreshTokenRotation } from './refreshTokenRotation';

export class AuthService {
  static async logout(): Promise<void> {
    try {
      const tokens = TokenStorage.getTokens();
      if (tokens?.refreshToken) {
        // Invalidate refresh token on server
        await apiClient.post('/auth/logout', {
          refreshToken: tokens.refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up client-side regardless of server response
      this.cleanupSession();
    }
  }

  private static cleanupSession(): void {
    TokenStorage.clearTokens();
    RefreshTokenRotation.clearUsageTracking();
    // Clear any other auth-related storage
    sessionStorage.removeItem('user_settings');
    localStorage.removeItem('auth_state');
  }
}
```

### Multi-Tab Session Synchronization

```tsx
// hooks/useSessionSync.ts
import { useEffect } from 'react';
import { useTokenManagement } from './useTokenManagement';

export const useSessionSync = () => {
  const { clearTokens } = useTokenManagement();

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth_logout') {
        clearTokens();
        window.location.href = '/login';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check session status when tab becomes visible
        checkSessionStatus();
      }
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearTokens]);

  const checkSessionStatus = async () => {
    try {
      await apiClient.get('/auth/session');
    } catch (error) {
      if (error.response?.status === 401) {
        clearTokens();
        window.location.href = '/login';
      }
    }
  };
};
```

### Broadcast Channel for Cross-Tab Communication

```tsx
// utils/sessionChannel.ts
export class SessionChannel {
  private static channel: BroadcastChannel | null = null;

  static init(): void {
    if (!this.channel && window.BroadcastChannel) {
      this.channel = new BroadcastChannel('auth_session');
      this.channel.onmessage = this.handleMessage;
    }
  }

  static broadcastLogout(): void {
    this.channel?.postMessage({ type: 'LOGOUT' });
    localStorage.setItem('auth_logout', Date.now().toString());
  }

  private static handleMessage(event: MessageEvent): void {
    if (event.data.type === 'LOGOUT') {
      window.location.href = '/login';
    }
  }

  static cleanup(): void {
    this.channel?.close();
    this.channel = null;
  }
}
```

### Enhanced Logout Hook

```tsx
// hooks/useLogout.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { SessionChannel } from '@/utils/sessionChannel';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      SessionChannel.broadcastLogout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side even if server request fails
      SessionChannel.broadcastLogout();
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return { logout };
};
```

### Session Cleanup Utilities

```tsx
// utils/sessionCleanup.ts
export class SessionCleanup {
  static cleanupStorages(): void {
    // Clear all auth-related storage
    const authKeys = [
      'auth_access_token',
      'auth_refresh_token',
      'user_settings',
      'auth_state'
    ];

    // Clear localStorage
    authKeys.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    authKeys.forEach(key => sessionStorage.removeItem(key));

    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [key] = cookie.trim().split('=');
      if (authKeys.some(authKey => key.includes(authKey))) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  }

  static async cleanupCache(): Promise<void> {
    if ('caches' in window) {
      try {
        // Clear auth-related cache storage
        const cache = await caches.open('auth-cache');
        const keys = await cache.keys();
        await Promise.all(
          keys.map(key => {
            if (key.url.includes('/auth/')) {
              return cache.delete(key);
            }
          })
        );
      } catch (error) {
        console.error('Cache cleanup failed:', error);
      }
    }
  }

  static async fullCleanup(): Promise<void> {
    this.cleanupStorages();
    await this.cleanupCache();
    SessionChannel.cleanup();
  }
}
```

### Integration with Auth Provider

```tsx
// components/AuthProvider.tsx
import { useEffect } from 'react';
import { useSessionSync } from '@/hooks/useSessionSync';
import { SessionChannel } from '@/utils/sessionChannel';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  useAutoRefresh();
  useRefreshErrorHandler();
  useSessionSync();

  useEffect(() => {
    SessionChannel.init();
    return () => SessionChannel.cleanup();
  }, []);

  return <>{children}</>;
};
```

### Usage Example

```tsx
// components/LogoutButton.tsx
import { useLogout } from '@/hooks/useLogout';

export const LogoutButton: React.FC = () => {
  const { logout } = useLogout();

  return (
    <button 
      onClick={logout}
      className="logout-button"
    >
      Sign Out
    </button>
  );
};

// pages/Profile.tsx
import { useEffect } from 'react';
import { useLogout } from '@/hooks/useLogout';

export const Profile: React.FC = () => {
  const { logout } = useLogout();

  useEffect(() => {
    const handleInactivity = () => {
      // Auto logout after 30 minutes of inactivity
      const timeout = setTimeout(logout, 30 * 60 * 1000);
      
      const resetTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(logout, 30 * 60 * 1000);
      };

      window.addEventListener('mousemove', resetTimeout);
      window.addEventListener('keypress', resetTimeout);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('mousemove', resetTimeout);
        window.removeEventListener('keypress', resetTimeout);
      };
    };

    return handleInactivity();
  }, [logout]);

  return (
    <div>
      <h1>Profile</h1>
      <LogoutButton />
    </div>
  );
};
```

This completes the session management documentation covering token handling, refresh mechanisms, and logout flows.
