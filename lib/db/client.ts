import { PrismaClient } from '@prisma/client';
import { loggingMiddleware, performanceMiddleware } from './middleware';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Apply middlewares
  client.$use(loggingMiddleware);
  client.$use(performanceMiddleware);

  return client;
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
