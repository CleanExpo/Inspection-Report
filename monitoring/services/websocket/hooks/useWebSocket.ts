import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../client';
import type {
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketEventMap,
  WebSocketEventHandler
} from '../types';

interface UseWebSocketOptions {
  url: string;
  subscription?: WebSocketSubscription;
  onMessage?: WebSocketEventHandler<WebSocketMessage>;
  onError?: WebSocketEventHandler<Error>;
  onConnected?: () => void;
  onDisconnected?: () => void;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseWebSocketResult {
  connected: boolean;
  connecting: boolean;
  send: (event: string, data: any) => void;
  subscribe: (subscription: WebSocketSubscription) => void;
  unsubscribe: () => void;
  error: Error | null;
}

export function useWebSocket({
  url,
  subscription,
  onMessage,
  onError,
  onConnected,
  onDisconnected,
  autoReconnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 1000
}: UseWebSocketOptions): UseWebSocketResult {
  const clientRef = useRef<WebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize WebSocket client
  useEffect(() => {
    clientRef.current = new WebSocketClient(url, {
      reconnectAttempts: autoReconnect ? reconnectAttempts : 0,
      reconnectDelay
    });

    const client = clientRef.current;

    // Set up event handlers
    client.on('connected', () => {
      setConnected(true);
      setConnecting(false);
      setError(null);
      onConnected?.();

      // Resubscribe if there was a subscription
      if (subscription) {
        client.subscribe(subscription);
      }
    });

    client.on('disconnected', () => {
      setConnected(false);
      setConnecting(autoReconnect);
      onDisconnected?.();
    });

    client.on('error', (err: Error) => {
      setError(err);
      onError?.(err);
    });

    client.on('message', (message: WebSocketMessage) => {
      onMessage?.(message);
    });

    client.on('reconnect_failed', () => {
      setConnecting(false);
      setError(new Error('Failed to reconnect after maximum attempts'));
    });

    // Initial subscription if provided
    if (subscription) {
      client.subscribe(subscription);
    }

    // Cleanup
    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [url]); // Only recreate client if URL changes

  // Update subscription when it changes
  useEffect(() => {
    if (clientRef.current && subscription) {
      clientRef.current.subscribe(subscription);
    }
  }, [subscription]);

  // Send message
  const send = useCallback((event: string, data: any) => {
    if (clientRef.current && connected) {
      clientRef.current.send(event, data);
    }
  }, [connected]);

  // Subscribe to events
  const subscribe = useCallback((newSubscription: WebSocketSubscription) => {
    if (clientRef.current) {
      clientRef.current.subscribe(newSubscription);
    }
  }, []);

  // Unsubscribe from events
  const unsubscribe = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.unsubscribe();
    }
  }, []);

  return {
    connected,
    connecting,
    send,
    subscribe,
    unsubscribe,
    error
  };
}

// Type-safe event subscription hook
export function useWebSocketEvent<K extends keyof WebSocketEventMap>(
  client: WebSocketClient | null,
  event: K,
  handler: WebSocketEventHandler<WebSocketEventMap[K]>
): void {
  useEffect(() => {
    if (client) {
      client.on(event, handler);
      return () => {
        client.off(event, handler);
      };
    }
  }, [client, event, handler]);
}

// Example usage:
/*
function MetricsComponent() {
  const {
    connected,
    connecting,
    error
  } = useWebSocket({
    url: 'ws://localhost:3002/monitoring',
    subscription: {
      events: ['metric'],
      filters: {
        metricNames: ['cpu_usage', 'memory_usage'],
        tags: { environment: 'production' }
      }
    },
    onMessage: (message) => {
      if (message.event === 'metric') {
        // Handle metric update
        console.log('Received metric:', message.data);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  if (connecting) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Disconnected</div>;

  return <div>Connected and receiving metrics...</div>;
}
*/
