import { WebSocketClient } from './client';
import { WebSocketServer } from './server';
import type {
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketClientConfig,
  WebSocketServerConfig,
  WebSocketEventMap,
  WebSocketState,
  WebSocketError,
  WebSocketErrorCode
} from './types';

// Export classes
export { WebSocketClient, WebSocketServer };

// Export types
export type {
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketClientConfig,
  WebSocketServerConfig,
  WebSocketEventMap,
  WebSocketState,
  WebSocketError,
  WebSocketErrorCode
};

// Factory functions
export function createWebSocketClient(url: string, config?: Partial<WebSocketClientConfig>): WebSocketClient {
  return new WebSocketClient(url, config);
}

export function createWebSocketServer(config: WebSocketServerConfig): WebSocketServer {
  return new WebSocketServer(config);
}
