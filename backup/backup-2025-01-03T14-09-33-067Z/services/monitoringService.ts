import { cacheManager } from '../utils/resourceOptimization';

interface PerformanceMetric {
    timestamp: number;
    value: number;
    type: 'memory' | 'cpu' | 'network' | 'fps';
    metadata?: Record<string, any>;
}

interface ResourceAlert {
    type: 'warning' | 'error';
    message: string;
    timestamp: number;
    metric: PerformanceMetric;
    threshold: number;
}

interface MonitoringConfig {
    memoryThreshold: number; // MB
    cpuThreshold: number; // Percentage
    networkLatencyThreshold: number; // ms
    fpsThreshold: number; // Frames per second
    sampleInterval: number; // ms
}

class MonitoringService {
    private static instance: MonitoringService;
    private metrics: PerformanceMetric[] = [];
    private alerts: ResourceAlert[] = [];
    private subscribers: Set<(alert: ResourceAlert) => void> = new Set();
    private isMonitoring: boolean = false;
    private monitoringInterval?: NodeJS.Timeout;

    private config: MonitoringConfig = {
        memoryThreshold: 90, // 90% of available memory
        cpuThreshold: 80, // 80% CPU usage
        networkLatencyThreshold: 1000, // 1 second
        fpsThreshold: 30, // Minimum 30 FPS
        sampleInterval: 5000, // Sample every 5 seconds
    };

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    // Start monitoring system resources
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, this.config.sampleInterval);
    }

    // Stop monitoring
    stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.isMonitoring = false;
    }

    // Collect performance metrics
    private async collectMetrics(): Promise<void> {
        const timestamp = Date.now();

        // Memory usage
        const memory = performance.memory || { usedJSHeapSize: 0, jsHeapSizeLimit: 0 };
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.addMetric({
            timestamp,
            type: 'memory',
            value: memoryUsage,
            metadata: {
                total: memory.jsHeapSizeLimit,
                used: memory.usedJSHeapSize
            }
        });

        // CPU usage (estimated through task timing)
        const cpuStartTime = performance.now();
        await this.simulateLoad();
        const cpuUsage = (performance.now() - cpuStartTime) / 10; // Rough estimate
        this.addMetric({
            timestamp,
            type: 'cpu',
            value: cpuUsage
        });

        // Network latency
        const networkStartTime = performance.now();
        try {
            await fetch('/api/health');
            const latency = performance.now() - networkStartTime;
            this.addMetric({
                timestamp,
                type: 'network',
                value: latency
            });
        } catch (error) {
            console.error('Network monitoring error:', error);
        }

        // FPS monitoring
        if (typeof requestAnimationFrame !== 'undefined') {
            let frameCount = 0;
            let lastTime = performance.now();

            const measureFPS = () => {
                const currentTime = performance.now();
                frameCount++;

                if (currentTime - lastTime >= 1000) {
                    const fps = frameCount;
                    this.addMetric({
                        timestamp,
                        type: 'fps',
                        value: fps
                    });

                    frameCount = 0;
                    lastTime = currentTime;
                }

                requestAnimationFrame(measureFPS);
            };

            requestAnimationFrame(measureFPS);
        }
    }

    // Add a new metric and check thresholds
    private addMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);
        this.checkThresholds(metric);
        this.pruneOldMetrics();
    }

    // Check if metric exceeds thresholds
    private checkThresholds(metric: PerformanceMetric): void {
        let threshold: number;
        let message: string;

        switch (metric.type) {
            case 'memory':
                threshold = this.config.memoryThreshold;
                message = `Memory usage exceeded ${threshold}%`;
                break;
            case 'cpu':
                threshold = this.config.cpuThreshold;
                message = `CPU usage exceeded ${threshold}%`;
                break;
            case 'network':
                threshold = this.config.networkLatencyThreshold;
                message = `Network latency exceeded ${threshold}ms`;
                break;
            case 'fps':
                threshold = this.config.fpsThreshold;
                message = `FPS dropped below ${threshold}`;
                break;
            default:
                return;
        }

        if (this.shouldTriggerAlert(metric, threshold)) {
            const alert: ResourceAlert = {
                type: 'warning',
                message,
                timestamp: Date.now(),
                metric,
                threshold
            };

            this.alerts.push(alert);
            this.notifySubscribers(alert);
        }
    }

    // Determine if an alert should be triggered
    private shouldTriggerAlert(metric: PerformanceMetric, threshold: number): boolean {
        // For FPS, alert if below threshold
        if (metric.type === 'fps') {
            return metric.value < threshold;
        }
        // For other metrics, alert if above threshold
        return metric.value > threshold;
    }

    // Subscribe to alerts
    subscribeToAlerts(callback: (alert: ResourceAlert) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    // Notify all subscribers of new alert
    private notifySubscribers(alert: ResourceAlert): void {
        this.subscribers.forEach(callback => callback(alert));
    }

    // Get recent metrics
    getMetrics(type?: 'memory' | 'cpu' | 'network' | 'fps', duration: number = 3600000): PerformanceMetric[] {
        const cutoff = Date.now() - duration;
        return this.metrics
            .filter(metric => metric.timestamp >= cutoff && (!type || metric.type === type));
    }

    // Get recent alerts
    getAlerts(duration: number = 3600000): ResourceAlert[] {
        const cutoff = Date.now() - duration;
        return this.alerts.filter(alert => alert.timestamp >= cutoff);
    }

    // Remove old metrics to prevent memory bloat
    private pruneOldMetrics(): void {
        const cutoff = Date.now() - 24 * 3600000; // Keep last 24 hours
        this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoff);
        this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoff);
    }

    // Update monitoring configuration
    updateConfig(config: Partial<MonitoringConfig>): void {
        this.config = { ...this.config, ...config };
    }

    // Simulate CPU load for measurement
    private async simulateLoad(): Promise<void> {
        const start = performance.now();
        while (performance.now() - start < 10) {
            // Simulate 10ms of work
            Math.random() * Math.random();
        }
    }

    // Get monitoring insights
    getInsights(): Record<string, any> {
        const lastHour = this.getMetrics(undefined, 3600000);
        const insights = {
            averageMemoryUsage: 0,
            averageCpuUsage: 0,
            averageNetworkLatency: 0,
            averageFps: 0,
            alertFrequency: this.getAlerts(3600000).length,
            recommendations: [] as string[]
        };

        // Calculate averages
        const metricAverages = new Map<string, { sum: number; count: number }>();
        lastHour.forEach(metric => {
            const current = metricAverages.get(metric.type) || { sum: 0, count: 0 };
            metricAverages.set(metric.type, {
                sum: current.sum + metric.value,
                count: current.count + 1
            });
        });

        metricAverages.forEach((value, type) => {
            const average = value.sum / value.count;
            switch (type) {
                case 'memory':
                    insights.averageMemoryUsage = average;
                    if (average > this.config.memoryThreshold * 0.8) {
                        insights.recommendations.push('Consider implementing memory optimization strategies');
                    }
                    break;
                case 'cpu':
                    insights.averageCpuUsage = average;
                    if (average > this.config.cpuThreshold * 0.8) {
                        insights.recommendations.push('Review CPU-intensive operations');
                    }
                    break;
                case 'network':
                    insights.averageNetworkLatency = average;
                    if (average > this.config.networkLatencyThreshold * 0.8) {
                        insights.recommendations.push('Consider implementing request caching');
                    }
                    break;
                case 'fps':
                    insights.averageFps = average;
                    if (average < this.config.fpsThreshold * 1.2) {
                        insights.recommendations.push('Review rendering performance');
                    }
                    break;
            }
        });

        return insights;
    }
}

export const monitoringService = MonitoringService.getInstance();
