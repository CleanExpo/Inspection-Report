import type { MoistureReading } from '../ThreeDVisualization/types';

export interface FloorPlanConfig {
  width: number;
  height: number;
  scale: number;
  gridSize: number;
  backgroundColor: string;
  gridColor: string;
  showGrid: boolean;
  showControls: boolean;
  showTooltips: boolean;
  controlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  gridSizeRange?: {
    min: number;
    max: number;
  };
}

export interface ControlsConfig {
  zoomStep: number;
  panStep: number;
  shortcuts: {
    zoomIn: string;
    zoomOut: string;
    panUp: string;
    panDown: string;
    panLeft: string;
    panRight: string;
    reset: string;
    toggleGrid: string;
    increaseGridSize: string;
    decreaseGridSize: string;
  };
  showShortcutsHelp?: boolean;
  gridSizeStep?: number;
  minGridSize?: number;
  maxGridSize?: number;
}

export interface ViewportConfig {
  zoom: number;
  panX: number;
  panY: number;
  minZoom: number;
  maxZoom: number;
}

export interface FloorPlan {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  scale: number;
  readings: MoistureReading[];
}

export interface MeasurementOverlay {
  id: string;
  type: 'point' | 'area' | 'perimeter';
  coordinates: { x: number; y: number }[];
  value?: number;
  label?: string;
}

export interface FloorPlanViewerProps {
  floorPlan: FloorPlan;
  config?: Partial<FloorPlanConfig>;
  controls?: Partial<ControlsConfig>;
  viewport?: Partial<ViewportConfig>;
  overlays?: MeasurementOverlay[];
  onMeasurementClick?: (measurement: MeasurementOverlay) => void;
  onMeasurementHover?: (measurement: MeasurementOverlay | null) => void;
  onViewportChange?: (viewport: ViewportConfig) => void;
  onConfigChange?: (config: FloorPlanConfig) => void;
  onControlsChange?: (controls: ControlsConfig) => void;
}

export interface ShortcutConfig {
  key: string;
  requiresCtrl?: boolean;
  description: string;
}

export interface ShortcutMap {
  [key: string]: ShortcutConfig;
}

export interface TooltipInfo {
  content: string;
  x: number;
  y: number;
  visible: boolean;
}
