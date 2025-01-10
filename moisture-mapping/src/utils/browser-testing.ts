import { BrowserInfo } from '../services/browser-detection';

/**
 * Browser environment simulation for testing
 */
export class BrowserEnvironment {
    private originalUserAgent: string;
    private originalTouch: boolean;
    private originalGestureEvent: boolean;

    constructor() {
        this.originalUserAgent = navigator.userAgent;
        this.originalTouch = 'ontouchstart' in window;
        this.originalGestureEvent = 'ongesturestart' in window;
    }

    /**
     * Simulate a specific browser environment
     */
    public simulateBrowser(browser: BrowserSimulation): void {
        // Override user agent
        Object.defineProperty(navigator, 'userAgent', {
            get: () => browser.userAgent,
            configurable: true
        });

        // Simulate touch support
        if (browser.touchSupport) {
            (window as any).ontouchstart = () => {};
        } else {
            delete (window as any).ontouchstart;
        }

        // Simulate gesture support
        if (browser.gestureSupport) {
            (window as any).ongesturestart = () => {};
        } else {
            delete (window as any).ongesturestart;
        }

        // Add browser-specific event constructors
        if (browser.touchSupport) {
            this.setupTouchEvents();
        }
        if (browser.gestureSupport) {
            this.setupGestureEvents();
        }
    }

    /**
     * Restore original browser environment
     */
    public restore(): void {
        Object.defineProperty(navigator, 'userAgent', {
            get: () => this.originalUserAgent,
            configurable: true
        });

        if (this.originalTouch) {
            (window as any).ontouchstart = () => {};
        } else {
            delete (window as any).ontouchstart;
        }

        if (this.originalGestureEvent) {
            (window as any).ongesturestart = () => {};
        } else {
            delete (window as any).ongesturestart;
        }
    }

    private setupTouchEvents(): void {
        // Mock touch event constructors if not available
        if (typeof TouchEvent === 'undefined') {
            (window as any).TouchEvent = class TouchEvent extends Event {
                touches: Touch[];
                targetTouches: Touch[];
                changedTouches: Touch[];
                
                constructor(type: string, init: TouchEventInit = {}) {
                    super(type, init);
                    this.touches = init.touches || [];
                    this.targetTouches = init.targetTouches || [];
                    this.changedTouches = init.changedTouches || [];
                }
            };
        }
    }

    private setupGestureEvents(): void {
        // Mock gesture event constructors if not available
        if (typeof GestureEvent === 'undefined') {
            (window as any).GestureEvent = class GestureEvent extends Event {
                scale: number;
                rotation: number;

                constructor(type: string, init: any = {}) {
                    super(type, init);
                    this.scale = init.scale || 1;
                    this.rotation = init.rotation || 0;
                }
            };
        }
    }
}

/**
 * Browser simulation configurations
 */
export interface BrowserSimulation {
    name: string;
    userAgent: string;
    touchSupport: boolean;
    gestureSupport: boolean;
}

export const BrowserProfiles: Record<string, BrowserSimulation> = {
    Chrome: {
        name: 'Chrome',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        touchSupport: true,
        gestureSupport: false
    },
    Firefox: {
        name: 'Firefox',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        touchSupport: true,
        gestureSupport: false
    },
    Safari: {
        name: 'Safari',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        touchSupport: true,
        gestureSupport: true
    },
    iOS: {
        name: 'iOS Safari',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        touchSupport: true,
        gestureSupport: true
    },
    Android: {
        name: 'Android Chrome',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
        touchSupport: true,
        gestureSupport: false
    }
};

/**
 * Touch event simulation utilities
 */
export class TouchSimulator {
    /**
     * Create a simulated touch object
     */
    public static createTouch(
        target: EventTarget,
        identifier: number,
        clientX: number,
        clientY: number,
        radiusX = 1,
        radiusY = 1,
        force = 1
    ): Touch {
        return new Touch({
            identifier,
            target,
            clientX,
            clientY,
            radiusX,
            radiusY,
            force
        });
    }

