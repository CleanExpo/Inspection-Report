# Data Management Patterns

This guide demonstrates common patterns for managing data in React applications.

## Data Fetching Examples

### REST API Integration
```tsx
const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Usage example
const UserProfile = ({ userId }) => {
  const { data, loading, error } = useApi(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
};
```

### GraphQL Queries
```tsx
const useGraphQL = (query, variables) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        });
        
        const json = await response.json();
        
        if (json.errors) {
          throw new Error(json.errors[0].message);
        }
        
        setData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, variables]);

  return { data, loading, error };
};

// Usage example
const UserPosts = ({ userId }) => {
  const { data, loading, error } = useGraphQL(`
    query GetUserPosts($userId: ID!) {
      user(id: $userId) {
        posts {
          id
          title
          content
        }
      }
    }
  `, { userId });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.user.posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};
```

### WebSocket Usage
```tsx
const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connecting');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setStatus('connected');
    };

    ws.current.onclose = () => {
      setStatus('disconnected');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => {
      ws.current.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { messages, status, sendMessage };
};

// Usage example
const ChatRoom = ({ roomId }) => {
  const { messages, status, sendMessage } = useWebSocket(`ws://api.example.com/chat/${roomId}`);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage({ type: 'message', content: newMessage });
    setNewMessage('');
  };

  return (
    <div>
      <div>Status: {status}</div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
```

## Caching Strategies

### Client-Side Caching
```tsx
const createCache = () => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value, ttl = 5 * 60 * 1000) => {
      cache.set(key, {
        value,
        expiry: Date.now() + ttl
      });
    },
    has: (key) => {
      if (!cache.has(key)) return false;
      
      const item = cache.get(key);
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return false;
      }
      
      return true;
    }
  };
};

const dataCache = createCache();

const useCachedApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (dataCache.has(endpoint)) {
        setData(dataCache.get(endpoint).value);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint);
        const json = await response.json();
        dataCache.set(endpoint, json);
        setData(json);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading };
};
```

### Cache Invalidation
```tsx
const useInvalidatingCache = () => {
  const cache = useRef(new Map());

  const invalidate = (pattern) => {
    const regex = new RegExp(pattern);
    for (const key of cache.current.keys()) {
      if (regex.test(key)) {
        cache.current.delete(key);
      }
    }
  };

  const set = (key, value) => {
    cache.current.set(key, value);
  };

  const get = (key) => {
    return cache.current.get(key);
  };

  return { invalidate, set, get };
};

// Usage example
const UserData = () => {
  const cache = useInvalidatingCache();

  const updateUser = async (userData) => {
    await fetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    // Invalidate all user-related cache entries
    cache.invalidate('^/api/user');
  };

  return <div>{/* Component content */}</div>;
};
```

### Optimistic Updates
```tsx
const useTodo = (todoId) => {
  const [todo, setTodo] = useState(null);

  const updateTodo = async (updates) => {
    // Optimistically update UI
    const previousTodo = todo;
    setTodo(current => ({ ...current, ...updates }));

    try {
      // Make API request
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      // Update with server response
      const updatedTodo = await response.json();
      setTodo(updatedTodo);
    } catch (error) {
      // Revert to previous state on error
      setTodo(previousTodo);
      throw error;
    }
  };

  return { todo, updateTodo };
};
```

## Error Boundary Implementation

### Global Error Handling
```tsx
class GlobalErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Component-Level Boundaries
```tsx
const withErrorBoundary = (WrappedComponent, FallbackComponent) => {
  return class extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    render() {
      if (this.state.hasError) {
        return <FallbackComponent error={this.state.error} />;
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

// Usage example
const UserProfile = withErrorBoundary(
  ({ userId }) => {
    // Component implementation
  },
  ({ error }) => (
    <div className="error-message">
      Failed to load user profile: {error.message}
    </div>
  )
);
```

### Recovery Patterns
```tsx
const useErrorRecovery = (operation) => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const execute = async (...args) => {
    try {
      setError(null);
      return await operation(...args);
    } catch (err) {
      setError(err);
      if (retryCount < maxRetries) {
        setRetryCount(count => count + 1);
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
        return execute(...args);
      }
      throw err;
    }
  };

  const reset = () => {
    setError(null);
    setRetryCount(0);
  };

  return { execute, error, reset, retryCount };
};
```

## Loading State Management

### Skeleton Screens
```tsx
const Skeleton = ({ width, height, variant = 'rect' }) => (
  <div
    className={`skeleton skeleton-${variant}`}
    style={{ width, height }}
  />
);

const UserCardSkeleton = () => (
  <div className="user-card-skeleton">
    <Skeleton variant="circle" width={50} height={50} />
    <div className="user-info">
      <Skeleton width={200} height={20} />
      <Skeleton width={150} height={16} />
    </div>
  </div>
);

const UserCard = ({ userId }) => {
  const { data, loading } = useApi(`/api/users/${userId}`);

  if (loading) return <UserCardSkeleton />;

  return (
    <div className="user-card">
      <img src={data.avatar} alt={data.name} />
      <div className="user-info">
        <h3>{data.name}</h3>
        <p>{data.email}</p>
      </div>
    </div>
  );
};
```

### Progressive Loading
```tsx
const useProgressiveLoading = (items, pageSize = 10) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedItems(current => {
        const nextItems = items.slice(0, (currentPage + 1) * pageSize);
        if (nextItems.length === current.length) {
          clearInterval(timer);
          return current;
        }
        setCurrentPage(page => page + 1);
        return nextItems;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [items, pageSize]);

  return displayedItems;
};
```

### Infinite Scroll
```tsx
const useInfiniteScroll = (fetchMore) => {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoading(true);
        fetchMore().then(hasMoreItems => {
          setHasMore(hasMoreItems);
          setLoading(false);
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchMore]);

  return { lastElementRef, loading, hasMore };
};

// Usage example
const InfiniteList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  const fetchMore = async () => {
    const response = await fetch(`/api/items?page=${page}`);
    const newItems = await response.json();
    setItems(current => [...current, ...newItems]);
    setPage(p => p + 1);
    return newItems.length > 0;
  };

  const { lastElementRef, loading, hasMore } = useInfiniteScroll(fetchMore);

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastElementRef : null}
        >
          {item.content}
        </div>
      ))}
      {loading && <div>Loading...</div>}
      {!hasMore && <div>No more items</div>}
    </div>
  );
};
```

## Best Practices and Tips

1. Implement proper error handling at all levels
2. Use appropriate loading states and feedback
3. Implement proper caching strategies
4. Handle race conditions in async operations
5. Implement proper retry mechanisms
6. Use appropriate error boundaries
7. Implement proper loading skeletons
8. Handle edge cases and error states
9. Implement proper data validation
10. Use appropriate state management solutions
