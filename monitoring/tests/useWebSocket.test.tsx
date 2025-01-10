import { renderHook, act } from '@testing-library/react-hooks';
import { useWebSocket, useWebSocketEvent } from '../services/websocket/hooks/useWebSocket';
import { WebSocketClient } from '../services/websocket/client';
import { WebSocketMessage, WebSocketSubscription } from '../services/websocket/types';
import { MockWebSocket, wait, generateMetric } from './test-utils';

interface MockClient {
  on: jest.Mock;
  off: jest.Mock;
  emit: jest.Mock;
  send: jest.Mock;
  subscribe: jest.Mock;
  unsubscribe: jest.Mock;
  close: jest.Mock;
}

// Create a mock factory function
const createMockClient = (): MockClient => {
  const eventHandlers: Record<string, Set<Function>> = {
    message: new Set(),
    metric: new Set(),
    alert: new Set(),
    error: new Set(),
    connected: new Set(),
    disconnected: new Set(),
    reconnect_failed: new Set(),
    test: new Set()
  };

  return {
    on: jest.fn((event: string, handler: Function) => {
      eventHandlers[event]?.add(handler);
    }),
    off: jest.fn((event: string, handler: Function) => {
      eventHandlers[event]?.delete(handler);
    }),
    emit: jest.fn((event: string, data?: any) => {
      eventHandlers[event]?.forEach(handler => handler(data));
    }),
    send: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    close: jest.fn()
  };
};

// Mock the WebSocket client implementation
jest.mock('../services/websocket/client', () => ({
  WebSocketClient: jest.fn().mockImplementation(createMockClient)
}));

describe('useWebSocket Hook', () => {
  const mockUrl = 'ws://localhost:3002/monitoring';
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = createMockClient();
    (WebSocketClient as unknown as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: mockUrl })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful connection', async () => {
    const onConnected = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        onConnected
      })
    );

    act(() => {
      mockClient.emit('connected');
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.connecting).toBe(false);
    expect(onConnected).toHaveBeenCalled();
  });

  it('should handle disconnection', async () => {
    const onDisconnected = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        onDisconnected,
        autoReconnect: true
      })
    );

    act(() => {
      mockClient.emit('disconnected');
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(true);
    expect(onDisconnected).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        onError
      })
    );

    const testError = new Error('Test error');
    act(() => {
      mockClient.emit('error', testError);
    });

    expect(result.current.error).toBe(testError);
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should handle message events', async () => {
    const onMessage = jest.fn();
    renderHook(() =>
      useWebSocket({
        url: mockUrl,
        onMessage
      })
    );

    const testMessage: WebSocketMessage = {
      event: 'test',
      data: { value: 42 },
      timestamp: new Date().toISOString()
    };

    act(() => {
      mockClient.emit('message', testMessage);
    });

    expect(onMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should handle subscriptions', async () => {
    const subscription: WebSocketSubscription = {
      events: ['metric'],
      filters: {
        metricNames: ['cpu_usage']
      }
    };

    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        subscription
      })
    );

    // Should subscribe on connection
    act(() => {
      mockClient.emit('connected');
    });

    // Test subscribing to new events
    act(() => {
      result.current.subscribe({
        events: ['metric', 'alert'],
        filters: {
          metricNames: ['cpu_usage', 'memory_usage']
        }
      });
    });

    // Test unsubscribing
    act(() => {
      result.current.unsubscribe();
    });
  });

  it('should handle reconnection failure', async () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: mockUrl,
        reconnectAttempts: 3
      })
    );

    act(() => {
      mockClient.emit('reconnect_failed');
    });

    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Failed to reconnect');
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebSocket({ url: mockUrl })
    );

    const closeSpy = jest.spyOn(mockClient, 'close');
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });
});

describe('useWebSocketEvent Hook', () => {
  let mockClient: MockClient;
  const handler = jest.fn();

  beforeEach(() => {
    mockClient = createMockClient();
    (WebSocketClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    handler.mockClear();
  });

  it('should subscribe to events', () => {
    renderHook(() =>
      useWebSocketEvent(mockClient as any, 'metric', handler)
    );

    const testMetric = generateMetric();
    act(() => {
      mockClient.emit('metric', testMetric);
    });

    expect(handler).toHaveBeenCalledWith(testMetric);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebSocketEvent(mockClient as any, 'metric', handler)
    );

    unmount();

    const testMetric = generateMetric();
    act(() => {
      mockClient.emit('metric', testMetric);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle null client', () => {
    renderHook(() =>
      useWebSocketEvent(null, 'metric', handler)
    );

    const testMetric = generateMetric();
    expect(() => {
      act(() => {
        mockClient.emit('metric', testMetric);
      });
    }).not.toThrow();

    expect(handler).not.toHaveBeenCalled();
  });
});
