import { redis } from '../redis';

export enum QueueName {
    REPORT_GENERATION = 'queue:report-generation',
    EMAIL_NOTIFICATIONS = 'queue:email-notifications',
    DATA_EXPORTS = 'queue:data-exports',
    IMAGE_PROCESSING = 'queue:image-processing'
}

export interface QueueJob<T = any> {
    id: string;
    type: string;
    data: T;
    priority: number;
    attempts: number;
    maxAttempts: number;
    createdAt: number;
    processedAt?: number;
    error?: string;
}

export class QueueService {
    private static instance: QueueService;
    private processors: Map<string, (job: QueueJob) => Promise<void>>;
    private isProcessing: Map<string, boolean>;
    private processingIntervals: Map<string, number>;

    private constructor() {
        this.processors = new Map();
        this.isProcessing = new Map();
        this.processingIntervals = new Map();
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public async addJob<T>(
        queue: QueueName,
        type: string,
        data: T,
        options: {
            priority?: number;
            maxAttempts?: number;
        } = {}
    ): Promise<string> {
        const job: QueueJob<T> = {
            id: `${queue}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            priority: options.priority || 0,
            attempts: 0,
            maxAttempts: options.maxAttempts || 3,
            createdAt: Date.now()
        };

        await redis.addToQueue(queue, job);
        return job.id;
    }

    public registerProcessor(
        queue: QueueName,
        processor: (job: QueueJob) => Promise<void>,
        options: {
            interval?: number; // Processing interval in milliseconds
            concurrency?: number; // Number of jobs to process concurrently
        } = {}
    ): void {
        const { interval = 1000, concurrency = 1 } = options;

        this.processors.set(queue, processor);
        this.startProcessing(queue, interval, concurrency);
    }

    private async processJob(queue: QueueName, job: QueueJob): Promise<boolean> {
        const processor = this.processors.get(queue);
        if (!processor) {
            console.error(`No processor registered for queue: ${queue}`);
            return false;
        }

        try {
            job.attempts += 1;
            await processor(job);
            job.processedAt = Date.now();
            return true;
        } catch (error) {
            job.error = error instanceof Error ? error.message : String(error);
            console.error(`Error processing job ${job.id}:`, error);

            // Retry if attempts remain
            if (job.attempts < job.maxAttempts) {
                await redis.addToQueue(queue, job);
                return false;
            }

            return true; // Job completed (with error) if max attempts reached
        }
    }

    private async startProcessing(queue: QueueName, interval: number, concurrency: number): Promise<void> {
        if (this.isProcessing.get(queue)) {
            return;
        }

        this.isProcessing.set(queue, true);

        const processInterval = setInterval(async () => {
            try {
                const jobs: QueueJob[] = [];
                for (let i = 0; i < concurrency; i++) {
                    const job = await redis.processQueue<QueueJob>(queue);
                    if (job) {
                        jobs.push(job);
                    }
                }

                await Promise.all(
                    jobs.map(job => this.processJob(queue, job))
                );
            } catch (error) {
                console.error(`Error processing queue ${queue}:`, error);
            }
        }, interval);

        this.processingIntervals.set(queue, processInterval as unknown as number);
    }

    public stopProcessing(queue: QueueName): void {
        const interval = this.processingIntervals.get(queue);
        if (interval) {
            clearInterval(interval);
            this.processingIntervals.delete(queue);
        }
        this.isProcessing.set(queue, false);
    }

    public async getQueueLength(queue: QueueName): Promise<number> {
        return await redis.getQueueLength(queue);
    }
}

// Export singleton instance
export const queue = QueueService.getInstance();
