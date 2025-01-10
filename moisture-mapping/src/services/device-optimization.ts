/**
 * Device optimization service for handling device-specific optimizations
 */
export class DeviceOptimizationService {
    private static instance: DeviceOptimizationService;
    private deviceCapabilities: DeviceCapabilities;
    private optimizationSettings: OptimizationSettings;

    private constructor() {
        this.deviceCapabilities = this.detectDeviceCapabilities();
        this.optimizationSettings = this.generateOptimizationSettings();
    }

    public static getInstance(): DeviceOptimizationService {
        if (!DeviceOptimizationService.instance) {
            DeviceOptimizationService.instance = new DeviceOptimizationService();
        }
        return DeviceOptimizationService.instance;
    }

    /**
     * Get optimized canvas settings for the current device
     */
    public getCanvasSettings(): CanvasOptimizationSettings {
        const { devicePixelRatio = 1 } = window;
        const isLowEndDevice = this.deviceCapabilities.hardwareConcurrency <= 4;
        const isHighResDisplay = devicePixelRatio > 1;

        return {
            pixelRatio: isLowEndDevice ? Math.min(devicePixelRatio, 2) : devicePixelRatio,
            maxCanvasSize: this.calculateMaxCanvasSize(),
            useOffscreenCanvas: this.deviceCapabilities.offscreenCanvas,
            useWebGL: this.deviceCapabilities.webGL && !isLowEndDevice,
            batchSize: this.calculateBatchSize(),
            smoothingEnabled: !isLowEndDevice && isHighResDisplay,
            optimizationLevel: isLowEndDevice ? 'aggressive' : 'balanced'
        };
    }

    /**
     * Get optimized export settings for the current device
     */
    public getExportSettings(): ExportOptimizationSettings {
        const isLowMemory = this.deviceCapabilities.memory?.jsHeapSizeLimit 
            ? this.deviceCapabilities.memory.jsHeapSizeLimit < 2147483648 // 2GB
            : this.deviceCapabilities.hardwareConcurrency <= 4;

        return {
            maxBatchSize: isLowMemory ? 5 : 20,
            compressionLevel: isLowMemory ? 3 : 6,
            useProgressiveLoading: true,
            maxParallelProcessing: this.calculateMaxParallelProcessing(),
            chunkSize: this.calculateChunkSize(),
            memoryManagementStrategy: isLowMemory ? 'aggressive' : 'balanced'
        };
    }

    /**
     * Get optimized rendering settings for the current device
     */
    public getRenderingSettings(): RenderingOptimizationSettings {
        const isLowEndDevice = this.deviceCapabilities.hardwareConcurrency <= 4;
        const isHighResDisplay = window.devicePixelRatio > 1;

        return {
            maxFPS: isLowEndDevice ? 30 : 60,
            useHardwareAcceleration: this.deviceCapabilities.hardwareAcceleration,
            antialiasing: isHighResDisplay && !isLowEndDevice,
            renderQuality: isLowEndDevice ? 'low' : 'high',
            batchDrawCalls: true,
            useRequestAnimationFrame: true,
            optimizeForTouchInput: this.deviceCapabilities.touchDevice
        };
    }

    /**
     * Get memory management settings for the current device
     */
    public getMemorySettings(): MemoryOptimizationSettings {
        const isLowMemory = this.deviceCapabilities.memory?.jsHeapSizeLimit 
            ? this.deviceCapabilities.memory.jsHeapSizeLimit < 2147483648 // 2GB
            : this.deviceCapabilities.hardwareConcurrency <= 4;

        return {
            maxCacheSize: isLowMemory ? 50 * 1024 * 1024 : 200 * 1024 * 1024, // 50MB or 200MB
            aggressiveCleanup: isLowMemory,
            useMemoryPressureRelief: true,
            cacheStrategy: isLowMemory ? 'minimal' : 'balanced',
            maxHistoryStates: isLowMemory ? 10 : 50,
            disposalStrategy: 'lru'
        };
    }

    /**
     * Update optimization settings based on performance metrics
     */
    public updateOptimizationSettings(metrics: PerformanceMetrics): void {
        const { averageFrameTime, memoryUsage, renderTime } = metrics;

        // Adjust batch size based on frame time
        if (averageFrameTime > 16.67) { // 60fps target
            this.optimizationSettings.batchSize = Math.max(
                1,
                this.optimizationSettings.batchSize - 1
            );
        }

        // Adjust memory management strategy
        if (memoryUsage > 0.8) { // 80% memory usage
            this.optimizationSettings.memoryManagementStrategy = 'aggressive';
        }

        // Adjust render quality based on render time
        if (renderTime > 8) { // Half of frame budget
            this.optimizationSettings.renderQuality = 'low';
        }
    }

