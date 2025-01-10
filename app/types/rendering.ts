import { Point } from './moisture';
import { AnnotationStyle } from './annotation';

export enum RenderLayerType {
  BACKGROUND = 'BACKGROUND',
  GRID = 'GRID',
  CONTENT = 'CONTENT',
  ANNOTATION = 'ANNOTATION',
  OVERLAY = 'OVERLAY',
  UI = 'UI'
}

export enum InteractionMode {
  VIEW = 'VIEW',
  SELECT = 'SELECT',
  DRAW = 'DRAW',
  EDIT = 'EDIT',
  MEASURE = 'MEASURE'
}

export enum RenderEventType {
  MOUSE_MOVE = 'MOUSE_MOVE',
  MOUSE_DOWN = 'MOUSE_DOWN',
  MOUSE_UP = 'MOUSE_UP',
  MOUSE_WHEEL = 'MOUSE_WHEEL',
  KEY_DOWN = 'KEY_DOWN',
  KEY_UP = 'KEY_UP',
  CONTEXT_MENU = 'CONTEXT_MENU',
  DOUBLE_CLICK = 'DOUBLE_CLICK'
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  viewport: ViewportState;
  theme: RenderTheme;
  interactionMode: InteractionMode;
  selectedElements: string[];
  hoveredElement?: string;
}

export interface RenderLayer {
  id: string;
  type: RenderLayerType;
  visible: boolean;
  opacity: number;
  zIndex: number;
  elements: RenderElement[];
  cache?: {
    canvas: HTMLCanvasElement;
    dirty: boolean;
    lastUpdate: number;
  };
}

export interface RenderElement {
  id: string;
  type: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: AnnotationStyle;
  data: any;
  visible: boolean;
  interactive: boolean;
  selected?: boolean;
  hovered?: boolean;
  metadata?: Record<string, any>;
}

export interface RenderTheme {
  colors: {
    background: string;
    grid: string;
    selection: string;
    hover: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    grid: number;
    padding: number;
    margin: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

export interface RenderEvent {
  type: RenderEventType;
  point: Point;
  originalEvent: Event;
  target?: RenderElement;
  layer?: RenderLayer;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface RenderCommand {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'BATCH';
  elements: RenderElement[];
  layer: RenderLayerType;
  options?: {
    batch?: boolean;
    animate?: boolean;
    duration?: number;
  };
}

export interface RenderBatch {
  id: string;
  commands: RenderCommand[];
  timestamp: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface RenderStats {
  fps: number;
  frameTime: number;
  elementCount: number;
  drawCalls: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface ViewportState {
  scale: number;
  offset: Point;
  bounds: {
    min: Point;
    max: Point;
  };
  visible: {
    elements: string[];
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export interface RenderAnimation {
  id: string;
  element: string;
  property: string;
  startValue: any;
  endValue: any;
  duration: number;
  easing: string;
  startTime: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  onUpdate?: (value: any) => void;
  onComplete?: () => void;
}

export interface RenderInteraction {
  id: string;
  type: 'DRAG' | 'RESIZE' | 'ROTATE' | 'EDIT';
  element: string;
  startPoint: Point;
  currentPoint: Point;
  startState: any;
  modifiers: {
    snap: boolean;
    constrain: boolean;
    fromCenter: boolean;
  };
}

export interface RenderCache {
  id: string;
  layer: RenderLayerType;
  canvas: HTMLCanvasElement;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scale: number;
  timestamp: number;
  elements: string[];
  dirty: boolean;
}

export interface RenderPerformanceConfig {
  enableCaching: boolean;
  batchSize: number;
  throttleDelay: number;
  maxFPS: number;
  cullThreshold: number;
  debugMode: boolean;
}

export interface RenderSnapshot {
  id: string;
  timestamp: number;
  viewport: ViewportState;
  layers: RenderLayer[];
  interactions: RenderInteraction[];
  animations: RenderAnimation[];
  stats: RenderStats;
}

export interface RenderOptions {
  theme?: Partial<RenderTheme>;
  performance?: Partial<RenderPerformanceConfig>;
  viewport?: Partial<ViewportState>;
  handlers?: {
    [key in RenderEventType]?: (event: RenderEvent) => void;
  };
}
