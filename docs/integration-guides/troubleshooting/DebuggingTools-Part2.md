# Troubleshooting Guide - Part 2: Debugging Tools & Advanced Techniques

## Browser Developer Tools

### React Developer Tools

```typescript
// Component for demonstrating React DevTools
function DebuggableComponent() {
  const [state, setState] = React.useState({
    count: 0,
    items: [],
    loading: false
  });

  // Set a debug value to inspect in React DevTools
  React.useDebugValue(`Count: ${state.count}`);

  return (
    <div data-testid="debuggable">
      {/* Content */}
    </div>
  );
}
```

### Performance Profiling

```typescript
// Performance monitoring wrapper
const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      performance.mark(`${componentName}-mount-start`);
      
      return () => {
        performance.mark(`${componentName}-unmount`);
        performance.measure(
          `${componentName}-lifecycle`,
          `${componentName}-mount-start`,
          `${componentName}-unmount`
        );
      };
    }, []);

    return <WrappedComponent {...props} />;
  };
};

// Usage
const TrackedComponent = withPerformanceTracking(MyComponent, 'MyComponent');
```

## Advanced Debugging Techniques

### Custom Debug Logger

```typescript
// src/utils/debugLogger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level: LogLevel;
  module: string;
  data?: any;
}

class DebugLogger {
  private static instance: DebugLogger;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log({ level, module, data }: LogOptions): void {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${level.toUpperCase()}] [${module}]`;

    switch (level) {
      case 'debug':
        console.debug(message, data);
        break;
      case 'info':
        console.info(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      case 'error':
        console.error(message, data);
        break;
    }
  }
}

export const logger = DebugLogger.getInstance();
```

### Memory Leak Detection

```typescript
// src/utils/memoryDebugger.ts
class MemoryDebugger {
  private static instance: MemoryDebugger;
  private intervals: Set<NodeJS.Timeout>;
  private subscriptions: Set<{ unsubscribe: () => void }>;

  private constructor() {
    this.intervals = new Set();
    this.subscriptions = new Set();
  }

  static getInstance(): MemoryDebugger {
    if (!MemoryDebugger.instance) {
      MemoryDebugger.instance = new MemoryDebugger();
    }
    return MemoryDebugger.instance;
  }

  trackInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
  }

  trackSubscription(subscription: { unsubscribe: () => void }): void {
    this.subscriptions.add(subscription);
  }

  cleanup(): void {
    // Clear intervals
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Clear subscriptions
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  getStats(): { intervals: number; subscriptions: number } {
    return {
      intervals: this.intervals.size,
      subscriptions: this.subscriptions.size
    };
  }
}

export const memoryDebugger = MemoryDebugger.getInstance();
```

## Network Debugging Tools

### Request Inspector

```typescript
// src/utils/requestInspector.ts
interface RequestLog {
  timestamp: number;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  duration?: number;
  status?: number;
  response?: any;
  error?: Error;
}

class RequestInspector {
  private logs: RequestLog[] = [];
  private maxLogs: number = 100;

  logRequest(log: RequestLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  getRequestLogs(): RequestLog[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  searchLogs(query: string): RequestLog[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.url.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.body).toLowerCase().includes(lowerQuery)
    );
  }
}

export const requestInspector = new RequestInspector();
```

### WebSocket Debugger

```typescript
// src/utils/wsDebugger.ts
class WebSocketDebugger {
  private socket: WebSocket | null = null;
  private messageLog: any[] = [];
  private maxLogSize: number = 100;

  connect(url: string): void {
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      console.log(`[WS] Connected to ${url}`);
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.logMessage('receive', message);
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  send(message: any): void {
    if (!this.socket) {
      console.error('[WS] Not connected');
      return;
    }
    
    this.logMessage('send', message);
    this.socket.send(JSON.stringify(message));
  }

  private logMessage(type: 'send' | 'receive', message: any): void {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      message
    };

    this.messageLog.unshift(log);
    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.pop();
    }
  }

  getMessageLog(): any[] {
    return this.messageLog;
  }
}

export const wsDebugger = new WebSocketDebugger();
```

## Best Practices

1. **Development Environment**
   - Use proper source maps
   - Enable detailed logging
   - Implement debugging utilities

2. **Performance Debugging**
   - Profile component renders
   - Monitor memory usage
   - Track network requests

3. **Error Tracking**
   - Implement comprehensive logging
   - Use error boundaries
   - Track unhandled rejections

4. **Network Debugging**
   - Monitor WebSocket connections
   - Track API requests
   - Debug CORS issues

5. **Memory Management**
   - Track subscriptions
   - Monitor intervals
   - Check for memory leaks
