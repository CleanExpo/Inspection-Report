interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    drawCalls: number;
    dirtyRegions: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetrics = {
        fps: 0,
        frameTime: 0,
        drawCalls: 0,
        dirtyRegions: 0
    };
    private frameCount = 0;
    private lastFrameTime = 0;
    private fpsUpdateInterval = 1000; // Update FPS every second
    private lastFpsUpdate = 0;
    private enabled = false;
    private listeners: ((metrics: PerformanceMetrics) => void)[] = [];

    private constructor() {
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = this.lastFrameTime;
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    public enable() {
        this.enabled = true;
        this.reset();
    }

    public disable() {
        this.enabled = false;
    }

    public reset() {
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = this.lastFrameTime;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            dirtyRegions: 0
        };
    }

    public beginFrame() {
        if (!this.enabled) return;

        const now = performance.now();
        this.metrics.frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.frameCount++;

        // Update FPS
        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            this.notifyListeners();
        }
    }

    public recordDrawCall() {
        if (!this.enabled) return;
        this.metrics.drawCalls++;
    }

    public recordDirtyRegion() {
        if (!this.enabled) return;
        this.metrics.dirtyRegions++;
    }

    public getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    public addListener(callback: (metrics: PerformanceMetrics) => void) {
        this.listeners.push(callback);
    }

    public removeListener(callback: (metrics: PerformanceMetrics) => void) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    private notifyListeners() {
        const metrics = this.getMetrics();
        this.listeners.forEach(listener => listener(metrics));
    }
}

// Performance monitoring decorator factory
export function monitorPerformance() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        // Create a new function that wraps the original method
        descriptor.value = function (...args: any[]) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.beginFrame();

            // Call the original method
            const result = originalMethod.apply(this, args);

            // If the result is a Promise, handle it
            if (result && typeof result.then === 'function') {
                return result.then((value: any) => {
                    monitor.recordDrawCall();
                    return value;
                });
            }

            // For synchronous methods
            monitor.recordDrawCall();
            return result;
        };

        // Return the modified descriptor
        return descriptor;
    };
}
