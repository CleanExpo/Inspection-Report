import { WebSocketServer } from '../services/websocket/server';
import { MockWebSocket, generateMetric, generateAlert, wait } from './test-utils';

describe('WebSocketServer', () => {
  let server: WebSocketServer;
  let mockSocket: MockWebSocket;

  beforeEach(() => {
    server = new WebSocketServer({
      port: 3002,
      path: '/monitoring'
    });
    mockSocket = new MockWebSocket('ws://localhost:3002/monitoring');
  });

  afterEach(async () => {
    await server.close();
  });

  describe('Connection Management', () => {
    it('should handle new connections', async () => {
      const onConnected = jest.fn();
      server.on('connected', onConnected);

      // Simulate connection
      server['handleConnection'](mockSocket);
      await wait(10);

      expect(onConnected).toHaveBeenCalled();
      expect(server.getConnections()).toBe(1);
    });

    it('should handle disconnections', async () => {
      const onDisconnected = jest.fn();
      server.on('disconnected', onDisconnected);

      // Simulate connection and disconnection
      server['handleConnection'](mockSocket);
      mockSocket.close();
      await wait(10);

      expect(onDisconnected).toHaveBeenCalled();
      expect(server.getConnections()).toBe(0);
    });

    it('should handle connection errors', async () => {
      const onError = jest.fn();
      server.on('error', onError);

      // Simulate connection and error
      server['handleConnection'](mockSocket);
      mockSocket.emit('error', new Error('Test error'));
      await wait(10);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      server['handleConnection'](mockSocket);
    });

    it('should handle subscription messages', async () => {
      const onMessage = jest.fn();
      server.on('message', onMessage);

      const subscription = {
        events: ['metric'],
        filters: {
          metricNames: ['cpu_usage']
        }
      };

      mockSocket.emit('message', JSON.stringify({
        event: 'subscribe',
        data: subscription,
        timestamp: new Date().toISOString()
      }));

      await wait(10);
      expect(onMessage).toHaveBeenCalled();
    });

    it('should handle unsubscribe messages', async () => {
      const onMessage = jest.fn();
      server.on('message', onMessage);

      mockSocket.emit('message', JSON.stringify({
        event: 'unsubscribe',
        data: null,
        timestamp: new Date().toISOString()
      }));

      await wait(10);
      expect(onMessage).toHaveBeenCalled();
    });

    it('should handle invalid messages', async () => {
      const onError = jest.fn();
      server.on('error', onError);

      mockSocket.emit('message', 'invalid json');
      await wait(10);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Broadcasting', () => {
    beforeEach(() => {
      server['handleConnection'](mockSocket);
    });

    it('should broadcast metrics to all connected clients', async () => {
      const onMessage = jest.fn();
      mockSocket.on('message', onMessage);

      const metric = generateMetric();
      server.broadcast('metric', metric);
      await wait(10);

      expect(onMessage).toHaveBeenCalled();
      const message = JSON.parse(onMessage.mock.calls[0][0].data);
      expect(message.event).toBe('metric');
      expect(message.data).toEqual(metric);
    });

    it('should broadcast alerts to all connected clients', async () => {
      const onMessage = jest.fn();
      mockSocket.on('message', onMessage);

      const alert = generateAlert();
      server.broadcast('alert', alert);
      await wait(10);

      expect(onMessage).toHaveBeenCalled();
      const message = JSON.parse(onMessage.mock.calls[0][0].data);
      expect(message.event).toBe('alert');
      expect(message.data).toEqual(alert);
    });

    it('should not broadcast to disconnected clients', async () => {
      const onMessage = jest.fn();
      mockSocket.on('message', onMessage);

      mockSocket.close();
      await wait(10);

      const metric = generateMetric();
      server.broadcast('metric', metric);
      await wait(10);

      expect(onMessage).not.toHaveBeenCalled();
    });
  });

  describe('Server Management', () => {
    it('should close all connections when server closes', async () => {
      const onClose = jest.fn();
      mockSocket.on('close', onClose);

      server['handleConnection'](mockSocket);
      await server.close();
      await wait(10);

      expect(onClose).toHaveBeenCalled();
      expect(server.getConnections()).toBe(0);
    });
  });
});
