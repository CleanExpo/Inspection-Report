import { redis } from '../redis';

export enum RealtimeChannel {
    INSPECTION_UPDATES = 'inspection:updates',
    USER_NOTIFICATIONS = 'user:notifications',
    SYSTEM_EVENTS = 'system:events'
}

export interface RealtimeMessage<T = any> {
    type: string;
    data: T;
    timestamp: number;
}

export class RealtimeService {
    private static instance: RealtimeService;
    private subscribers: Map<string, Set<(message: RealtimeMessage) => void>>;

    private constructor() {
        this.subscribers = new Map();
        this.setupSubscriptions();
    }

    public static getInstance(): RealtimeService {
        if (!RealtimeService.instance) {
            RealtimeService.instance = new RealtimeService();
        }
        return RealtimeService.instance;
    }

    private async setupSubscriptions() {
        // Subscribe to all channels
        Object.values(RealtimeChannel).forEach(async (channel) => {
            await redis.subscribe(channel, (message) => {
                this.handleMessage(channel, message);
            });
        });
    }

    private handleMessage(channel: string, message: string) {
        const parsedMessage: RealtimeMessage = JSON.parse(message);
        const subscribers = this.subscribers.get(channel);
        
        if (subscribers) {
            subscribers.forEach((callback) => {
                try {
                    callback(parsedMessage);
                } catch (error) {
                    console.error(`Error in realtime subscriber callback: ${error}`);
                }
            });
        }
    }

    public subscribe(channel: RealtimeChannel, callback: (message: RealtimeMessage) => void): () => void {
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }

        this.subscribers.get(channel)!.add(callback);

        // Return unsubscribe function
        return () => {
            const subscribers = this.subscribers.get(channel);
            if (subscribers) {
                subscribers.delete(callback);
            }
        };
    }

    public async publish<T>(channel: RealtimeChannel, type: string, data: T): Promise<void> {
        const message: RealtimeMessage<T> = {
            type,
            data,
            timestamp: Date.now()
        };

        await redis.publishUpdate(channel, message);
    }
}

// Export singleton instance
export const realtime = RealtimeService.getInstance();

// Example usage:
/*
// In your API route or server-side code:
import { realtime, RealtimeChannel } from '../lib/realtime';

// Publish an update
await realtime.publish(
    RealtimeChannel.INSPECTION_UPDATES,
    'inspection:created',
    { id: '123', status: 'completed' }
);

// In your React component:
import { useEffect } from 'react';
import { realtime, RealtimeChannel } from '../lib/realtime';

function InspectionList() {
    useEffect(() => {
        // Subscribe to updates
        const unsubscribe = realtime.subscribe(
            RealtimeChannel.INSPECTION_UPDATES,
            (message) => {
                if (message.type === 'inspection:created') {
                    // Update UI with new inspection
                    console.log('New inspection:', message.data);
                }
            }
        );

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    return <div>Inspection List</div>;
}
*/
