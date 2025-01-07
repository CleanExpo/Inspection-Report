import { createMocks } from 'node-mocks-http';
import notifyHandler from '../../../api/webhooks/notify';
import retryHandler from '../../../api/webhooks/retry';
import { prisma } from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  }
}));

global.fetch = jest.fn();

describe('Webhook API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('POST /api/webhooks/notify', () => {
    const mockWebhooks = [
      {
        id: uuidv4(),
        url: 'https://example.com/webhook1',
        secret: 'secret1',
        headers: { 'X-Custom': 'value1' }
      },
      {
        id: uuidv4(),
        url: 'https://example.com/webhook2',
        secret: 'secret2',
        headers: null
      }
    ];

    it('should send notifications to active webhooks', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockWebhooks);
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ received: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ received: true })
        });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          event: 'sync.status.changed',
          payload: {
            clientId: uuidv4(),
            status: 'SYNCED'
          }
        }
      });

      await notifyHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        deliveryIds: expect.arrayContaining([expect.any(String)])
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle webhook delivery failures', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([mockWebhooks[0]]);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          event: 'sync.status.changed',
          payload: { status: 'FAILED' }
        }
      });

      await notifyHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        deliveryIds: expect.arrayContaining([expect.any(String)])
      });

      expect(prisma.$executeRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          strings: expect.arrayContaining([
            expect.stringContaining('INSERT INTO webhook_deliveries')
          ])
        })
      );
    });
  });

  describe('POST /api/webhooks/retry', () => {
    const mockDeliveries = [
      {
        id: uuidv4(),
        webhook_id: uuidv4(),
        event: 'sync.status.changed',
        payload: { status: 'FAILED' },
        retry_count: 1
      }
    ];

    const mockWebhooks = [
      {
        id: mockDeliveries[0].webhook_id,
        url: 'https://example.com/webhook',
        secret: 'secret',
        headers: null
      }
    ];

    it('should retry failed deliveries', async () => {
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce(mockDeliveries)
        .mockResolvedValueOnce(mockWebhooks);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ received: true })
      });

      const { req, res } = createMocks({
        method: 'POST'
      });

      await retryHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        retriedCount: 1
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(prisma.$executeRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          strings: expect.arrayContaining([
            expect.stringContaining('UPDATE webhook_deliveries')
          ])
        })
      );
    });

    it('should handle no deliveries to retry', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        method: 'POST'
      });

      await retryHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        retriedCount: 0
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
