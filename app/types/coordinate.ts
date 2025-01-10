import { Point } from './moisture';
import { PlanLevel } from './plan';

export enum CoordinateUnit {
  PIXELS = 'PIXELS',
  METERS = 'METERS',
  FEET = 'FEET',
  INCHES = 'INCHES',
  MILLIMETERS = 'MILLIMETERS'
}

export enum GridType {
  RECTANGULAR = 'RECTANGULAR',
  POLAR = 'POLAR',
  ISOMETRIC = 'ISOMETRIC',
  CUSTOM = 'CUSTOM'
}

export enum SnapMode {
  NONE = 'NONE',
  GRID = 'GRID',
  POINTS = 'POINTS',
  LINES = 'LINES',
  ALL = 'ALL'
}

export interface Scale {
  pixelsPerUnit: number;
  unit: CoordinateUnit;
  referencePoints: {
    pixel: Point;
    real: Point;
  }[];
  calibrationDate?: Date;
  accuracy?: number;
  confidence?: number;
}

export interface Transform {
  translate: Point;
  rotate: number;
  scale: Point;
  origin: Point;
  matrix?: number[][]; // 3x3 transformation matrix
}

export interface CoordinateSpace {
  id: string;
  name: string;
  unit: CoordinateUnit;
  origin: Point;
  bounds: {
    min: Point;
    max: Point;
  };
  scale: Scale;
  transform: Transform;
  parent?: string; // Parent coordinate space ID
  children: string[]; // Child coordinate space IDs
  metadata?: Record<string, any>;
}

export interface LevelCoordinates {
  id: string;
  level: PlanLevel;
  levelNumber: number;
  elevation: number;
  height: number;
  coordinateSpace: CoordinateSpace;
  referencePoints: {
    id: string;
    position: Point;
    elevation: number;
    description?: string;
  }[];
  connections: {
    id: string;
    type: 'STAIR' | 'ELEVATOR' | 'RAMP' | 'SHAFT';
    source: Point;
    target: Point;
    sourceLevel: string;
    targetLevel: string;
  }[];
}

export interface Grid {
  id: string;
  type: GridType;
  spacing: {
    major: number;
    minor: number;
    subdivisions: number;
  };
  origin: Point;
  rotation: number;
  extents: {
    width: number;
    height: number;
  };
  style: {
    majorColor: string;
    minorColor: string;
    opacity: number;
    lineWidth: number;
  };
  labels?: {
    show: boolean;
    format: string;
    offset: Point;
  };
  snap?: {
    enabled: boolean;
    threshold: number;
    modes: SnapMode[];
  };
}

export interface CoordinateMapping {
  id: string;
  sourceSpace: string;
  targetSpace: string;
  transformations: Transform[];
  accuracy: number;
  constraints?: {
    preserveScale?: boolean;
    lockRotation?: boolean;
    boundingBox?: {
      min: Point;
      max: Point;
    };
  };
}

export interface CoordinateSystem {
  id: string;
  name: string;
  defaultUnit: CoordinateUnit;
  spaces: CoordinateSpace[];
  levels: LevelCoordinates[];
  grids: Grid[];
  mappings: CoordinateMapping[];
  metadata?: {
    projectId?: string;
    createdBy?: string;
    createdAt?: Date;
    modifiedAt?: Date;
    version?: string;
  };
}

export interface CoordinateConversion {
  source: {
    point: Point;
    unit: CoordinateUnit;
    space?: string;
  };
  target: {
    unit: CoordinateUnit;
    space?: string;
  };
  options?: {
    roundTo?: number;
    preserveZ?: boolean;
    includeElevation?: boolean;
  };
}

export interface GridConfiguration {
  visible: boolean;
  active: boolean;
  snapEnabled: boolean;
  snapModes: SnapMode[];
  currentGrid?: string;
  customSettings?: {
    spacing?: number;
    angle?: number;
    offset?: Point;
  };
}

export interface CoordinateValidationRule {
  type: 'POINT' | 'DISTANCE' | 'ANGLE' | 'ELEVATION';
  constraints: {
    min?: number;
    max?: number;
    tolerance?: number;
    allowedUnits?: CoordinateUnit[];
    requiredAccuracy?: number;
  };
  errorMessage: string;
}

export interface CoordinateCalibration {
  id: string;
  spaceId: string;
  method: 'POINT_PAIR' | 'KNOWN_DISTANCE' | 'REFERENCE_GRID';
  referencePoints: {
    measured: Point;
    reference: Point;
    weight?: number;
  }[];
  result?: {
    scale: Scale;
    error: number;
    confidence: number;
    warnings?: string[];
  };
  timestamp: Date;
  operator?: string;
}

export interface CoordinateSnapshot {
  id: string;
  systemId: string;
  timestamp: Date;
  spaces: CoordinateSpace[];
  transforms: Transform[];
  metadata?: Record<string, any>;
}

export interface CoordinateStats {
  spaces: number;
  levels: number;
  mappings: number;
  averageAccuracy: number;
  calibrations: {
    total: number;
    lastDate?: Date;
    averageError: number;
  };
  usage: {
    conversions: number;
    transformations: number;
    snapEvents: number;
  };
}
