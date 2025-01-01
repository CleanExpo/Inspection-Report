# Component Integration Patterns

This guide demonstrates common patterns for integrating and composing React components effectively.

## Component Composition Examples

### Basic Component Composition
```tsx
// Basic composition with children props
const Card = ({ children }) => (
  <div className="card">
    {children}
  </div>
);

const CardHeader = ({ title }) => (
  <div className="card-header">
    <h2>{title}</h2>
  </div>
);

// Usage example
const UserCard = ({ user }) => (
  <Card>
    <CardHeader title={user.name} />
    <div className="card-body">
      <p>{user.email}</p>
    </div>
  </Card>
);
```

### Higher-Order Components (HOC)
```tsx
// HOC for adding loading state
const withLoading = (WrappedComponent) => {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
};

// Usage example
const UserList = ({ users }) => (
  <ul>
    {users.map(user => <li key={user.id}>{user.name}</li>)}
  </ul>
);

const UserListWithLoading = withLoading(UserList);
```

### Render Props Pattern
```tsx
// Render prop component for handling mouse position
const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
};

// Usage example
const App = () => (
  <MouseTracker
    render={({ x, y }) => (
      <div>Mouse position: {x}, {y}</div>
    )}
  />
);
```

## State Management Patterns

### Local State Management
```tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};
```

### Global State Integration
```tsx
// Using React Context for global state
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Usage in components
const ThemedButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button 
      className={`btn-${theme}`}
      onClick={toggleTheme}
    >
      Toggle Theme
    </button>
  );
};
```

### State Lifting Patterns
```tsx
const ParentComponent = () => {
  const [sharedState, setSharedState] = useState('');

  const handleStateChange = (newValue) => {
    setSharedState(newValue);
  };

  return (
    <>
      <ChildA 
        value={sharedState} 
        onChange={handleStateChange} 
      />
      <ChildB 
        value={sharedState} 
        onChange={handleStateChange} 
      />
    </>
  );
};
```

## Props and Event Handling

### Event Propagation Examples
```tsx
const NestedButtons = () => {
  const handleParentClick = (e) => {
    console.log('Parent clicked');
  };

  const handleChildClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log('Child clicked');
  };

  return (
    <div onClick={handleParentClick}>
      <button onClick={handleChildClick}>
        Click Me
      </button>
    </div>
  );
};
```

### Props Drilling Solutions
```tsx
// Using Context to avoid props drilling
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Deep nested component can access user directly
const DeepNestedComponent = () => {
  const { user } = useContext(UserContext);
  return <div>Hello, {user.name}!</div>;
};
```

### Custom Event Handlers
```tsx
const useCustomEvent = (eventName, handler) => {
  useEffect(() => {
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName, handler]);
};

// Usage example
const Component = () => {
  const handleCustomEvent = useCallback((e) => {
    console.log('Custom event:', e.detail);
  }, []);

  useCustomEvent('myCustomEvent', handleCustomEvent);

  return <div>Listening for custom events...</div>;
};
```

## Context Usage Examples

### Theme Context Pattern
```tsx
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff'
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Authentication Context
```tsx
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      // Login logic
      setUser(/* user data */);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    setUser(null);
    // Cleanup logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Multi-Context Composition
```tsx
const AppProviders = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <UserPreferencesProvider>
        {children}
      </UserPreferencesProvider>
    </ThemeProvider>
  </AuthProvider>
);

// Usage example
const App = () => (
  <AppProviders>
    <Router>
      <MainContent />
    </Router>
  </AppProviders>
);
```

## Best Practices and Tips

1. Keep components focused and single-responsibility
2. Use TypeScript for better type safety and IDE support
3. Implement proper error boundaries
4. Optimize re-renders using React.memo and useMemo
5. Follow consistent naming conventions
6. Document component APIs using JSDoc or similar
7. Implement proper prop validation
8. Use composition over inheritance
9. Keep state as local as possible
10. Use custom hooks to extract reusable logic
