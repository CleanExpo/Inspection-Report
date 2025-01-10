export interface Point2D {
    x: number;
    y: number;
}

export interface Point3D extends Point2D {
    z: number;
}

export interface Dimension {
    width: number;
    height: number;
}

export interface Room {
    id: string;
    name: string;
    area: string;
    bounds: {
        topLeft: Point2D;
        bottomRight: Point2D;
    };
    measurements?: {
        width: number;  // meters
        length: number; // meters
        height: number; // meters
        area: number;   // square meters
    };
    lidarData?: LidarScan[];
}

export interface Wall {
    id: string;
    start: Point2D;
    end: Point2D;
    thickness: number;  // meters
    height?: number;    // meters
    type: 'exterior' | 'interior' | 'partition';
}

export interface LidarScan {
    timestamp: string;
    position: Point3D;
    points: Point3D[];
    intensity: number[];
    confidence: number[];
}

export interface FloorPlan {
    id: string;
    jobId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    dimension: Dimension;
    scale: number;      // pixels per meter
    rotation: number;   // degrees
    rooms: Room[];
    walls: Wall[];
    lidarScans?: LidarScan[];
}

export interface FloorPlanTemplate {
    id: string;
    name: string;
    category: 'residential' | 'commercial' | 'industrial';
    dimension: Dimension;
    defaultScale: number;
    rooms: Omit<Room, 'id' | 'lidarData'>[];
    walls: Omit<Wall, 'id'>[];
    tags: string[];
    previewUrl: string;
}

export interface TemplateAlignment {
    templateId: string;
    floorPlanId: string;
    scale: number;
    rotation: number;
    offset: Point2D;
    roomMappings: Array<{
        templateRoomName: string;
        floorPlanRoomId: string;
        confidence: number;
    }>;
    wallMappings: Array<{
        templateWallIndex: number;
        floorPlanWallId: string;
        confidence: number;
    }>;
}

export interface LidarCalibration {
    position: Point3D;
    rotation: {
        pitch: number;  // degrees
        yaw: number;    // degrees
        roll: number;   // degrees
    };
    scale: number;      // points per meter
    confidence: number; // 0-1
}

export interface LidarProcessingOptions {
    noiseReduction?: {
        enabled: boolean;
        threshold?: number;
    };
    decimation?: {
        enabled: boolean;
        factor?: number;
    };
    outlierRemoval?: {
        enabled: boolean;
        neighbors?: number;
        stdDevMult?: number;
    };
    registration?: {
        enabled: boolean;
        method: 'icp' | 'ndt';
        maxIterations: number;
        tolerance: number;
    };
}

export interface LidarProcessingResult {
    success: boolean;
    processedPoints: Point3D[];
    confidence: number;
    errors?: string[];
    warnings?: string[];
    metadata: {
        originalPoints: number;
        processedPoints: number;
        processingTime: number;
        memoryUsed: number;
    };
}