    private detectDeviceCapabilities(): DeviceCapabilities {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 2,
            deviceMemory: (navigator as any).deviceMemory,
            touchDevice: 'ontouchstart' in window,
            memory: (performance as any).memory,
            offscreenCanvas: 'OffscreenCanvas' in window,
            webGL: this.checkWebGLSupport(),
            hardwareAcceleration: this.checkHardwareAcceleration(),
            devicePixelRatio: window.devicePixelRatio || 1,
            networkType: (navigator as any).connection?.type,
            powerSavingMode: (navigator as any).powerSavingEnabled || false
        };
    }

    private generateOptimizationSettings(): OptimizationSettings {
        const isLowEndDevice = this.deviceCapabilities.hardwareConcurrency <= 4;
        const isHighResDisplay = window.devicePixelRatio > 1;

        return {
            batchSize: this.calculateBatchSize(),
            renderQuality: isLowEndDevice ? 'low' : 'high',
            memoryManagementStrategy: isLowEndDevice ? 'aggressive' : 'balanced',
            useHardwareAcceleration: this.deviceCapabilities.hardwareAcceleration,
            optimizationLevel: isLowEndDevice ? 'aggressive' : 'balanced',
            scalingStrategy: isHighResDisplay ? 'quality' : 'performance'
        };
    }

    private calculateMaxCanvasSize(): { width: number; height: number } {
        const { hardwareConcurrency, memory } = this.deviceCapabilities;
        const baseSize = 4096;
        
        if (memory?.jsHeapSizeLimit) {
            const memoryFactor = memory.jsHeapSizeLimit / 2147483648; // 2GB reference
            return {
                width: Math.min(baseSize * memoryFactor, 8192),
                height: Math.min(baseSize * memoryFactor, 8192)
            };
        }

        // Fallback based on CPU cores
        const sizeFactor = Math.max(0.5, Math.min(hardwareConcurrency / 8, 2));
        return {
            width: baseSize * sizeFactor,
            height: baseSize * sizeFactor
        };
    }

    private calculateBatchSize(): number {
        const { hardwareConcurrency, memory } = this.deviceCapabilities;
        const baseBatchSize = 100;

        if (memory?.jsHeapSizeLimit) {
            const memoryFactor = memory.jsHeapSizeLimit / 2147483648; // 2GB reference
            return Math.floor(baseBatchSize * memoryFactor);
        }

        // Fallback based on CPU cores
        return Math.max(10, Math.min(baseBatchSize, hardwareConcurrency * 25));
    }

    private calculateMaxParallelProcessing(): number {
        return Math.max(1, Math.floor(this.deviceCapabilities.hardwareConcurrency / 2));
    }

    private calculateChunkSize(): number {
        const { memory, hardwareConcurrency } = this.deviceCapabilities;
        const baseChunkSize = 1024 * 1024; // 1MB

        if (memory?.jsHeapSizeLimit) {
            const memoryFactor = memory.jsHeapSizeLimit / 2147483648; // 2GB reference
            return Math.floor(baseChunkSize * memoryFactor);
        }

        // Fallback based on CPU cores
        return baseChunkSize * Math.max(1, hardwareConcurrency / 4);
    }

    private checkWebGLSupport(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }

    private checkHardwareAcceleration(): boolean {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        const prevImageSmoothingEnabled = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = !prevImageSmoothingEnabled;
        const isSupported = ctx.imageSmoothingEnabled !== prevImageSmoothingEnabled;
        ctx.imageSmoothingEnabled = prevImageSmoothingEnabled;

        return isSupported;
    }
}

// Types
interface DeviceCapabilities {
    hardwareConcurrency: number;
    deviceMemory?: number;
    touchDevice: boolean;
    memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
    };
    offscreenCanvas: boolean;
    webGL: boolean;
    hardwareAcceleration: boolean;
    devicePixelRatio: number;
    networkType?: string;
    powerSavingMode: boolean;
}

interface OptimizationSettings {
    batchSize: number;
    renderQuality: 'low' | 'medium' | 'high';
    memoryManagementStrategy: 'minimal' | 'balanced' | 'aggressive';
    useHardwareAcceleration: boolean;
    optimizationLevel: 'minimal' | 'balanced' | 'aggressive';
    scalingStrategy: 'performance' | 'balanced' | 'quality';
}

interface CanvasOptimizationSettings {
    pixelRatio: number;
    maxCanvasSize: { width: number; height: number };
    useOffscreenCanvas: boolean;
    useWebGL: boolean;
    batchSize: number;
    smoothingEnabled: boolean;
    optimizationLevel: 'minimal' | 'balanced' | 'aggressive';
}

interface ExportOptimizationSettings {
    maxBatchSize: number;
    compressionLevel: number;
    useProgressiveLoading: boolean;
    maxParallelProcessing: number;
    chunkSize: number;
    memoryManagementStrategy: 'minimal' | 'balanced' | 'aggressive';
}

interface RenderingOptimizationSettings {
    maxFPS: number;
    useHardwareAcceleration: boolean;
    antialiasing: boolean;
    renderQuality: 'low' | 'medium' | 'high';
    batchDrawCalls: boolean;
    useRequestAnimationFrame: boolean;
    optimizeForTouchInput: boolean;
}

interface MemoryOptimizationSettings {
    maxCacheSize: number;
    aggressiveCleanup: boolean;
    useMemoryPressureRelief: boolean;
    cacheStrategy: 'minimal' | 'balanced' | 'aggressive';
    maxHistoryStates: number;
    disposalStrategy: 'lru' | 'fifo';
}

interface PerformanceMetrics {
    averageFrameTime: number;
    memoryUsage: number;
    renderTime: number;
}
