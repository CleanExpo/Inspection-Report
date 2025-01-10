import Redis from 'ioredis';
import { performanceMonitor } from '../utils/performance';

// Redis client configuration
const config = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

class RedisClient {
  private static instance: Redis;
  private static isConnecting: boolean = false;
  private static connectionPromise: Promise<void> | null = null;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(config);
      RedisClient.setupEventHandlers();
    }
    return RedisClient.instance;
  }

  private static setupEventHandlers() {
    RedisClient.instance.on('error', (error) => {
      console.error('Redis error:', error);
      performanceMonitor.recordMetric('redis_error', 1, {
        error: error.message
      });
    });

    RedisClient.instance.on('connect', () => {
      console.log('Redis connected');
      performanceMonitor.recordMetric('redis_connect', 1);
    });

    RedisClient.instance.on('ready', () => {
      console.log('Redis ready');
      performanceMonitor.recordMetric('redis_ready', 1);
    });

    RedisClient.instance.on('close', () => {
      console.log('Redis connection closed');
      performanceMonitor.recordMetric('redis_close', 1);
    });

    RedisClient.instance.on('reconnecting', () => {
      console.log('Redis reconnecting');
      performanceMonitor.recordMetric('redis_reconnect', 1);
    });
  }

  static async connect(): Promise<void> {
    if (RedisClient.isConnecting) {
      return RedisClient.connectionPromise;
    }

    RedisClient.isConnecting = true;
    RedisClient.connectionPromise = new Promise((resolve, reject) => {
      const client = RedisClient.getInstance();

      client.on('ready', () => {
        RedisClient.isConnecting = false;
        resolve();
      });

      client.on('error', (error) => {
        RedisClient.isConnecting = false;
        reject(error);
      });
    });

    return RedisClient.connectionPromise;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null as any;
      RedisClient.isConnecting = false;
      RedisClient.connectionPromise = null;
    }
  }
}

// Export Redis instance
export const redis = RedisClient.getInstance();

// Export connect/disconnect methods
export const connectRedis = RedisClient.connect;
export const disconnectRedis = RedisClient.disconnect;
