/**
 * Device Support Service
 * Handles device-specific optimizations, hardware acceleration, and input methods
 */

interface DeviceProfile {
    id: string;
    platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
    browser: string;
    screenSize: {
        width: number;
        height: number;
        pixelRatio: number;
    };
    capabilities: {
        touchscreen: boolean;
        multiTouch: boolean;
        stylus: boolean;
        keyboard: boolean;
        mouse: boolean;
        accelerometer: boolean;
        gyroscope: boolean;
        webgl: boolean;
        webgl2: boolean;
    };
    performance: {
        tier: 'low' | 'medium' | 'high';
        memory: number; // MB
        processorCores: number;
    };
}

class DeviceSupportService {
    private static instance: DeviceSupportService;
    private currentProfile: DeviceProfile | null = null;
    private hardwareAcceleration: boolean = true;
    private inputHandlers: Map<string, (event: any) => void> = new Map();

    private constructor() {
        this.detectDeviceProfile();
        this.setupHardwareAcceleration();
        this.setupInputHandlers();
    }

    static getInstance(): DeviceSupportService {
        if (!DeviceSupportService.instance) {
            DeviceSupportService.instance = new DeviceSupportService();
        }
        return DeviceSupportService.instance;
    }

    // Detect and set device profile
    private detectDeviceProfile(): void {
        const ua = navigator.userAgent;
        const platform = this.detectPlatform();
        
        this.currentProfile = {
            id: this.generateDeviceId(),
            platform,
            browser: this.detectBrowser(),
            screenSize: {
                width: window.screen.width,
                height: window.screen.height,
                pixelRatio: window.devicePixelRatio
            },
            capabilities: {
                touchscreen: 'ontouchstart' in window,
                multiTouch: this.detectMultiTouch(),
                stylus: this.detectStylusSupport(),
                keyboard: true,
                mouse: true,
                accelerometer: !!window.DeviceMotionEvent,
                gyroscope: !!window.DeviceOrientationEvent,
                webgl: this.detectWebGL(),
                webgl2: this.detectWebGL2()
            },
            performance: {
                tier: this.detectPerformanceTier(),
                memory: this.detectMemory(),
                processorCores: navigator.hardwareConcurrency || 1
            }
        };
    }

    // Platform-specific optimizations
    private setupHardwareAcceleration(): void {
        const style = document.createElement('div').style;
        
        // Check for hardware acceleration support
        const hasTransform3d = 'transform' in style &&
            'transition' in style &&
            'transform-style' in style;

        if (hasTransform3d) {
            document.body.classList.add('hardware-accelerated');
            this.hardwareAcceleration = true;
        } else {
            document.body.classList.add('software-rendered');
            this.hardwareAcceleration = false;
        }

        // Apply platform-specific styles
        if (this.currentProfile) {
            document.body.classList.add(`platform-${this.currentProfile.platform}`);
        }
    }

    // Input method handling
    private setupInputHandlers(): void {
        // Touch input
        if (this.currentProfile?.capabilities.touchscreen) {
            this.setupTouchHandlers();
        }

        // Stylus input
        if (this.currentProfile?.capabilities.stylus) {
            this.setupStylusHandlers();
        }

        // Motion input
        if (this.currentProfile?.capabilities.accelerometer) {
            this.setupMotionHandlers();
        }
    }

