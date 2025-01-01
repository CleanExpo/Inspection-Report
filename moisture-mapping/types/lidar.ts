export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface LiDARMeasurement {
  id: string;
  timestamp: string;
  pointCloud: Point3D[];
  confidence: number; // Quality of measurement (0-1)
}

export interface RoomDimensions {
  width: number;  // in meters
  length: number; // in meters
  height: number; // in meters
  area: number;   // in square meters
  volume: number; // in cubic meters
}

export interface WallSurface {
  id: string;
  points: Point3D[];    // Corner points defining the wall
  normal: Point3D;      // Surface normal vector
  area: number;         // in square meters
  moisture?: number[];  // Array of moisture readings associated with this wall
}

export interface LiDARScan {
  id: string;
  timestamp: string;
  measurements: LiDARMeasurement[];
  processedData: {
    dimensions: RoomDimensions;
    walls: WallSurface[];
    floorPlan: Point3D[];  // 2D projection points for floor plan
    confidence: number;     // Overall scan quality (0-1)
  };
  metadata: {
    deviceType: string;
    scanMode: 'quick' | 'standard' | 'detailed';
    scanDuration: number;   // in seconds
    pointCount: number;     // total number of points in scan
    version: string;        // Scanner software version
  };
}

// Configuration for LiDAR scanning
export interface LiDARConfig {
  scanQuality: 'quick' | 'standard' | 'detailed';
  minConfidence: number;    // Minimum confidence threshold (0-1)
  pointDensity: number;     // Points per square meter
  autoLevel: boolean;       // Auto-level scan data
  filterOutliers: boolean;  // Remove statistical outliers
  alignToGrid: boolean;     // Align walls to nearest 90 degrees
}

// Status during active scanning
export interface ScanStatus {
  isScanning: boolean;
  progress: number;         // 0-100
  pointsCollected: number;
  currentOperation: string;
  estimatedTimeRemaining: number;  // in seconds
  error?: string;
}

// Results from processing raw scan data
export interface ProcessedScanResult {
  dimensions: RoomDimensions;
  walls: WallSurface[];
  accuracy: {
    overall: number;      // 0-1
    dimensionError: number;  // in meters
    angleError: number;      // in degrees
  };
  warnings: string[];     // Any issues found during processing
}
