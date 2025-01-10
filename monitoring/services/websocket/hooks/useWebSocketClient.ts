import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../client';
import type { WebSocketMessage, WebSocketSubscription, WebSocketEventMap } from '../types';

export interface UseWebSocketClientOptions {
  url: string;
  subscription?: WebSocketSubscription;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseWebSocketClientResult {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  send: (event: string, data: any) => void;
  subscribe: (subscription: WebSocketSubscription) => void;
  unsubscribe: () => void;
}

export function useWebSocketClient({
  url,
  subscription,
  onMessage,
  onError,
  onConnected,
  onDisconnected,
  autoReconnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 1000
}: UseWebSocketClientOptions): UseWebSocketClientResult {
  const clientRef = useRef<WebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize WebSocket client
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
    error,
    send,
    subscribe,
    unsubscribe
  };
}

// Type-safe event subscription hook
export function useWebSocketEvent<K extends keyof WebSocketEventMap>(
  client: WebSocketClient | null,
  event: K,
  handler: (data: WebSocketEventMap[K]) => void
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