    // Helper methods for device detection
    private detectPlatform(): DeviceProfile['platform'] {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
            return 'ios';
        } else if (ua.includes('android')) {
            return 'android';
        } else if (ua.includes('win')) {
            return 'windows';
        } else if (ua.includes('mac')) {
            return 'macos';
        } else {
            return 'linux';
        }
    }

    private detectBrowser(): string {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'chrome';
        if (ua.includes('Firefox')) return 'firefox';
        if (ua.includes('Safari')) return 'safari';
        if (ua.includes('Edge')) return 'edge';
        return 'unknown';
    }

    private detectMultiTouch(): boolean {
        return 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 1;
    }

    private detectStylusSupport(): boolean {
        return 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
    }

    private detectWebGL(): boolean {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    }

    private detectWebGL2(): boolean {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    }

    private detectPerformanceTier(): 'low' | 'medium' | 'high' {
        const memory = this.detectMemory();
        const cores = navigator.hardwareConcurrency || 1;

        if (memory >= 4096 && cores >= 4) return 'high';
        if (memory >= 2048 && cores >= 2) return 'medium';
        return 'low';
    }

    private detectMemory(): number {
        // @ts-ignore: Chrome-specific API
        return navigator.deviceMemory ? navigator.deviceMemory * 1024 : 2048;
    }

    private generateDeviceId(): string {
        return `${this.detectPlatform()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Input handling setup methods
    private setupTouchHandlers(): void {
        const touchHandler = (event: TouchEvent) => {
            // Prevent default only if needed
            if (event.target instanceof HTMLInputElement) return;
            event.preventDefault();

            // Handle touch events
            switch (event.type) {
                case 'touchstart':
                    this.handleTouchStart(event);
                    break;
                case 'touchmove':
                    this.handleTouchMove(event);
                    break;
                case 'touchend':
                    this.handleTouchEnd(event);
                    break;
            }
        };

        document.addEventListener('touchstart', touchHandler, { passive: false });
        document.addEventListener('touchmove', touchHandler, { passive: false });
        document.addEventListener('touchend', touchHandler);

        this.inputHandlers.set('touch', touchHandler);
    }

    private setupStylusHandlers(): void {
        const stylusHandler = (event: PointerEvent) => {
            if (event.pointerType === 'pen') {
                // Handle stylus-specific events
                switch (event.type) {
                    case 'pointerdown':
                        this.handleStylusDown(event);
                        break;
                    case 'pointermove':
                        this.handleStylusMove(event);
                        break;
                    case 'pointerup':
                        this.handleStylusUp(event);
                        break;
                }
            }
        };

        document.addEventListener('pointerdown', stylusHandler);
        document.addEventListener('pointermove', stylusHandler);
        document.addEventListener('pointerup', stylusHandler);

        this.inputHandlers.set('stylus', stylusHandler);
    }

    private setupMotionHandlers(): void {
        const motionHandler = (event: DeviceMotionEvent) => {
            // Handle device motion
            this.handleDeviceMotion(event);
        };

        window.addEventListener('devicemotion', motionHandler);
        this.inputHandlers.set('motion', motionHandler);
    }

    // Input event handlers
    private handleTouchStart(event: TouchEvent): void {
        // Implement touch start handling
    }

    private handleTouchMove(event: TouchEvent): void {
        // Implement touch move handling
    }

    private handleTouchEnd(event: TouchEvent): void {
        // Implement touch end handling
    }

    private handleStylusDown(event: PointerEvent): void {
        // Implement stylus down handling
    }

    private handleStylusMove(event: PointerEvent): void {
        // Implement stylus move handling
    }

    private handleStylusUp(event: PointerEvent): void {
        // Implement stylus up handling
    }

    private handleDeviceMotion(event: DeviceMotionEvent): void {
        // Implement device motion handling
    }

    // Public methods
    getDeviceProfile(): DeviceProfile | null {
        return this.currentProfile;
    }

    isHardwareAccelerated(): boolean {
        return this.hardwareAcceleration;
    }

    getSupportedInputMethods(): string[] {
        return Array.from(this.inputHandlers.keys());
    }

    cleanup(): void {
        // Remove all event listeners
        this.inputHandlers.forEach((handler, type) => {
            switch (type) {
                case 'touch':
                    document.removeEventListener('touchstart', handler);
                    document.removeEventListener('touchmove', handler);
                    document.removeEventListener('touchend', handler);
                    break;
                case 'stylus':
                    document.removeEventListener('pointerdown', handler);
                    document.removeEventListener('pointermove', handler);
                    document.removeEventListener('pointerup', handler);
                    break;
                case 'motion':
                    window.removeEventListener('devicemotion', handler);
                    break;
            }
        });

        this.inputHandlers.clear();
    }
}

export const deviceSupportService = DeviceSupportService.getInstance();
