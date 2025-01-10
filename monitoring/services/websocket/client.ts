import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketClientConfig,
  WebSocketEventMap,
  WebSocketEventHandler,
  WebSocketEventHandlerMap,
  WebSocketState,
  IWebSocket
} from './types';

const DEFAULT_CONFIG: Partial<WebSocketClientConfig> = {
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000
};

export class WebSocketClient extends EventEmitter {
  private ws!: IWebSocket;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private subscription: WebSocketSubscription | null = null;
  private eventHandlers: WebSocketEventHandlerMap = {
    message: new Set(),
    metric: new Set(),
    alert: new Set(),
    error: new Set(),
    connected: new Set(),
    disconnected: new Set(),
    reconnect_failed: new Set(),
    test: new Set()
  };

  constructor(private url: string, config: Partial<WebSocketClientConfig> = {}) {
    super();
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    this.maxReconnectAttempts = fullConfig.reconnectAttempts!;
    this.reconnectDelay = fullConfig.reconnectDelay!;
    this.connect();
  }

  private connect(): void {
    this.ws = new WebSocket(this.url) as unknown as IWebSocket;

    this.ws.on('open', () => {
      this.reconnectAttempts = 0;
      this.emitTyped('connected');

      if (this.subscription) {
        this.subscribe(this.subscription);
      }
    });

    this.ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        this.handleMessage(message);
      } catch (error) {
        this.emitTyped('error', new Error('Failed to parse WebSocket message'));
      }
    });

    this.ws.on('close', () => {
      this.emitTyped('disconnected');
      this.attemptReconnect();
    });

    this.ws.on('error', (error: Error) => {
      this.emitTyped('error', error);
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    if (this.subscription) {
      if (!this.subscription.events.includes(message.event)) {
        return;
      }

      if (this.subscription.filters) {
        const { metricNames, alertSeverities, tags } = this.subscription.filters;

        if (message.event === 'metric' && metricNames) {
          if (!metricNames.includes(message.data.name)) {
            return;
          }
        }

        if (message.event === 'alert' && alertSeverities) {
          if (!alertSeverities.includes(message.data.severity)) {
            return;
          }
        }

        if (tags && message.data.tags) {
          const matches = Object.entries(tags).every(
            ([key, value]) => message.data.tags[key] === value
          );
          if (!matches) {
            return;
          }
        }
      }
    }

    this.emitTyped(message.event as keyof WebSocketEventMap, message.data);
    this.emitTyped('message', message);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emitTyped('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => this.connect(), delay);
  }

  subscribe(subscription: WebSocketSubscription): void {
    this.subscription = subscription;
    if (this.ws.readyState === WebSocketState.OPEN) {
      this.send('subscribe', subscription);
    }
  }

  unsubscribe(): void {
    this.subscription = null;
    if (this.ws.readyState === WebSocketState.OPEN) {
      this.send('unsubscribe', null);
    }
  }

  send(event: string, data: any): void {
    if (this.ws.readyState === WebSocketState.OPEN) {
      this.ws.send(JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }

  close(): void {
    this.maxReconnectAttempts = 0;
    if (this.ws.readyState === WebSocketState.OPEN) {
      this.ws.close();
    }
  }

  private emitTyped<K extends keyof WebSocketEventMap>(
    event: K,
    data?: WebSocketEventMap[K]
  ): boolean {
    return super.emit(event, data);
  }

  override on<K extends keyof WebSocketEventMap>(
    event: K,
    listener: WebSocketEventHandler<WebSocketEventMap[K]>
  ): this {
    this.eventHandlers[event].add(listener);
    return super.on(event, listener);
  }

  override off<K extends keyof WebSocketEventMap>(
    event: K,
    listener: WebSocketEventHandler<WebSocketEventMap[K]>
  ): this {
    this.eventHandlers[event].delete(listener);
    return super.off(event, listener);
  }

  override emit<K extends keyof WebSocketEventMap>(
    event: K,
    data?: WebSocketEventMap[K]
  ): boolean {
    return this.emitTyped(event, data);
  }
}
