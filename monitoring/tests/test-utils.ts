import { WebSocketMessage } from '../services/websocket/types';
import { EventEmitter } from 'events';

export class MockWebSocket extends EventEmitter {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(url: string = 'ws://localhost:3002') {
    super();
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit('open', { type: 'open' });
      if (this.onopen) this.onopen({ type: 'open' });
    }, 0);
  }

  send(data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.emit('send', data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.emit('close', { type: 'close' });
    if (this.onclose) this.onclose({ type: 'close' });
  }

  // EventEmitter methods that need to be explicitly typed
  addListener(event: string, listener: (...args: any[]) => void): this {
    return super.addListener(event, listener);
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }

  removeAllListeners(event?: string): this {
    return super.removeAllListeners(event);
  }

  once(event: string, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  addEventListener(event: string, handler: (event: any) => void): void {
    switch (event) {
      case 'open':
        this.onopen = handler;
        break;
      case 'close':
        this.onclose = handler;
        break;
      case 'message':
        this.onmessage = handler;
        break;
      case 'error':
        this.onerror = handler;
        break;
    }
    this.on(event, handler);
  }

  removeEventListener(event: string, handler: (event: any) => void): void {
    switch (event) {
      case 'open':
        if (this.onopen === handler) this.onopen = null;
        break;
      case 'close':
        if (this.onclose === handler) this.onclose = null;
        break;
      case 'message':
        if (this.onmessage === handler) this.onmessage = null;
        break;
      case 'error':
        if (this.onerror === handler) this.onerror = null;
        break;
    }
    this.off(event, handler);
  }
}

export const wait = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

export const generateMetric = (overrides: Record<string, any> = {}) => ({
  name: 'test_metric',
  value: Math.random() * 100,
  timestamp: Date.now(),
  tags: {
    environment: 'test',
    service: 'monitoring'
  },
  ...overrides
});

export const generateAlert = (overrides: Record<string, any> = {}) => ({
  id: Math.random().toString(36).substring(7),
  severity: 'warning',
  message: 'Test alert message',
  timestamp: Date.now(),
  source: 'test-service',
  metric: generateMetric(),
  threshold: 80,
  value: 85,
  tags: {
    environment: 'test',
    service: 'monitoring'
  },
  ...overrides
});

export const generateWebSocketMessage = (overrides: Partial<WebSocketMessage> = {}): WebSocketMessage => ({
  event: 'test',
  data: { value: Math.random() * 100 },
  timestamp: new Date().toISOString(),
  ...overrides
});

export const mockConsole = () => {
  const originalConsole = { ...console };
  beforeAll(() => {
    console.log = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  });
};

export const mockEnvironmentVariables = (variables: Record<string, string> = {}) => {
  const originalEnv = { ...process.env };
  beforeAll(() => {
    process.env = {
      ...process.env,
      ...variables
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });
};

export const createMockEventEmitter = () => {
  const handlers: Record<string, Set<Function>> = {};

  return {
    on: jest.fn((event: string, handler: Function) => {
      if (!handlers[event]) {
        handlers[event] = new Set();
      }
      handlers[event].add(handler);
    }),
    off: jest.fn((event: string, handler: Function) => {
      handlers[event]?.delete(handler);
    }),
    emit: jest.fn((event: string, data?: any) => {
      handlers[event]?.forEach(handler => handler(data));
    }),
    handlers
  };
};

export const mockWebSocketServer = () => {
  const connections = new Set<MockWebSocket>();
  const events = new Map<string, Set<Function>>();

  return {
    connections,
    events,
    on: (event: string, handler: Function) => {
      if (!events.has(event)) {
        events.set(event, new Set());
      }
      events.get(event)?.add(handler);
    },
    emit: (event: string, ...args: any[]) => {
      events.get(event)?.forEach(handler => handler(...args));
    },
    broadcast: (data: any) => {
      connections.forEach(connection => {
        if (connection.readyState === MockWebSocket.OPEN) {
          connection.emit('message', { data: JSON.stringify(data) });
        }
      });
    },
    close: () => {
      connections.forEach(connection => connection.close());
      connections.clear();
      events.clear();
    }
  };
};

export const mockFetch = () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  return global.fetch as jest.Mock;
};
