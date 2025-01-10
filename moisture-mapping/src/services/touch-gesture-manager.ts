import { Point2D } from '../types/canvas';
import { detectBrowser, SafariTouchFixes } from './browser-detection';
import { GestureOptimizationService } from './gesture-optimization';
import { DeviceOptimizationService } from './device-optimization';

interface TouchGestureCallbacks {
    onPan?: (delta: Point2D) => void;
    onZoom?: (scale: number, center: Point2D) => void;
    onRotate?: (angle: number, center: Point2D) => void;
    onDoubleTap?: (point: Point2D) => void;
}

export class TouchGestureManager {
    private element: HTMLElement;
    private callbacks: TouchGestureCallbacks;
    private touchPoints: Point2D[] = [];
    private lastDistance: number = 0;
    private lastAngle: number = 0;
    public isGesturing: boolean = false;
    private lastTap: number = 0;
    private lastTapPosition: Point2D | null = null;
    private browserInfo = detectBrowser();
    private cleanupFunctions: (() => void)[] = [];
    private gestureOptimization: GestureOptimizationService;
    private deviceOptimization: DeviceOptimizationService;

    constructor(element: HTMLElement, callbacks: TouchGestureCallbacks) {
        this.element = element;
        this.callbacks = callbacks;
        this.gestureOptimization = GestureOptimizationService.getInstance();
        this.deviceOptimization = DeviceOptimizationService.getInstance();
        this.initialize();
    }

    private initialize(): void {
        // Apply Safari-specific fixes if needed
        if (this.browserInfo.isSafari || this.browserInfo.isIOS) {
            SafariTouchFixes.preventDefaultTouchBehaviors(this.element);
        }

        // Set up event listeners with browser-specific handling
        if (this.browserInfo.isSafari || this.browserInfo.isIOS) {
            this.setupSafariTouchListeners();
        } else {
            this.setupStandardTouchListeners();
        }
    }

    private setupSafariTouchListeners(): void {
        // Use Safari-specific touch event handling
        this.cleanupFunctions.push(
            SafariTouchFixes.addSafariTouchListener(
                this.element,
                'touchstart',
                this.handleTouchStart.bind(this),
                { passive: false }
            ),
            SafariTouchFixes.addSafariTouchListener(
                this.element,
                'touchmove',
                this.handleTouchMove.bind(this),
                { passive: false }
            ),
            SafariTouchFixes.addSafariTouchListener(
                this.element,
                'touchend',
                this.handleTouchEnd.bind(this),
                { passive: false }
            )
        );
    }

    private setupStandardTouchListeners(): void {
        // Standard touch event handling for other browsers
        const addListener = (type: keyof HTMLElementEventMap, handler: (e: TouchEvent) => void) => {
            const boundHandler = handler.bind(this) as EventListener;
            this.element.addEventListener(type, boundHandler, { passive: false });
            return () => this.element.removeEventListener(type, boundHandler);
        };

        this.cleanupFunctions.push(
            addListener('touchstart', this.handleTouchStart),
            addListener('touchmove', this.handleTouchMove),
            addListener('touchend', this.handleTouchEnd)
        );
    }

    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault();

        // Get optimized touch points
        const rawPoints = Array.from(event.touches).map(touch => 
            this.browserInfo.isSafari || this.browserInfo.isIOS
                ? SafariTouchFixes.adjustTouchCoordinates(touch, this.element)
                : this.getTouchPoint(touch)
        );

        // Start gesture tracking and get optimized points
        this.gestureOptimization.startGesture(rawPoints);
        const { points: optimizedPoints } = this.gestureOptimization.processGesturePoints(rawPoints);
        this.touchPoints = optimizedPoints;

