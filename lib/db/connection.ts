import { PrismaClient } from '@prisma/client';
import { prisma } from './client';

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Tests database connection and returns connection status
 */
export async function testConnection(client: PrismaClient = prisma): Promise<{
  isConnected: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Test query to verify connection
    await client.$queryRaw`SELECT 1`;
    
    return {
      isConnected: true,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      isConnected: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Validates database connection with retries
 */
export async function validateConnection(
  retries = 3,
  delay = 1000,
  client: PrismaClient = prisma
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { isConnected, error } = await testConnection(client);
    
    if (isConnected) {
      return;
    }

    if (attempt === retries) {
      throw new DatabaseConnectionError(
        `Failed to connect to database after ${retries} attempts. Last error: ${error}`
      );
    }

    // Wait before next retry
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Gracefully handles database disconnection
 */
export async function disconnect(client: PrismaClient = prisma): Promise<void> {
  if (!client) {
    throw new DatabaseConnectionError('No client provided for disconnection');
  }

  try {
    // Test connection before attempting disconnect
    const { isConnected } = await testConnection(client);
    if (!isConnected) {
      throw new DatabaseConnectionError('Client is already disconnected');
    }
    await client.$disconnect();
  } catch (error: any) {
    console.error('Error disconnecting from database:', error.message);
    throw new DatabaseConnectionError(
      error instanceof DatabaseConnectionError 
        ? error.message 
        : `Failed to disconnect: ${error.message}`
    );
  }
}
