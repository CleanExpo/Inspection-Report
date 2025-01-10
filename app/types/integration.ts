import { Point } from './moisture';
import { AnnotationType } from './annotation';
import { EquipmentType } from './equipment';
import { RenderLayerType } from './rendering';
import { CoordinateSpace } from './coordinate';

export enum PlacementMode {
  MANUAL = 'MANUAL',
  SNAP_TO_GRID = 'SNAP_TO_GRID',
  SNAP_TO_POINT = 'SNAP_TO_POINT',
  AUTO_DISTRIBUTE = 'AUTO_DISTRIBUTE'
}

export enum PositionStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  CONFLICT = 'CONFLICT'
}

export enum InteractionMode {
  SELECT = 'SELECT',
  MOVE = 'MOVE',
  RESIZE = 'RESIZE',
  ROTATE = 'ROTATE',
  DRAW = 'DRAW'
}

export enum OverlayType {
  READING = 'READING',
  EQUIPMENT = 'EQUIPMENT',
  ANNOTATION = 'ANNOTATION',
  ZONE = 'ZONE',
  MARKER = 'MARKER'
}

export interface PlacementConfig {
  mode: PlacementMode;
  snapThreshold?: number;
  autoSpacing?: number;
  constraints?: {
    minDistance?: number;
    maxDistance?: number;
    boundingBox?: {
      min: Point;
      max: Point;
    };
    allowedZones?: string[];
    excludedZones?: string[];
  };
  validation?: {
    requiresCalibration?: boolean;
    minAccuracy?: number;
    maxDensity?: number;
  };
}

export interface ReadingPlacement {
  id: string;
  readingId: string;
  position: Point;
  status: PositionStatus;
  coordinateSpace: string;
  value: number;
  timestamp: Date;
  metadata?: {
    accuracy?: number;
    confidence?: number;
    notes?: string;
  };
  visualization?: {
    size: number;
    color: string;
    opacity: number;
    label?: string;
    icon?: string;
  };
}

export interface EquipmentPosition {
  id: string;
  equipmentId: string;
  type: EquipmentType;
  position: Point;
  rotation: number;
  status: PositionStatus;
  coverageZone?: {
    type: 'CIRCLE' | 'RECTANGLE' | 'POLYGON';
    points: Point[];
    radius?: number;
  };
  movement?: {
    path: Point[];
    timestamps: Date[];
    speed: number;
  };
  connections?: {
    type: string;
    targetId: string;
    active: boolean;
  }[];
}

export interface AnnotationOverlay {
  id: string;
  annotationId: string;
  type: AnnotationType;
  layer: RenderLayerType;
  visible: boolean;
  interactive: boolean;
  style: {
    color: string;
    opacity: number;
    lineWidth?: number;
    fillStyle?: string;
    font?: string;
  };
  markers?: {
    id: string;
    position: Point;
    type: string;
    label?: string;
  }[];
  contextMenu?: {
    items: {
      id: string;
      label: string;
      icon?: string;
      action: string;
      enabled: boolean;
    }[];
  };
}

export interface InteractiveElement {
  id: string;
  type: OverlayType;
  targetId: string;
  mode: InteractionMode;
  selected: boolean;
  hovered: boolean;
  dragging: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  handles?: {
    position: Point;
    cursor: string;
    action: string;
  }[];
  constraints?: {
    movable: boolean;
    resizable: boolean;
    rotatable: boolean;
    deletable: boolean;
    minSize?: Point;
    maxSize?: Point;
    aspectRatio?: number;
  };
}

export interface IntegrationLayer {
  id: string;
  name: string;
  type: OverlayType;
  visible: boolean;
  opacity: number;
  zIndex: number;
  elements: {
    readings: ReadingPlacement[];
    equipment: EquipmentPosition[];
    annotations: AnnotationOverlay[];
  };
  interactions: {
    mode: InteractionMode;
    selectedElements: string[];
    hoveredElement?: string;
    activeElement?: string;
  };
  settings: {
    snapToGrid: boolean;
    showLabels: boolean;
    highlightActive: boolean;
    autoRefresh: boolean;
  };
}

export interface IntegrationState {
  activeSpace: CoordinateSpace;
  layers: IntegrationLayer[];
  selection: {
    elements: string[];
    bounds: {
      min: Point;
      max: Point;
    };
  };
  interaction: {
    mode: InteractionMode;
    startPoint?: Point;
    currentPoint?: Point;
    modifiers: {
      shift: boolean;
      ctrl: boolean;
      alt: boolean;
    };
  };
  history: {
    operations: {
      id: string;
      type: string;
      timestamp: Date;
      elements: string[];
    }[];
    undoStack: string[];
    redoStack: string[];
  };
}

export interface IntegrationUpdate {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'MOVE' | 'TRANSFORM';
  elements: {
    id: string;
    type: OverlayType;
    changes?: Record<string, any>;
  }[];
  source: 'USER' | 'SYSTEM' | 'REMOTE';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IntegrationSnapshot {
  id: string;
  timestamp: Date;
  space: CoordinateSpace;
  layers: IntegrationLayer[];
  selection: string[];
  mode: InteractionMode;
  metadata?: Record<string, any>;
}

export interface IntegrationStats {
  elements: {
    total: number;
    byType: Record<OverlayType, number>;
    selected: number;
    visible: number;
  };
  interactions: {
    operations: number;
    selections: number;
    updates: number;
  };
  performance: {
    renderTime: number;
    updateTime: number;
    fps: number;
  };
}
