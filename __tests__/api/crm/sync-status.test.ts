import { createMocks } from 'node-mocks-http';
import syncStatusHandler from '../../../api/crm/sync-status';
import updateSyncStatusHandler from '../../../api/crm/update-sync-status';
import { prisma } from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  }
}));

jest.mock('../../../lib/webhooks', () => ({
  sendWebhookNotification: jest.fn().mockResolvedValue(['test-delivery-id']),
}));

describe('CRM Sync Status API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/crm/sync-status', () => {
    it('should return sync status counts', async () => {
      const mockCounts = [
        { count: '10' },
        { count: '5' },
        { count: '2' },
        { count: '3' },
        { count: '0' },
        { crm_last_sync: new Date() }
      ];

      (prisma.$queryRaw as jest.Mock).mockImplementation((query: any) => {
        if (query.strings[0].includes('COUNT(*)')) {
          return [mockCounts[0]];
        }
        return [mockCounts[5]];
      });

      const { req, res } = createMocks({
        method: 'GET',
      });

      await syncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        totalClients: 10,
        syncedClients: 5,
        pendingClients: 2,
        failedClients: 3,
        needsUpdateClients: 0,
        lastSyncTime: expect.any(String)
      });
    });

    it('should handle errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
      });

      await syncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
        totalClients: 0,
        syncedClients: 0,
        pendingClients: 0,
        failedClients: 0,
        needsUpdateClients: 0
      });
    });
  });

  describe('POST /api/crm/update-sync-status', () => {
    const validClientId = uuidv4();

    it('should update sync status successfully', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { crm_sync_status: 'PENDING' }
      ]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          clientId: validClientId,
          status: 'SYNCED'
        }
      });

      await updateSyncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true
      });

      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2); // Update + History
    });

    it('should validate request payload', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          clientId: 'invalid-uuid',
          status: 'INVALID_STATUS'
        }
      });

      await updateSyncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Validation failed',
        details: {
          clientId: 'Invalid UUID format',
          status: expect.stringContaining('Status must be one of:')
        }
      });
    });

    it('should handle non-existent client', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          clientId: validClientId,
          status: 'SYNCED'
        }
      });

      await updateSyncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Client not found'
      });
    });

    it('should handle database errors', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          clientId: validClientId,
          status: 'SYNCED'
        }
      });

      await updateSyncStatusHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Internal server error'
      });
    });
  });
});
