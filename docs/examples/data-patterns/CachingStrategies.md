# Caching Strategies

This guide covers common caching patterns in React applications, including client-side caching, cache invalidation, and optimistic updates.

## Client-Side Caching

### Basic In-Memory Cache
```tsx
const createCache = () => {
  const cache: Map<string, { data: any; timestamp: number }> = new Map();
  const MAX_AGE = 5 * 60 * 1000; // 5 minutes

  return {
    set: (key: string, data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    get: (key: string) => {
      const item = cache.get(key);
      if (!item) return null;
      
      const isExpired = Date.now() - item.timestamp > MAX_AGE;
      if (isExpired) {
        cache.delete(key);
        return null;
      }
      
      return item.data;
    },
    clear: () => cache.clear(),
    delete: (key: string) => cache.delete(key)
  };
};

// Usage with Custom Hook
const useDataWithCache = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(createCache());

  const fetchData = async () => {
    setLoading(true);
    try {
      const cachedData = cacheRef.current.get(url);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      const response = await fetch(url);
      const json = await response.json();
      cacheRef.current.set(url, json);
      setData(json);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, refetch: fetchData };
};
```

### Local Storage Cache
```tsx
const localStorageCache = {
  set: (key: string, data: any, ttl: number = 3600000) => {
    const item = {
      data,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key: string) => {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  },
  
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};
```

## Cache Invalidation

### Time-Based Invalidation
```tsx
const useTimedCache = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const shouldRefetch = () => {
    return Date.now() - lastFetchRef.current > ttl;
  };

  const fetchData = async (force: boolean = false) => {
    if (!force && !shouldRefetch() && data) {
      return;
    }

    setLoading(true);
    try {
      const newData = await fetcher();
      setData(newData);
      lastFetchRef.current = Date.now();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  return { data, loading, refetch: () => fetchData(true) };
};
```

### Event-Based Invalidation
```tsx
const createEventCache = () => {
  const cache = new Map();
  const subscribers = new Map();

  return {
    set: (key: string, data: any) => {
      cache.set(key, data);
      if (subscribers.has(key)) {
        subscribers.get(key).forEach((callback: Function) => callback(data));
      }
    },

    get: (key: string) => cache.get(key),

    invalidate: (key: string) => {
      cache.delete(key);
      if (subscribers.has(key)) {
        subscribers.get(key).forEach((callback: Function) => callback(null));
      }
    },

    subscribe: (key: string, callback: Function) => {
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key).add(callback);
      return () => subscribers.get(key).delete(callback);
    }
  };
};
```

## Optimistic Updates

### Basic Optimistic Update Pattern
```tsx
const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = async (newTodo: Todo) => {
    // Optimistically add the todo
    setTodos(prev => [...prev, newTodo]);

    try {
      // Attempt to save to server
      await api.createTodo(newTodo);
    } catch (error) {
      // Revert on failure
      setTodos(prev => prev.filter(todo => todo.id !== newTodo.id));
      alert('Failed to create todo');
    }
  };

  const deleteTodo = async (id: string) => {
    // Store previous state
    const previousTodos = todos;
    
    // Optimistically remove the todo
    setTodos(prev => prev.filter(todo => todo.id !== id));

    try {
      // Attempt to delete from server
      await api.deleteTodo(id);
    } catch (error) {
      // Revert on failure
      setTodos(previousTodos);
      alert('Failed to delete todo');
    }
  };

  return (
    <div>
      {/* Todo list rendering */}
    </div>
  );
};
```

### Advanced Optimistic Updates with Queue
```tsx
interface QueuedOperation {
  id: string;
  operation: () => Promise<void>;
  rollback: () => void;
}

const useOptimisticQueue = () => {
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [processing, setProcessing] = useState(false);

  const addOperation = (operation: QueuedOperation) => {
    setQueue(prev => [...prev, operation]);
  };

  useEffect(() => {
    const processQueue = async () => {
      if (processing || queue.length === 0) return;

      setProcessing(true);
      const operation = queue[0];

      try {
        await operation.operation();
        setQueue(prev => prev.slice(1));
      } catch (error) {
        operation.rollback();
        setQueue(prev => prev.slice(1));
      } finally {
        setProcessing(false);
      }
    };

    processQueue();
  }, [queue, processing]);

  return { addOperation, processing };
};
```

## Best Practices

1. **Cache Strategy Selection**
   - Choose appropriate storage mechanism (memory vs localStorage)
   - Consider data volatility when setting TTL
   - Implement proper error handling and fallbacks

2. **Cache Invalidation**
   - Use appropriate invalidation triggers (time, events, user actions)
   - Implement proper cleanup to prevent memory leaks
   - Consider cache warming for critical data

3. **Optimistic Updates**
   - Always store previous state for rollbacks
   - Handle edge cases and race conditions
   - Provide clear feedback on success/failure

4. **Performance Considerations**
   - Implement proper garbage collection
   - Use appropriate serialization methods
   - Consider memory usage in cache implementations

5. **Security**
   - Never cache sensitive data in localStorage
   - Implement proper data encryption when needed
   - Clear cache on user logout

These patterns provide a foundation for implementing robust caching strategies in React applications. Adapt them based on your specific use cases and requirements.
