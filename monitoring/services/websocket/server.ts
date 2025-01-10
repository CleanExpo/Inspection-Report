import { Server as WSServer } from 'ws';
import { EventEmitter } from 'events';
import {
  WebSocketMessage,
  WebSocketServerConfig,
  WebSocketEventMap,
  WebSocketEventHandler,
  WebSocketEventHandlerMap,
  WebSocketState,
  IWebSocket
} from './types';

export class WebSocketServer extends EventEmitter {
  private wss: WSServer;
  private clients: Set<IWebSocket> = new Set();
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

  constructor(config: WebSocketServerConfig) {
    super();
    this.wss = new WSServer({
      port: config.port,
      path: config.path
    });

    this.setupServerEvents();
  }

  private setupServerEvents(): void {
    this.wss.on('connection', (ws: IWebSocket) => {
      this.handleConnection(ws);
    });

    this.wss.on('error', (error: Error) => {
      this.emitTyped('error', error);
    });
  }

  private handleConnection(ws: IWebSocket): void {
    this.clients.add(ws);
    this.emitTyped('connected');

    // Send connection confirmation
    this.sendToClient(ws, {
      event: 'connection',
      data: { status: 'connected' },
      timestamp: new Date().toISOString()
    });

    ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        this.handleMessage(ws, message);
      } catch (error) {
        this.emitTyped('error', new Error('Failed to parse WebSocket message'));
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
      this.emitTyped('disconnected');
    });

    ws.on('error', (error: Error) => {
      this.emitTyped('error', error);
      this.clients.delete(ws);
    });
  }

  private handleMessage(ws: IWebSocket, message: WebSocketMessage): void {
    // Handle subscription messages
    if (message.event === 'subscribe') {
      // Store subscription info if needed
      this.emitTyped('message', message);
      return;
    }

    // Handle unsubscribe messages
    if (message.event === 'unsubscribe') {
      // Clear subscription info if needed
      this.emitTyped('message', message);
      return;
    }

    // Emit the typed event and the general message event
    this.emitTyped(message.event as keyof WebSocketEventMap, message.data);
    this.emitTyped('message', message);
  }

  broadcast(event: string, data: any): void {
    const message: WebSocketMessage = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    this.clients.forEach(client => {
      if (client.readyState === WebSocketState.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  private sendToClient(client: IWebSocket, message: WebSocketMessage): void {
    if (client.readyState === WebSocketState.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  getConnections(): number {
    return this.clients.size;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss.close(err => {
        if (err) {
          reject(err);
        } else {
          this.clients.clear();
          resolve();
        }
      });
    });
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
