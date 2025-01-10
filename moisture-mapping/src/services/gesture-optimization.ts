import { Point2D } from '../types/canvas';
import { DeviceOptimizationService } from './device-optimization';

/**
 * Gesture optimization service for improved touch interactions
 */
export class GestureOptimizationService {
    private static instance: GestureOptimizationService;
    private deviceOptimization: DeviceOptimizationService;
    private gestureHistory: GestureHistoryPoint[] = [];
    private readonly HISTORY_SIZE = 10;
    private readonly PREDICTION_THRESHOLD = 16; // ms
    private lastPrediction: number = 0;
    private gestureState: GestureState = {
        isActive: false,
        currentScale: 1,
        currentRotation: 0,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 }
    };

    private constructor() {
        this.deviceOptimization = DeviceOptimizationService.getInstance();
    }

    public static getInstance(): GestureOptimizationService {
        if (!GestureOptimizationService.instance) {
            GestureOptimizationService.instance = new GestureOptimizationService();
        }
        return GestureOptimizationService.instance;
    }

    /**
     * Process and optimize touch points
     */
    public processGesturePoints(points: Point2D[]): OptimizedGestureData {
        const timestamp = performance.now();
        this.updateGestureHistory(points, timestamp);

        const optimizedPoints = this.smoothPoints(points);
        const predictedPoints = this.predictNextPoints();
        const gestureMetrics = this.calculateGestureMetrics(optimizedPoints);

        return {
            points: optimizedPoints,
            predicted: predictedPoints,
            metrics: gestureMetrics,
            smoothing: this.calculateSmoothingFactor(),
            velocity: this.gestureState.velocity,
            acceleration: this.gestureState.acceleration
        };
    }

    /**
     * Start gesture tracking
     */
    public startGesture(points: Point2D[]): void {
        this.gestureState.isActive = true;
        this.gestureState.currentScale = 1;
        this.gestureState.currentRotation = 0;
        this.gestureState.velocity = { x: 0, y: 0 };
        this.gestureState.acceleration = { x: 0, y: 0 };
        this.gestureHistory = [];
        this.updateGestureHistory(points, performance.now());
    }

    /**
     * End gesture tracking
     */
    public endGesture(): void {
        this.gestureState.isActive = false;
        this.gestureHistory = [];
        this.lastPrediction = 0;
    }

    /**
     * Get optimized gesture settings
     */
    public getGestureSettings(): GestureOptimizationSettings {
        const deviceSettings = this.deviceOptimization.getRenderingSettings();
        const isLowEndDevice = deviceSettings.maxFPS <= 30;

        return {
            predictionEnabled: !isLowEndDevice,
            smoothingEnabled: true,
            smoothingFactor: this.calculateSmoothingFactor(),
            velocityTracking: !isLowEndDevice,
            gestureThreshold: isLowEndDevice ? 10 : 5,
            minDistance: isLowEndDevice ? 10 : 5,
            maxPoints: isLowEndDevice ? 2 : 5,
            updateInterval: 1000 / deviceSettings.maxFPS
        };
    }

    private smoothPoints(points: Point2D[]): Point2D[] {
        if (points.length === 0) return points;

        const smoothingFactor = this.calculateSmoothingFactor();
        if (this.gestureHistory.length < 2) return points;

        return points.map((point, index) => {
            const historicalPoints = this.gestureHistory
                .map(h => h.points[index])
                .filter(p => p !== undefined);

            if (historicalPoints.length === 0) return point;

            const smoothedPoint = {
                x: point.x,
                y: point.y
            };

            historicalPoints.forEach((historical, i) => {
                const weight = smoothingFactor / (i + 1);
                smoothedPoint.x += historical.x * weight;
                smoothedPoint.y += historical.y * weight;
            });

            const totalWeight = 1 + smoothingFactor * historicalPoints.length;
            smoothedPoint.x /= totalWeight;
            smoothedPoint.y /= totalWeight;

            return smoothedPoint;
        });
    }

    private predictNextPoints(): Point2D[] {
        if (!this.gestureState.isActive || this.gestureHistory.length < 2) {
            return [];
        }

        const now = performance.now();
        if (now - this.lastPrediction < this.PREDICTION_THRESHOLD) {
            return [];
        }

        const latest = this.gestureHistory[this.gestureHistory.length - 1];
        const previous = this.gestureHistory[this.gestureHistory.length - 2];
        const timeDelta = latest.timestamp - previous.timestamp;

        if (timeDelta === 0) return [];

        return latest.points.map((point, index) => {
            const prevPoint = previous.points[index];
            if (!prevPoint) return point;

            const velocity = {
                x: (point.x - prevPoint.x) / timeDelta,
                y: (point.y - prevPoint.y) / timeDelta
            };

            const prediction = {
                x: point.x + velocity.x * this.PREDICTION_THRESHOLD,
                y: point.y + velocity.y * this.PREDICTION_THRESHOLD
            };

            return prediction;
        });
    }

    private calculateGestureMetrics(points: Point2D[]): GestureMetrics {
        if (points.length < 2 || this.gestureHistory.length < 2) {
            return {
                scale: 1,
                rotation: 0,
                speed: 0,
                direction: 0
            };
        }

        const latest = points;
        const previous = this.gestureHistory[this.gestureHistory.length - 2].points;

        // Calculate scale
        const currentDistance = this.getDistance(latest[0], latest[1]);
        const previousDistance = this.getDistance(previous[0], previous[1]);
        const scale = currentDistance / previousDistance;

        // Calculate rotation
        const currentAngle = this.getAngle(latest[0], latest[1]);
        const previousAngle = this.getAngle(previous[0], previous[1]);
        const rotation = currentAngle - previousAngle;

        // Calculate speed and direction
        const centerPoint = this.getCenterPoint(latest);
        const previousCenter = this.getCenterPoint(previous);
        const speed = this.getDistance(centerPoint, previousCenter);
        const direction = Math.atan2(
            centerPoint.y - previousCenter.y,
            centerPoint.x - previousCenter.x
        );

        return { scale, rotation, speed, direction };
    }

    private updateGestureHistory(points: Point2D[], timestamp: number): void {
        this.gestureHistory.push({ points: [...points], timestamp });
        if (this.gestureHistory.length > this.HISTORY_SIZE) {
            this.gestureHistory.shift();
        }

        if (this.gestureHistory.length >= 2) {
            this.updateVelocityAndAcceleration();
        }
    }

    private updateVelocityAndAcceleration(): void {
        const latest = this.gestureHistory[this.gestureHistory.length - 1];
        const previous = this.gestureHistory[this.gestureHistory.length - 2];
        const timeDelta = latest.timestamp - previous.timestamp;

        if (timeDelta === 0) return;

        const centerPoint = this.getCenterPoint(latest.points);
        const previousCenter = this.getCenterPoint(previous.points);

        const newVelocity = {
            x: (centerPoint.x - previousCenter.x) / timeDelta,
            y: (centerPoint.y - previousCenter.y) / timeDelta
        };

        this.gestureState.acceleration = {
            x: (newVelocity.x - this.gestureState.velocity.x) / timeDelta,
            y: (newVelocity.y - this.gestureState.velocity.y) / timeDelta
        };

        this.gestureState.velocity = newVelocity;
    }

    private calculateSmoothingFactor(): number {
        const deviceSettings = this.deviceOptimization.getRenderingSettings();
        const baseFactor = deviceSettings.maxFPS <= 30 ? 0.3 : 0.5;
        
        // Adjust based on performance
        if (deviceSettings.renderQuality === 'low') {
            return baseFactor * 0.7;
        }

        return baseFactor;
    }

    private getDistance(p1: Point2D, p2: Point2D): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getAngle(p1: Point2D, p2: Point2D): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    private getCenterPoint(points: Point2D[]): Point2D {
        const sum = points.reduce(
            (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
            { x: 0, y: 0 }
        );
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }
}

// Types
interface GestureHistoryPoint {
    points: Point2D[];
    timestamp: number;
}

interface GestureState {
    isActive: boolean;
    currentScale: number;
    currentRotation: number;
    velocity: Point2D;
    acceleration: Point2D;
}

interface GestureMetrics {
    scale: number;
    rotation: number;
    speed: number;
    direction: number;
}

interface OptimizedGestureData {
    points: Point2D[];
    predicted: Point2D[];
    metrics: GestureMetrics;
    smoothing: number;
    velocity: Point2D;
    acceleration: Point2D;
}

interface GestureOptimizationSettings {
    predictionEnabled: boolean;
    smoothingEnabled: boolean;
    smoothingFactor: number;
    velocityTracking: boolean;
    gestureThreshold: number;
    minDistance: number;
    maxPoints: number;
    updateInterval: number;
}
