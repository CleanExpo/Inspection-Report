import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { Prisma } from '@prisma/client';

// Configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds

// Create singleton instance
class PrismaClientSingleton {
  private static instance: PrismaClient;
  private static isConnecting: boolean = false;
  private static connectionPromise: Promise<void> | null = null;
  private static connectionAttempts: number = 0;

  private static async createInstance(): Promise<PrismaClient> {
    const prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' }
      ],
      errorFormat: 'pretty',
    });
    
    // Set up logging
    (prisma as any).$on('query', (e: Prisma.QueryEvent) => {
      logger.debug('Prisma Query', {
        query: e.query,
        duration: e.duration,
        timestamp: e.timestamp
      });
    });
    
    (prisma as any).$on('error', (e: any) => {
      logger.error('Prisma Error', {
        message: e.message,
        target: e.target
      });
    });
    
    (prisma as any).$on('warn', (e: any) => {
      logger.warn('Prisma Warning', {
        message: e.message
      });
    });

    // Add connection retry logic with exponential backoff
    prisma.$use(async (params, next) => {
      let retries = 0;
      
      while (retries < MAX_RETRIES) {
        try {
          return await Promise.race([
            next(params),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Query timeout')), CONNECTION_TIMEOUT);
            })
          ]);
        } catch (error) {
          retries++;
          
          if (error instanceof Error && 
             (error.message.includes('Connection pool timeout') || 
              error.message.includes('Query timeout'))) {
            
            if (retries === MAX_RETRIES) {
              logger.error('Max retries reached for database operation', {
                operation: params.model + '.' + params.action,
                attempts: retries
              });
              throw error;
            }

            const delay = Math.min(
              INITIAL_RETRY_DELAY * Math.pow(2, retries - 1),
              MAX_RETRY_DELAY
            );

            logger.warn('Retrying database operation', {
              operation: params.model + '.' + params.action,
              attempt: retries,
              delay
            });

            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw error;
        }
      }
    });

    return prisma;
  }

  static async getInstance(): Promise<PrismaClient> {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = await PrismaClientSingleton.createInstance();
    }
    return PrismaClientSingleton.instance;
  }

  static async connect(): Promise<void> {
    if (this.isConnecting) {
      return this.connectionPromise!;
    }

    this.isConnecting = true;
    this.connectionPromise = (async () => {
      try {
        const client = await this.getInstance();
        await client.$connect();
        this.connectionAttempts = 0;
        logger.info('Database connected successfully');
      } catch (error) {
        this.connectionAttempts++;
        
        logger.error('Database connection failed', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: this.connectionAttempts
        });

        // If we've tried too many times, reset the instance to force a new connection
        if (this.connectionAttempts >= MAX_RETRIES) {
          this.instance = null as any;
          this.connectionAttempts = 0;
        }

        throw error;
      } finally {
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null as any;
      logger.info('Database disconnected');
    }
  }

  // Health check method
  static async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getInstance();
      // Try a simple query to verify connection
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

// Initialize connection
if (process.env.NODE_ENV !== 'test') {
  PrismaClientSingleton.connect().catch(error => {
    logger.error('Initial database connection failed', { error });
  });
}

// Handle cleanup in test environment
if (process.env.NODE_ENV === 'test') {
  beforeAll(async () => {
    await PrismaClientSingleton.connect();
  });

  afterAll(async () => {
    await PrismaClientSingleton.disconnect();
  });
}

// Export singleton instance getter
export const getPrismaClient = () => PrismaClientSingleton.getInstance();

// Export health check
export const checkDatabaseHealth = () => PrismaClientSingleton.healthCheck();
