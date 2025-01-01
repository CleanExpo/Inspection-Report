import { PrismaClient } from '@prisma/client';
import { testConnection, validateConnection, disconnect, DatabaseConnectionError } from '../../../lib/db/connection';

describe('Database Connection Error Handling', () => {
  describe('testConnection errors', () => {
    test('handles connection failures', async () => {
      const invalidClient = new PrismaClient({
        datasources: {
          db: {
            url: 'postgresql://invalid:5432/fake'
          }
        }
      });

      const result = await testConnection(invalidClient);

      expect(result.isConnected).toBe(false);
      expect(result.latency).toBeDefined();
      expect(result.error).toBeDefined();

      await invalidClient.$disconnect().catch(() => {});
    });
  });

  describe('validateConnection errors', () => {
    test('throws error after max retries', async () => {
      const invalidClient = new PrismaClient({
        datasources: {
          db: {
            url: 'postgresql://invalid:5432/fake'
          }
        }
      });

      await expect(validateConnection(2, 100, invalidClient))
        .rejects.toThrow(DatabaseConnectionError);

      await invalidClient.$disconnect().catch(() => {});
    });
  });

  describe('disconnect errors', () => {
    test('handles disconnect errors gracefully', async () => {
      // Test with null client to trigger error
      await expect(disconnect(null as unknown as PrismaClient))
        .rejects.toThrow('No client provided for disconnection');
      
      // Test with invalid client to simulate disconnected state
      const invalidClient = new PrismaClient({
        datasources: {
          db: {
            url: 'postgresql://invalid:5432/fake'
          }
        }
      });

      await expect(disconnect(invalidClient))
        .rejects.toThrow(DatabaseConnectionError);

      // Clean up
      await invalidClient.$disconnect().catch(() => {});
    });
  });
});
