import { PrismaClient } from '@prisma/client';
import { testConnection, validateConnection } from '../../../lib/db/connection';
import { prisma } from '../../../lib/db/client';

describe('Basic Database Connection', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('testConnection', () => {
    test('returns successful connection status', async () => {
      const result = await testConnection();
      
      expect(result.isConnected).toBe(true);
      expect(result.latency).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateConnection', () => {
    test('succeeds with valid connection', async () => {
      await expect(validateConnection()).resolves.not.toThrow();
    });
  });
});
