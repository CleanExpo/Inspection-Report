# Lazy Loading Implementation - Part 2

## Data Lazy Loading

### Basic Data Fetching

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage />;

  return <UserDetails user={user} />;
}
```

### Infinite Scroll Implementation

```jsx
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items?page=${page}`);
      const newItems = await response.json();
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="infinite-list">
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastElementRef : null}
        >
          <ItemCard item={item} />
        </div>
      ))}
      {loading && <LoadingSpinner />}
      {!hasMore && <div>No more items to load</div>}
    </div>
  );
}
```

### Progressive Data Loading

```jsx
function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    basic: null,
    detailed: null,
    historical: null
  });
  
  useEffect(() => {
    // Load basic metrics immediately
    const loadBasicMetrics = async () => {
      const data = await fetch('/api/metrics/basic');
      setMetrics(prev => ({ ...prev, basic: await data.json() }));
    };
    
    // Load detailed metrics after a delay
    const loadDetailedMetrics = async () => {
      const data = await fetch('/api/metrics/detailed');
      setMetrics(prev => ({ ...prev, detailed: await data.json() }));
    };
    
    // Load historical data last
    const loadHistoricalMetrics = async () => {
      const data = await fetch('/api/metrics/historical');
      setMetrics(prev => ({ ...prev, historical: await data.json() }));
    };

    loadBasicMetrics();
    setTimeout(loadDetailedMetrics, 1000);
    setTimeout(loadHistoricalMetrics, 2000);
  }, []);

  return (
    <div className="dashboard">
      {metrics.basic ? (
        <BasicMetrics data={metrics.basic} />
      ) : (
        <MetricsSkeleton type="basic" />
      )}
      
      {metrics.detailed ? (
        <DetailedMetrics data={metrics.detailed} />
      ) : (
        <MetricsSkeleton type="detailed" />
      )}
      
      {metrics.historical ? (
        <HistoricalMetrics data={metrics.historical} />
      ) : (
        <MetricsSkeleton type="historical" />
      )}
    </div>
  );
}
```

### Data Prefetching

```jsx
function usePrefetch() {
  const cache = useRef(new Map());

  const prefetch = useCallback(async (url) => {
    if (cache.current.has(url)) return;

    try {
      const response = await fetch(url);
      const data = await response.json();
      cache.current.set(url, data);
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  }, []);

  const getCachedData = useCallback((url) => {
    return cache.current.get(url);
  }, []);

  return { prefetch, getCachedData };
}

function NavigationLink({ to, children }) {
  const { prefetch } = usePrefetch();
  
  return (
    <Link
      to={to}
      onMouseEnter={() => prefetch(`/api/data${to}`)}
      onFocus={() => prefetch(`/api/data${to}`)}
    >
      {children}
    </Link>
  );
}
```

### Optimistic Updates with Data Loading

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, setOptimisticTodos] = useState([]);
  const [error, setError] = useState(null);

  const addTodo = async (newTodo) => {
    // Add optimistic todo
    const optimisticTodo = { ...newTodo, id: Date.now(), status: 'pending' };
    setOptimisticTodos(prev => [...prev, optimisticTodo]);

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
      const savedTodo = await response.json();
      
      // Remove optimistic todo and add real one
      setOptimisticTodos(prev => 
        prev.filter(todo => todo.id !== optimisticTodo.id)
      );
      setTodos(prev => [...prev, savedTodo]);
    } catch (error) {
      setError('Failed to add todo');
      // Remove failed optimistic todo
      setOptimisticTodos(prev =>
        prev.filter(todo => todo.id !== optimisticTodo.id)
      );
    }
  };

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      <TodoForm onSubmit={addTodo} />
      <div className="todo-list">
        {[...todos, ...optimisticTodos].map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isPending={todo.status === 'pending'}
          />
        ))}
      </div>
    </div>
  );
}
