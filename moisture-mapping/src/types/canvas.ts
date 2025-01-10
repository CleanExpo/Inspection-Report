/**
 * Basic 2D point interface
 */
export interface Point2D {
    x: number;
    y: number;
}

/**
 * 3D point interface with optional moisture value
 */
export interface Point3D extends Point2D {
    z: number;
    moisture?: number;
}

/**
 * Available drawing modes for the canvas
 */
export type DrawingMode = 'wall' | 'door' | 'window' | 'reading';

/**
 * Canvas layer names for the layered rendering system
 */
export type CanvasLayer = 'background' | 'walls' | 'readings' | 'overlay';

/**
 * Drawing style configuration
 */
export interface DrawingStyle {
    strokeStyle: string;
    fillStyle?: string;
    lineWidth: number;
    lineDash?: number[];
}

/**
 * Wall segment in the moisture map
 */
export interface Wall {
    start: Point2D;
    end: Point2D;
    type: 'wall' | 'door' | 'window';
    style?: DrawingStyle;
}

/**
 * Moisture reading point
 */
export interface MoisturePoint extends Point2D {
    value: number;
    timestamp: string;
    notes?: string;
}

/**
 * Canvas state for undo/redo operations
 */
export interface CanvasState {
    walls: Wall[];
    readings: MoisturePoint[];
    scale: number;
    transform: {
        x: number;
        y: number;
    };
}

/**
 * Canvas event handlers
 */
export interface CanvasEventHandlers {
    onWallComplete?: (wall: Wall) => void;
    onReadingComplete?: (reading: MoisturePoint) => void;
    onStateChange?: (state: CanvasState) => void;
    onError?: (error: Error) => void;
}

/**
 * Canvas configuration options
 */
export interface CanvasConfig {
    width: number;
    height: number;
    gridSize?: number;
    showGrid?: boolean;
    styles?: {
        wall?: DrawingStyle;
        door?: DrawingStyle;
        window?: DrawingStyle;
        reading?: DrawingStyle;
        grid?: DrawingStyle;
    };
    handlers?: CanvasEventHandlers;
}
