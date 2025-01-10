/**
 * Performance monitoring service for tracking and analyzing performance metrics
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private activeOperations: Map<string, OperationContext> = new Map();
    private memorySnapshots: MemorySnapshot[] = [];
    private readonly MAX_SNAPSHOTS = 100;

    private constructor() {
        // Initialize performance observer for long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordLongTask(entry);
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Start monitoring a new operation
     */
    public startOperation(
        operationId: string,
        type: OperationType,
        metadata?: Record<string, any>
    ): void {
        const startTime = performance.now();
        const memoryStart = this.getMemoryInfo();

        this.activeOperations.set(operationId, {
            type,
            startTime,
            memoryStart,
            metadata
        });

        // Take memory snapshot at start
        this.takeMemorySnapshot(operationId, 'start');
    }

    /**
     * End monitoring for an operation and record metrics
     */
    public endOperation(operationId: string): OperationMetrics | null {
        const context = this.activeOperations.get(operationId);
        if (!context) return null;

        const endTime = performance.now();
        const memoryEnd = this.getMemoryInfo();
        this.activeOperations.delete(operationId);

        // Take memory snapshot at end
        this.takeMemorySnapshot(operationId, 'end');

        const duration = endTime - context.startTime;
        const memoryDelta = memoryEnd ? {
            usedJSHeapSize: memoryEnd.usedJSHeapSize - (context.memoryStart?.usedJSHeapSize || 0),
            totalJSHeapSize: memoryEnd.totalJSHeapSize - (context.memoryStart?.totalJSHeapSize || 0)
        } : undefined;

        const metric: PerformanceMetric = {
            operationId,
            type: context.type,
            duration,
            timestamp: new Date().toISOString(),
            memoryDelta,
            metadata: context.metadata
        };

        // Store metric
        const metrics = this.metrics.get(context.type) || [];
        metrics.push(metric);
        this.metrics.set(context.type, metrics);

        return {
            duration,
            memoryDelta,
            recommendations: this.generateRecommendations(metric)
        };
    }

    /**
     * Record progress for ongoing operation
     */
    public recordProgress(
        operationId: string,
        progress: number,
        checkpoint?: string
    ): void {
        const context = this.activeOperations.get(operationId);
        if (!context) return;

        const currentTime = performance.now();
        const elapsed = currentTime - context.startTime;

        if (!context.progressPoints) {
            context.progressPoints = [];
        }

        context.progressPoints.push({
            progress,
            elapsed,
            checkpoint
        });

        // Take intermediate memory snapshot
        if (checkpoint) {
            this.takeMemorySnapshot(operationId, checkpoint);
        }
    }

    /**
     * Get performance metrics for operation type
     */
    public getMetrics(type: OperationType): PerformanceMetric[] {
        return this.metrics.get(type) || [];
    }

    /**
     * Get performance analysis for operation type
     */
    public analyzePerformance(type: OperationType): PerformanceAnalysis {
        const metrics = this.getMetrics(type);
        if (metrics.length === 0) {
            return {
                averageDuration: 0,
                maxDuration: 0,
                minDuration: 0,
                memoryTrend: 'stable',
                recommendations: []
            };
        }

        const durations = metrics.map(m => m.duration);
        const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const maxDuration = Math.max(...durations);
        const minDuration = Math.min(...durations);

        // Analyze memory trend
        const memoryTrend = this.analyzeMemoryTrend(metrics);

        return {
            averageDuration,
            maxDuration,
            minDuration,
            memoryTrend,
            recommendations: this.generateRecommendations({
                type,
                duration: averageDuration,
                memoryDelta: this.calculateAverageMemoryDelta(metrics)
            })
        };
    }

    /**
     * Clear stored metrics
     */
    public clearMetrics(): void {
        this.metrics.clear();
        this.memorySnapshots = [];
    }

    private recordLongTask(entry: PerformanceEntry): void {
        // Record long tasks for analysis
        const activeTasks = Array.from(this.activeOperations.entries());
        activeTasks.forEach(([id, context]) => {
            if (!context.longTasks) {
                context.longTasks = [];
            }
            context.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
            });
        });
    }

    private takeMemorySnapshot(operationId: string, label: string): void {
        const memory = this.getMemoryInfo();
        if (!memory) return;

        this.memorySnapshots.push({
            operationId,
            label,
            timestamp: new Date().toISOString(),
            memory
        });

        // Keep only recent snapshots
        if (this.memorySnapshots.length > this.MAX_SNAPSHOTS) {
            this.memorySnapshots.shift();
        }
    }

    private getMemoryInfo(): MemoryInfo | undefined {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            };
        }
        return undefined;
    }

    private analyzeMemoryTrend(metrics: PerformanceMetric[]): MemoryTrend {
        const deltas = metrics
            .filter(m => m.memoryDelta)
            .map(m => m.memoryDelta!.usedJSHeapSize);

        if (deltas.length < 2) return 'stable';

        const trend = deltas.reduce((acc, curr, i) => {
            if (i === 0) return 0;
            return acc + (curr - deltas[i - 1]);
        }, 0) / (deltas.length - 1);

        if (trend > 1000000) return 'increasing'; // 1MB threshold
        if (trend < -1000000) return 'decreasing';
        return 'stable';
    }

    private calculateAverageMemoryDelta(metrics: PerformanceMetric[]): MemoryDelta | undefined {
        const validDeltas = metrics.filter(m => m.memoryDelta);
        if (validDeltas.length === 0) return undefined;

        return {
            usedJSHeapSize: validDeltas.reduce((acc, m) => acc + m.memoryDelta!.usedJSHeapSize, 0) / validDeltas.length,
            totalJSHeapSize: validDeltas.reduce((acc, m) => acc + m.memoryDelta!.totalJSHeapSize, 0) / validDeltas.length
        };
    }

    private generateRecommendations(metric: Pick<PerformanceMetric, 'type' | 'duration' | 'memoryDelta'>): string[] {
        const recommendations: string[] = [];

        // Duration-based recommendations
        if (metric.duration > 5000) { // 5 seconds
            recommendations.push('Consider implementing batch processing in smaller chunks');
            recommendations.push('Add progress indicators for better user experience');
        }

        // Memory-based recommendations
        if (metric.memoryDelta && metric.memoryDelta.usedJSHeapSize > 50000000) { // 50MB
            recommendations.push('High memory usage detected. Consider implementing memory cleanup');
            recommendations.push('Process large datasets in smaller batches');
        }

        // Operation-specific recommendations
        switch (metric.type) {
            case 'batchExport':
                if (metric.duration > 2000) {
                    recommendations.push('Consider implementing web workers for batch processing');
                    recommendations.push('Optimize file compression settings');
                }
                break;
            case 'imageProcessing':
                if (metric.duration > 1000) {
                    recommendations.push('Consider using lower resolution for preview images');
                    recommendations.push('Implement progressive image loading');
                }
                break;
        }

        return recommendations;
    }
}

// Types
export type OperationType = 'batchExport' | 'imageProcessing' | 'dataSync';
export type MemoryTrend = 'increasing' | 'decreasing' | 'stable';

interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface MemoryDelta {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
}

interface MemorySnapshot {
    operationId: string;
    label: string;
    timestamp: string;
    memory: MemoryInfo;
}

interface ProgressPoint {
    progress: number;
    elapsed: number;
    checkpoint?: string;
}

interface LongTask {
    duration: number;
    startTime: number;
    name: string;
}

interface OperationContext {
    type: OperationType;
    startTime: number;
    memoryStart?: MemoryInfo;
    metadata?: Record<string, any>;
    progressPoints?: ProgressPoint[];
    longTasks?: LongTask[];
}

interface PerformanceMetric {
    operationId: string;
    type: OperationType;
    duration: number;
    timestamp: string;
    memoryDelta?: MemoryDelta;
    metadata?: Record<string, any>;
}

interface OperationMetrics {
    duration: number;
    memoryDelta?: MemoryDelta;
    recommendations: string[];
}

interface PerformanceAnalysis {
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
    memoryTrend: MemoryTrend;
    recommendations: string[];
}
