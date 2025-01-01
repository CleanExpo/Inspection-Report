import { PrismaClient } from '@prisma/client';
import { testConnection, disconnect } from '../../../lib/db/connection';
import { prisma } from '../../../lib/db/client';

describe('Database Connection Performance', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('connection pool', () => {
    test('maintains connection pool within limits', async () => {
      const results = await Promise.all(
        Array(5).fill(null).map(() => testConnection())
      );
      
      results.forEach(result => {
        expect(result.isConnected).toBe(true);
        expect(result.latency).toBeLessThan(1000); // 1 second threshold
      });
    });
  });

  describe('connection latency', () => {
    test('establishes connection within acceptable time', async () => {
      const startTime = Date.now();
      const result = await testConnection();
      const endTime = Date.now();

      expect(result.isConnected).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // 1 second threshold
    });
  });

  describe('resource cleanup', () => {
    test('properly closes connections', async () => {
      const client = new PrismaClient();
      await client.$connect();
      
      const startMemory = process.memoryUsage().heapUsed;
      await disconnect(client);
      const endMemory = process.memoryUsage().heapUsed;
      
      // Memory difference should be minimal after cleanup
      expect(endMemory - startMemory).toBeLessThan(1024 * 1024); // 1MB threshold
    });
  });
});
