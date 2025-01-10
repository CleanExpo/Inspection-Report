import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD
});

redis.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  logger.info('Redis Client Connected');
});

redis.on('ready', () => {
  logger.info('Redis Client Ready');
});

redis.on('reconnecting', () => {
  logger.info('Redis Client Reconnecting');
});

redis.on('end', () => {
  logger.info('Redis Client Connection Ended');
});

// Connect to Redis
redis.connect().catch((err) => {
  logger.error('Redis Connection Error:', err);
});

export { redis };
