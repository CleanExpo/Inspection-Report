# Troubleshooting Guide - Part 1: Common Issues & Debugging

## Build and Compilation Issues

### TypeScript Errors

```typescript
// Common TypeScript Error: Property does not exist on type
// Solution: Define proper interfaces
interface UserData {
  id: string;
  name: string;
  email?: string;  // Optional property
}

// Instead of:
const user: any = { id: '1', name: 'John' };

// Use:
const user: UserData = { id: '1', name: 'John' };
```

### Module Resolution Issues

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}

// Debugging Module Imports
import { Component } from '@/components/Component';
// If above fails, try relative path to debug:
import { Component } from '../../components/Component';
```

### Build Configuration Issues

```javascript
// next.config.js debugging
const nextConfig = {
  // Enable detailed build output
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.DEBUG': JSON.stringify(true),
      })
    );

    // Log webpack configuration in development
    if (dev) {
      console.log('Webpack config:', JSON.stringify(config, null, 2));
    }

    return config;
  },
};
```

## Runtime Issues

### State Management Debugging

```typescript
// Debug wrapper for useState
function useDebugState<T>(initialState: T, name: string) {
  const [state, setState] = React.useState(initialState);
  
  React.useEffect(() => {
    console.log(`[${name}] State updated:`, state);
  }, [state, name]);
  
  return [state, setState] as const;
}

// Usage
function DebugComponent() {
  const [count, setCount] = useDebugState(0, 'counter');
  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}
```

### Effect Cleanup Issues

```typescript
// Common cleanup issues and solutions
function ComponentWithCleanup() {
  React.useEffect(() => {
    const subscription = subscribeToData();
    
    // Debug cleanup
    console.log('Effect setup:', subscription);
    
    return () => {
      console.log('Effect cleanup:', subscription);
      subscription.unsubscribe();
    };
  }, []);
}

// Debugging async effects
function AsyncComponent() {
  const [mounted, setMounted] = React.useState(true);
  
  React.useEffect(() => {
    let isSubscribed = true;
    
    async function fetchData() {
      try {
        const data = await api.getData();
        // Check if component is still mounted
        if (isSubscribed) {
          console.log('Data fetched while mounted');
          // Update state
        }
      } catch (error) {
        if (isSubscribed) {
          console.error('Error while mounted:', error);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isSubscribed = false;
      console.log('Cleanup: cancelled subscriptions');
    };
  }, []);
}
```

## Network Issues

### API Request Debugging

```typescript
// Axios interceptor for debugging
import axios from 'axios';

const api = axios.create();

api.interceptors.request.use(
  config => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('✅ Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
```

### CORS Issues

```typescript
// Debugging CORS configuration
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? '*' 
              : process.env.ALLOWED_ORIGIN
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};
```

## Performance Issues

### Component Re-render Debugging

```typescript
// Debug component renders
const useRenderCount = (componentName: string) => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`[${componentName}] render count:`, renderCount.current);
  });
};

// Usage
function OptimizedComponent({ data }: Props) {
  useRenderCount('OptimizedComponent');
  
  return <div>{/* Component content */}</div>;
}
```

## Best Practices

1. **Debugging Setup**
   - Use source maps in development
   - Implement proper error boundaries
   - Set up logging strategically

2. **Error Handling**
   - Implement proper try/catch blocks
   - Use error boundaries effectively
   - Log errors with context

3. **Performance Monitoring**
   - Track component render counts
   - Monitor network requests
   - Debug memory leaks

4. **Development Tools**
   - Use React Developer Tools
   - Implement proper logging
   - Set up debugging utilities
