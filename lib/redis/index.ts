import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

export class RedisService {
    private static instance: RedisService;
    private client: RedisClientType;
    private isConnected: boolean = false;
    private initPromise: Promise<void> | null = null;

    private constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('Redis max reconnection attempts reached');
                        return new Error('Redis max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        this.setupEventHandlers();
        this.initPromise = this.connect();
    }

    private setupEventHandlers() {
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });

        this.client.on('reconnecting', () => {
            console.log('Redis Client Reconnecting');
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    private async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    public async waitForConnection(): Promise<void> {
        if (this.initPromise) {
            await this.initPromise;
        }
    }

    // Cache Management
    async setCacheItem(key: string, value: any, expirationSeconds: number = 3600): Promise<void> {
        await this.waitForConnection();
        await this.client.set(key, JSON.stringify(value), { EX: expirationSeconds });
    }

    async getCacheItem<T>(key: string): Promise<T | null> {
        await this.waitForConnection();
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async invalidateCache(key: string): Promise<void> {
        await this.waitForConnection();
        await this.client.del(key);
    }

    // Session Management
    async setSession(sessionId: string, data: any, expirationSeconds: number = 86400): Promise<void> {
        await this.waitForConnection();
        await this.client.set(`session:${sessionId}`, JSON.stringify(data), { EX: expirationSeconds });
    }

    async getSession<T>(sessionId: string): Promise<T | null> {
        await this.waitForConnection();
        const session = await this.client.get(`session:${sessionId}`);
        return session ? JSON.parse(session) : null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await this.waitForConnection();
        await this.client.del(`session:${sessionId}`);
    }

    // Real-time Updates
    async publishUpdate(channel: string, message: any): Promise<void> {
        await this.waitForConnection();
        await this.client.publish(channel, JSON.stringify(message));
    }

    async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        await this.waitForConnection();
        const subscriber = this.client.duplicate();
        await subscriber.connect();
        await subscriber.subscribe(channel, (message) => {
            callback(JSON.parse(message));
        });
    }

    // Queue Management
    async addToQueue(queueName: string, data: any): Promise<void> {
        await this.waitForConnection();
        await this.client.lPush(`queue:${queueName}`, JSON.stringify(data));
    }

    async processQueue<T>(queueName: string): Promise<T | null> {
        await this.waitForConnection();
        const item = await this.client.rPop(`queue:${queueName}`);
        return item ? JSON.parse(item) : null;
    }

    async getQueueLength(queueName: string): Promise<number> {
        await this.waitForConnection();
        return await this.client.lLen(`queue:${queueName}`);
    }

    // Health Check
    async ping(): Promise<boolean> {
        await this.waitForConnection();
        try {
            const response = await this.client.ping();
            return response === 'PONG';
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }

    // Cleanup
    async cleanup(): Promise<void> {
        await this.waitForConnection();
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// Export a singleton instance
export const redis = RedisService.getInstance();
