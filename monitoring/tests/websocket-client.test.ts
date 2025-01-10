import { WebSocketClient } from '../services/websocket/client';
import { MockWebSocket, generateMetric, generateAlert, wait } from './test-utils';
import type { WebSocketMessage } from '../services/websocket/types';

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  const mockUrl = 'ws://localhost:3002/monitoring';

  beforeEach(() => {
    client = new WebSocketClient(mockUrl);
  });

  afterEach(() => {
    client.close();
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      const onConnected = jest.fn();
      client.on('connected', onConnected);

      await wait(10);
      expect(onConnected).toHaveBeenCalled();
    });

    it('should handle disconnection', async () => {
      const onDisconnected = jest.fn();
      client.on('disconnected', onDisconnected);

      await wait(10); // Wait for initial connection
      client.close();
      await wait(10);

      expect(onDisconnected).toHaveBeenCalled();
    });

    it('should attempt reconnection on disconnect', async () => {
      const onConnected = jest.fn();
      client.on('connected', onConnected);

      await wait(10); // Wait for initial connection
      expect(onConnected).toHaveBeenCalledTimes(1);

      // Simulate disconnect
      (client as any).ws.emit('close');
      await wait(10);

      // Should attempt reconnect
      expect(onConnected).toHaveBeenCalledTimes(2);
    });

    it('should handle connection errors', async () => {
      const onError = jest.fn();
      client.on('error', onError);

      await wait(10); // Wait for initial connection
      (client as any).ws.emit('error', new Error('Test error'));

      expect(onError).toHaveBeenCalled();
    });

    it('should handle reconnection failure', async () => {
      const onReconnectFailed = jest.fn();
      client.on('reconnect_failed', onReconnectFailed);

      // Configure client with low reconnect attempts
      client = new WebSocketClient(mockUrl, {
        reconnectAttempts: 1,
        reconnectDelay: 10
      });

      await wait(10); // Wait for initial connection
      (client as any).ws.emit('close');
      await wait(50); // Wait for reconnect attempts

      expect(onReconnectFailed).toHaveBeenCalled();
    });
  });

  describe('Subscription Management', () => {
    it('should handle subscriptions', async () => {
      const subscription = {
        events: ['metric'],
        filters: {
          metricNames: ['cpu_usage']
        }
      };

      await wait(10); // Wait for connection
      client.subscribe(subscription);

      expect((client as any).subscription).toEqual(subscription);
    });

    it('should handle unsubscribe', async () => {
      const subscription = {
        events: ['metric'],
        filters: {
          metricNames: ['cpu_usage']
        }
      };

      await wait(10); // Wait for connection
      client.subscribe(subscription);
      client.unsubscribe();

      expect((client as any).subscription).toBeNull();
    });

    it('should filter messages based on subscription', async () => {
      const onMetric = jest.fn();
      client.on('metric', onMetric);

      const subscription = {
        events: ['metric'],
        filters: {
          metricNames: ['cpu_usage']
        }
      };

      await wait(10); // Wait for connection
      client.subscribe(subscription);

      // Send matching metric
      const matchingMetric = generateMetric({ name: 'cpu_usage' });
      const matchingMessage: WebSocketMessage = {
        event: 'metric',
        data: matchingMetric,
        timestamp: new Date().toISOString()
      };
      (client as any).ws.emit('message', { data: JSON.stringify(matchingMessage) });

      // Send non-matching metric
      const nonMatchingMetric = generateMetric({ name: 'memory_usage' });
      const nonMatchingMessage: WebSocketMessage = {
        event: 'metric',
        data: nonMatchingMetric,
        timestamp: new Date().toISOString()
      };
      (client as any).ws.emit('message', { data: JSON.stringify(nonMatchingMessage) });

      expect(onMetric).toHaveBeenCalledTimes(1);
      expect(onMetric).toHaveBeenCalledWith(matchingMetric);
    });
  });

  describe('Message Handling', () => {
    it('should handle metric messages', async () => {
      const onMetric = jest.fn();
      client.on('metric', onMetric);

      await wait(10); // Wait for connection
      const metric = generateMetric();
      const message: WebSocketMessage = {
        event: 'metric',
        data: metric,
        timestamp: new Date().toISOString()
      };
      (client as any).ws.emit('message', { data: JSON.stringify(message) });

      expect(onMetric).toHaveBeenCalledWith(metric);
    });

    it('should handle alert messages', async () => {
      const onAlert = jest.fn();
      client.on('alert', onAlert);

      await wait(10); // Wait for connection
      const alert = generateAlert();
      const message: WebSocketMessage = {
        event: 'alert',
        data: alert,
        timestamp: new Date().toISOString()
      };
      (client as any).ws.emit('message', { data: JSON.stringify(message) });

      expect(onAlert).toHaveBeenCalledWith(alert);
    });

    it('should handle invalid messages', async () => {
      const onError = jest.fn();
      client.on('error', onError);

      await wait(10); // Wait for connection
      (client as any).ws.emit('message', { data: 'invalid json' });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should send messages when connected', async () => {
      await wait(10); // Wait for connection
      const sendSpy = jest.spyOn((client as any).ws, 'send');

      const data = { test: 'data' };
      client.send('test', data);

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0] as string);
      expect(sentData.event).toBe('test');
      expect(sentData.data).toEqual(data);
    });

    it('should not send messages when disconnected', async () => {
      await wait(10); // Wait for connection
      const sendSpy = jest.spyOn((client as any).ws, 'send');

      client.close();
      client.send('test', { test: 'data' });

      expect(sendSpy).not.toHaveBeenCalled();
    });
  });
});