        if (event.touches.length === 2) {
            // Initialize two-finger gesture
            this.lastDistance = this.getDistance(this.touchPoints[0], this.touchPoints[1]);
            this.lastAngle = this.getAngle(this.touchPoints[0], this.touchPoints[1]);
            this.isGesturing = true;
        } else if (event.touches.length === 1) {
            // Handle potential double tap
            const now = Date.now();
            const point = this.touchPoints[0];
            
            if (this.lastTapPosition && 
                now - this.lastTap < 300 && 
                this.getDistance(point, this.lastTapPosition) < 30) {
                this.callbacks.onDoubleTap?.(point);
                this.lastTap = 0;
                this.lastTapPosition = null;
            } else {
                this.lastTap = now;
                this.lastTapPosition = point;
            }
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        event.preventDefault();

        // Get optimized touch points
        const rawPoints = Array.from(event.touches).map(touch =>
            this.browserInfo.isSafari || this.browserInfo.isIOS
                ? SafariTouchFixes.adjustTouchCoordinates(touch, this.element)
                : this.getTouchPoint(touch)
        );

        const { 
            points: currentPoints,
            metrics,
            predicted
        } = this.gestureOptimization.processGesturePoints(rawPoints);

        // Apply gesture prediction for smoother interactions
        const renderSettings = this.deviceOptimization.getRenderingSettings();
        if (renderSettings.useRequestAnimationFrame && predicted.length > 0) {
            requestAnimationFrame(() => {
                this.handlePredictedPoints(predicted, metrics);
            });
        }

        if (currentPoints.length === 2 && this.touchPoints.length === 2) {
            // Handle two-finger gestures
            const currentDistance = this.getDistance(currentPoints[0], currentPoints[1]);
            const currentAngle = this.getAngle(currentPoints[0], currentPoints[1]);
            const center = this.getMidpoint(currentPoints[0], currentPoints[1]);

            // Apply optimized gesture handling
            const settings = this.gestureOptimization.getGestureSettings();
            
            // Scale handling with smoothing
            const scaleChange = currentDistance / this.lastDistance;
            if (Math.abs(scaleChange - 1) > settings.gestureThreshold / 1000) {
                const smoothedScale = this.applySmoothingFactor(
                    scaleChange,
                    settings.smoothingFactor
                );
                this.callbacks.onZoom?.(smoothedScale, center);
                this.lastDistance = currentDistance;
            }

            // Rotation handling with smoothing
            const angleChange = currentAngle - this.lastAngle;
            if (Math.abs(angleChange) > settings.gestureThreshold / 100) {
                const smoothedAngle = this.applySmoothingFactor(
                    angleChange,
                    settings.smoothingFactor
                );
                this.callbacks.onRotate?.(smoothedAngle, center);
                this.lastAngle = currentAngle;
            }
        } else if (currentPoints.length === 1 && this.touchPoints.length === 1) {
            // Handle pan gesture
            const delta = {
                x: currentPoints[0].x - this.touchPoints[0].x,
                y: currentPoints[0].y - this.touchPoints[0].y
            };
            this.callbacks.onPan?.(delta);
        }

        this.touchPoints = currentPoints;
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (event.touches.length === 0) {
            this.isGesturing = false;
            this.touchPoints = [];
        } else {
            this.touchPoints = Array.from(event.touches).map(touch =>
                this.browserInfo.isSafari || this.browserInfo.isIOS
                    ? SafariTouchFixes.adjustTouchCoordinates(touch, this.element)
                    : this.getTouchPoint(touch)
            );
        }
    }

    private getTouchPoint(touch: Touch): Point2D {
        const rect = this.element.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    private getDistance(p1: Point2D, p2: Point2D): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getAngle(p1: Point2D, p2: Point2D): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    private getMidpoint(p1: Point2D, p2: Point2D): Point2D {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }

    public getTouchPoints(): Point2D[] {
        return [...this.touchPoints];
    }


    private handlePredictedPoints(
        predicted: Point2D[],
        metrics: { scale: number; rotation: number }
    ): void {
        if (predicted.length === 0) return;

        const center = this.getMidpoint(predicted[0], predicted[1]);
        
        if (metrics.scale !== 1) {
            this.callbacks.onZoom?.(metrics.scale, center);
        }
        
        if (metrics.rotation !== 0) {
            this.callbacks.onRotate?.(metrics.rotation, center);
        }
    }

    private applySmoothingFactor(value: number, factor: number): number {
        return value * (1 - factor) + value * factor;
    }

    public destroy(): void {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        this.gestureOptimization.endGesture();
    }
}
