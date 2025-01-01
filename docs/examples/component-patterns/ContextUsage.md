# Context Usage Patterns

This guide demonstrates common patterns for using React Context, including theme management, authentication state, and composing multiple contexts.

## Theme Context Patterns

### Basic Theme Context

```tsx
// contexts/ThemeContext.tsx
interface ThemeContextType {
  isDarkMode: boolean;
  primaryColor: string;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#007bff');

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    isDarkMode,
    primaryColor,
    toggleTheme,
    setPrimaryColor
  }), [isDarkMode, primaryColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Theme Context Usage

```tsx
const ThemeAwareComponent: React.FC = () => {
  const { isDarkMode, primaryColor } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: isDarkMode ? '#333' : '#fff',
      color: isDarkMode ? '#fff' : '#333',
      borderColor: primaryColor
    }}>
      Theme Aware Content
    </div>
  );
};
```

## Authentication Context

### Auth Context Implementation

```tsx
// contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const checkPermission = useCallback((permission: string) => {
    return user?.roles.includes(permission) ?? false;
  }, [user?.roles]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    checkPermission
  }), [user, login, logout, checkPermission]);

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

### Protected Route Pattern

```tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : null;
};
```

## Multi-Context Composition

### Context Composition Pattern

```tsx
// contexts/AppContext.tsx
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
```

### Custom Hook Composition

```tsx
// hooks/useAppContext.ts
interface AppContextHook {
  user: User | null;
  isDarkMode: boolean;
  notifications: Notification[];
  settings: AppSettings;
}

export const useAppContext = (): AppContextHook => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { notifications } = useNotifications();
  const { settings } = useSettings();

  return useMemo(() => ({
    user,
    isDarkMode,
    notifications,
    settings
  }), [user, isDarkMode, notifications, settings]);
};
```

### Context Performance Optimization

```tsx
// Splitting context to prevent unnecessary rerenders
interface ThemeStateContext {
  isDarkMode: boolean;
  primaryColor: string;
}

interface ThemeActionsContext {
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeStateContext = createContext<ThemeStateContext | undefined>(undefined);
const ThemeActionsContext = createContext<ThemeActionsContext | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    isDarkMode: false,
    primaryColor: '#007bff'
  });

  const actions = useMemo(() => ({
    toggleTheme: () => setState(prev => ({ 
      ...prev, 
      isDarkMode: !prev.isDarkMode 
    })),
    setPrimaryColor: (color: string) => setState(prev => ({ 
      ...prev, 
      primaryColor: color 
    }))
  }), []);

  return (
    <ThemeStateContext.Provider value={state}>
      <ThemeActionsContext.Provider value={actions}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeStateContext.Provider>
  );
};
```

## Best Practices

1. **Context Creation**
   - Create separate files for each context
   - Include TypeScript interfaces
   - Provide custom hooks for consumption

2. **Performance Optimization**
   - Use context splitting for state/actions
   - Implement useMemo for context values
   - Consider using context selectors

3. **Error Handling**
   - Add error boundaries around providers
   - Validate context usage with custom hooks
   - Provide meaningful error messages

4. **Testing**
   - Create test providers
   - Mock context values
   - Test context updates
