# Data Fetching Patterns

This guide demonstrates common patterns for fetching data in React applications, including REST API integration, GraphQL queries, and WebSocket usage.

## REST API Integration

### Basic Fetch Pattern
```tsx
const UserProfile = () => {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setData(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return null;

  return <UserProfileDisplay data={data} />;
};
```

### Custom Hook Pattern
```tsx
const useApi = <T,>(url: string) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    fetchData();
  }, [url]);

  return state;
};

// Usage
const UserList = () => {
  const { data, loading, error } = useApi<User[]>('/api/users');
  // ... render logic
};
```

## GraphQL Integration

### Apollo Client Setup
```tsx
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <YourApp />
  </ApolloProvider>
);
```

### Query Pattern
```tsx
import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

const UserProfile = ({ userId }: { userId: string }) => {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
      <h2>Posts</h2>
      <ul>
        {data.user.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

## WebSocket Integration

### Basic WebSocket Setup
```tsx
const useWebSocket = (url: string) => {
  const [message, setMessage] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { message, connected, sendMessage };
};
```

### Real-time Chat Example
```tsx
const ChatRoom = ({ roomId }: { roomId: string }) => {
  const { message, connected, sendMessage } = useWebSocket(
    `wss://api.example.com/chat/${roomId}`
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (message) {
      setMessages(prev => [...prev, message]);
    }
  }, [message]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({
        type: 'message',
        content: input,
        timestamp: new Date().toISOString(),
      });
      setInput('');
    }
  };

  return (
    <div className="chat-room">
      <div className="status">
        {connected ? 'Connected' : 'Disconnected'}
      </div>
      
      <div className="messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};
```

## Best Practices

1. **Error Handling**
   - Always handle network errors gracefully
   - Provide meaningful error messages to users
   - Implement retry mechanisms for failed requests

2. **Loading States**
   - Show loading indicators during data fetching
   - Consider skeleton screens for better UX
   - Handle partial loading states in complex UIs

3. **Caching**
   - Implement appropriate caching strategies
   - Use browser's cache when applicable
   - Consider implementing stale-while-revalidate pattern

4. **TypeScript Integration**
   - Define strong types for API responses
   - Use generics for reusable data fetching hooks
   - Leverage type inference where possible

5. **Performance**
   - Implement request cancellation for unmounted components
   - Use pagination or infinite scroll for large datasets
   - Consider implementing request debouncing/throttling

These patterns provide a foundation for robust data fetching in React applications. Choose and adapt them based on your specific requirements and constraints.