    /**
     * Create a simulated touch event
     */
    public static createTouchEvent(
        type: string,
        target: EventTarget,
        touches: Touch[],
        changedTouches: Touch[] = [],
        targetTouches: Touch[] = touches
    ): TouchEvent {
        return new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches,
            targetTouches,
            changedTouches
        });
    }

    /**
     * Simulate a gesture sequence
     */
    public static async simulateGesture(
        target: EventTarget,
        gesture: TouchGesture
    ): Promise<void> {
        const { start, moves, end } = gesture;

        // Start gesture
        const startTouches = start.points.map((point, i) =>
            this.createTouch(target, i, point.x, point.y)
        );
        target.dispatchEvent(
            this.createTouchEvent('touchstart', target, startTouches)
        );

        // Simulate moves
        for (const move of moves) {
            await new Promise(resolve => setTimeout(resolve, move.delay || 16));
            const moveTouches = move.points.map((point, i) =>
                this.createTouch(target, i, point.x, point.y)
            );
            target.dispatchEvent(
                this.createTouchEvent('touchmove', target, moveTouches)
            );
        }

        // End gesture
        const endTouches = end.points.map((point, i) =>
            this.createTouch(target, i, point.x, point.y)
        );
        target.dispatchEvent(
            this.createTouchEvent('touchend', target, [], endTouches)
        );
    }
}

/**
 * Touch gesture simulation types
 */
export interface TouchGesture {
    start: TouchFrame;
    moves: TouchFrame[];
    end: TouchFrame;
}

interface TouchFrame {
    points: Array<{ x: number; y: number }>;
    delay?: number;
}

/**
 * Predefined gesture patterns
 */
export const GesturePatterns = {
    pinchZoom: (
        centerX: number,
        centerY: number,
        startScale = 1,
        endScale = 2
    ): TouchGesture => {
        const distance = 50;
        return {
            start: {
                points: [
                    { x: centerX - distance * startScale, y: centerY },
                    { x: centerX + distance * startScale, y: centerY }
                ]
            },
            moves: [
                {
                    points: [
                        { x: centerX - distance * ((startScale + endScale) / 2), y: centerY },
                        { x: centerX + distance * ((startScale + endScale) / 2), y: centerY }
                    ],
                    delay: 16
                }
            ],
            end: {
                points: [
                    { x: centerX - distance * endScale, y: centerY },
                    { x: centerX + distance * endScale, y: centerY }
                ]
            }
        };
    },

    rotate: (
        centerX: number,
        centerY: number,
        angle: number
    ): TouchGesture => {
        const radius = 50;
        const steps = 5;
        const moves = [];

        for (let i = 1; i < steps; i++) {
            const currentAngle = (angle * i) / steps;
            moves.push({
                points: [
                    {
                        x: centerX + radius * Math.cos(currentAngle),
                        y: centerY + radius * Math.sin(currentAngle)
                    },
                    {
                        x: centerX + radius * Math.cos(currentAngle + Math.PI),
                        y: centerY + radius * Math.sin(currentAngle + Math.PI)
                    }
                ],
                delay: 16
            });
        }

        return {
            start: {
                points: [
                    { x: centerX + radius, y: centerY },
                    { x: centerX - radius, y: centerY }
                ]
            },
            moves,
            end: {
                points: [
                    {
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle)
                    },
                    {
                        x: centerX + radius * Math.cos(angle + Math.PI),
                        y: centerY + radius * Math.sin(angle + Math.PI)
                    }
                ]
            }
        };
    },

    pan: (
        startX: number,
        startY: number,
        endX: number,
        endY: number
    ): TouchGesture => {
        const steps = 5;
        const moves = [];

        for (let i = 1; i < steps; i++) {
            moves.push({
                points: [
                    {
                        x: startX + ((endX - startX) * i) / steps,
                        y: startY + ((endY - startY) * i) / steps
                    }
                ],
                delay: 16
            });
        }

        return {
            start: {
                points: [{ x: startX, y: startY }]
            },
            moves,
            end: {
                points: [{ x: endX, y: endY }]
            }
        };
    }
};
