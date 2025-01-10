import { Point } from './moisture';

export enum AnnotationType {
  TEXT = 'TEXT',
  SHAPE = 'SHAPE',
  MEASUREMENT = 'MEASUREMENT',
  IMAGE = 'IMAGE'
}

export enum ShapeType {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  ARROW = 'ARROW',
  LINE = 'LINE',
  POLYGON = 'POLYGON',
  FREEHAND = 'FREEHAND'
}

export enum MeasurementType {
  DISTANCE = 'DISTANCE',
  AREA = 'AREA',
  ANGLE = 'ANGLE',
  VOLUME = 'VOLUME'
}

export enum TextStyle {
  NORMAL = 'NORMAL',
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  STRIKETHROUGH = 'STRIKETHROUGH'
}

export interface AnnotationStyle {
  color: string;
  opacity: number;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textStyles?: TextStyle[];
  zIndex?: number;
}

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  mapId: string;
  position: Point;
  rotation?: number;
  scale?: number;
  style: AnnotationStyle;
  layer: number;
  visible: boolean;
  locked: boolean;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextAnnotation extends BaseAnnotation {
  type: AnnotationType.TEXT;
  content: string;
  richText?: {
    format: 'html' | 'markdown' | 'plain';
    content: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: AnnotationType.SHAPE;
  shapeType: ShapeType;
  points: Point[];
  dimensions?: {
    width?: number;
    height?: number;
    radius?: number;
  };
}

export interface MeasurementAnnotation extends BaseAnnotation {
  type: AnnotationType.MEASUREMENT;
  measurementType: MeasurementType;
  points: Point[];
  value: number;
  unit: string;
  referenceScale?: number;
  accuracy?: number;
  calibrationReference?: {
    realWorldDistance: number;
    pixelDistance: number;
    unit: string;
  };
}

export interface ImageAnnotation extends BaseAnnotation {
  type: AnnotationType.IMAGE;
  imageUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
  originalDimensions: {
    width: number;
    height: number;
  };
  cropRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    opacity?: number;
  };
}

export type Annotation = TextAnnotation | ShapeAnnotation | MeasurementAnnotation | ImageAnnotation;

export interface AnnotationLayer {
  id: string;
  mapId: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  annotations: string[]; // Annotation IDs
  metadata?: Record<string, any>;
}

export interface AnnotationGroup {
  id: string;
  mapId: string;
  name: string;
  annotations: string[]; // Annotation IDs
  visible: boolean;
  locked: boolean;
  metadata?: Record<string, any>;
}

export interface AnnotationVersion {
  id: string;
  annotationId: string;
  state: string; // JSON string of annotation state
  timestamp: Date;
  userId: string;
  comment?: string;
}

export interface AnnotationExport {
  format: 'pdf' | 'image' | 'svg' | 'json';
  options: {
    includeBackground?: boolean;
    includeMeasurements?: boolean;
    scale?: number;
    dpi?: number;
    pageSize?: {
      width: number;
      height: number;
      unit: string;
    };
    layers?: string[]; // Layer IDs to include
  };
}

export interface AnnotationTemplate {
  id: string;
  name: string;
  type: AnnotationType;
  style: AnnotationStyle;
  defaultContent?: any;
  metadata?: Record<string, any>;
}

export interface AnnotationStatistics {
  mapId: string;
  counts: {
    total: number;
    byType: Record<AnnotationType, number>;
    byLayer: Record<string, number>;
  };
  measurements: {
    total: number;
    byType: Record<MeasurementType, {
      count: number;
      sum: number;
      average: number;
      unit: string;
    }>;
  };
  coverage: {
    total: number;
    byType: Record<AnnotationType, number>;
  };
}

export interface AnnotationValidationRule {
  type: AnnotationType;
  conditions: {
    required?: boolean;
    minCount?: number;
    maxCount?: number;
    allowedShapes?: ShapeType[];
    allowedMeasurements?: MeasurementType[];
    styleRestrictions?: Partial<AnnotationStyle>;
    customValidator?: (annotation: Annotation) => boolean;
  };
  errorMessage: string;
}

export interface AnnotationTransform {
  translate?: {
    x: number;
    y: number;
  };
  rotate?: number;
  scale?: {
    x: number;
    y: number;
  };
  origin?: Point;
}

export interface AnnotationSnappingOptions {
  enabled: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  snapToPoints?: boolean;
  snapToEdges?: boolean;
  tolerance?: number;
}
