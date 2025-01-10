import { EventEmitter } from 'events';

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export interface MetricMessage extends WebSocketMessage {
  event: 'metric';
  data: {
    name: string;
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
  };
}

export interface AlertMessage extends WebSocketMessage {
  event: 'alert';
  data: {
    id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: number;
    metadata?: Record<string, any>;
  };
}

export interface SubscriptionMessage extends WebSocketMessage {
  event: 'subscribe';
  data: {
    events: string[];
    filters?: {
      metricNames?: string[];
      alertSeverities?: string[];
      tags?: Record<string, string>;
    };
  };
}

export interface UnsubscribeMessage extends WebSocketMessage {
  event: 'unsubscribe';
  data: null;
}

export interface ConnectionMessage extends WebSocketMessage {
  event: 'connection';
  data: {
    status: 'connected' | 'disconnected';
  };
}

export interface ErrorMessage extends WebSocketMessage {
  event: 'error';
  data: {
    code: string;
    message: string;
  };
}

export type WebSocketSubscription = SubscriptionMessage['data'];

// WebSocket Server Types
export interface WebSocketServerConfig {
  port: number;
  path: string;
}

// WebSocket Client Types
export interface WebSocketClientConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

// WebSocket Events
export type WebSocketEventMap = {
  message: WebSocketMessage;
  metric: MetricMessage['data'];
  alert: AlertMessage['data'];
  error: Error;
  connected: void;
  disconnected: void;
  reconnect_failed: void;
  test: any; // Added for testing purposes
}

// WebSocket States
export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

// WebSocket Error Codes
export enum WebSocketErrorCode {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
  INVALID_DATA = 1007,
  POLICY_VIOLATION = 1008,
  MESSAGE_TOO_BIG = 1009,
  MISSING_EXTENSION = 1010,
  INTERNAL_ERROR = 1011,
  SERVICE_RESTART = 1012,
  TRY_AGAIN_LATER = 1013,
  BAD_GATEWAY = 1014,
  TLS_HANDSHAKE = 1015
}

// WebSocket Error Types
export interface WebSocketError extends Error {
  code: WebSocketErrorCode;
  reason?: string;
}

// Helper Types
export type WebSocketEventHandler<T = any> = (data: T) => void;
export type WebSocketEventHandlerMap = {
  [K in keyof WebSocketEventMap]: Set<WebSocketEventHandler<WebSocketEventMap[K]>>;
}

// Base WebSocket Interface
export interface IWebSocket extends EventEmitter {
  readyState: number;
  send(data: string): void;
  close(): void;
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
}
