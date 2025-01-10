import { renderHook, act } from '@testing-library/react-hooks';
import { useWebSocketClient, useWebSocketEvent } from '../services/websocket/hooks/useWebSocketClient';
import { generateMetric, generateAlert, wait } from './test-utils';
import type { WebSocketMessage } from '../services/websocket/types';

interface MockCall {
  0: string;
  1: Function;
  length: number;
}

// Mock the WebSocket client module
jest.mock('../services/websocket/client', () => {
  return {
    WebSocketClient: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      send: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      close: jest.fn()
    }))
  };
});

describe('useWebSocketClient', () => {
  const mockUrl = 'ws://localhost:3002/monitoring';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useWebSocketClient({ url: mockUrl })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful connection', async () => {
    const onConnected = jest.fn();
    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl,
        onConnected
      })
    );

    // Get the client instance and simulate connection
    const client = (result.current as any).clientRef.current;
    const connectHandler = client.on.mock.calls.find((call: MockCall) => call[0] === 'connected')[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.connecting).toBe(false);
    expect(onConnected).toHaveBeenCalled();
  });

  it('should handle disconnection', async () => {
    const onDisconnected = jest.fn();
    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl,
        onDisconnected,
        autoReconnect: true
      })
    );

    // Get the client instance and simulate disconnection
    const client = (result.current as any).clientRef.current;
    const disconnectHandler = client.on.mock.calls.find((call: MockCall) => call[0] === 'disconnected')[1];

    act(() => {
      disconnectHandler();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(true);
    expect(onDisconnected).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl,
        onError
      })
    );

    // Get the client instance and simulate error
    const client = (result.current as any).clientRef.current;
    const errorHandler = client.on.mock.calls.find((call: MockCall) => call[0] === 'error')[1];
    const testError = new Error('Test error');

    act(() => {
      errorHandler(testError);
    });

    expect(result.current.error).toBe(testError);
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should handle message events', async () => {
    const onMessage = jest.fn();
    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl,
        onMessage
      })
    );

    // Get the client instance and simulate message
    const client = (result.current as any).clientRef.current;
    const messageHandler = client.on.mock.calls.find((call: MockCall) => call[0] === 'message')[1];
    const testMessage: WebSocketMessage = {
      event: 'test',
      data: { value: 42 },
      timestamp: new Date().toISOString()
    };

    act(() => {
      messageHandler(testMessage);
    });

    expect(onMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should handle subscriptions', async () => {
    const subscription = {
      events: ['metric'],
      filters: {
        metricNames: ['cpu_usage']
      }
    };

    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl,
        subscription
      })
    );

    const client = (result.current as any).clientRef.current;
    expect(client.subscribe).toHaveBeenCalledWith(subscription);

    // Test subscribing to new events
    act(() => {
      result.current.subscribe({
        events: ['metric', 'alert'],
        filters: {
          metricNames: ['cpu_usage', 'memory_usage']
        }
      });
    });

    expect(client.subscribe).toHaveBeenCalledTimes(2);
  });

  it('should handle unsubscribe', async () => {
    const { result } = renderHook(() =>
      useWebSocketClient({
        url: mockUrl
      })
    );

    const client = (result.current as any).clientRef.current;

    act(() => {
      result.current.unsubscribe();
    });

    expect(client.unsubscribe).toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount, result } = renderHook(() =>
      useWebSocketClient({ url: mockUrl })
    );

    const client = (result.current as any).clientRef.current;
    unmount();

    expect(client.close).toHaveBeenCalled();
  });
});

describe('useWebSocketEvent', () => {
  const mockClient = {
    on: jest.fn(),
    off: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to events', () => {
    const handler = jest.fn();
    renderHook(() =>
      useWebSocketEvent(mockClient as any, 'metric', handler)
    );

    expect(mockClient.on).toHaveBeenCalledWith('metric', handler);
  });

  it('should unsubscribe on unmount', () => {
    const handler = jest.fn();
    const { unmount } = renderHook(() =>
      useWebSocketEvent(mockClient as any, 'metric', handler)
    );

    unmount();

    expect(mockClient.off).toHaveBeenCalledWith('metric', handler);
  });

  it('should handle null client', () => {
    const handler = jest.fn();
    renderHook(() =>
      useWebSocketEvent(null, 'metric', handler)
    );

    expect(mockClient.on).not.toHaveBeenCalled();
    expect(mockClient.off).not.toHaveBeenCalled();
  });
});
