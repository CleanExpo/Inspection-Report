import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

export const createTestContext = (): Context => {
  const ctx = createMockContext();
  return ctx as unknown as Context;
};

// Singleton instance for actual Prisma client (used in non-mocked scenarios)
export const prisma = new PrismaClient();

// Ensure cleanup after tests
if (process.env.NODE_ENV === 'test') {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}
