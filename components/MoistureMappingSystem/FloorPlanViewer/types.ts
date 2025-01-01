export interface MoistureReading {
  id: string;
  jobId: string;
  locationX: number;
  locationY: number;
  value: number;
  room: string;
  floor: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  equipmentId: string;
  floorPlanId: string;
}

export interface FloorPlanViewerProps {
  floorPlanUrl: string;
  readings: MoistureReading[];
  width?: number;
  height?: number;
  onPointSelect?: (reading: MoistureReading) => void;
  showGrid?: boolean;
  showScale?: boolean;
}

export interface GridConfig {
  cellSize: number;  // Size of each grid cell in pixels
  color: string;     // Grid line color
  opacity: number;   // Grid line opacity
  showLabels: boolean; // Show coordinate labels
}

export interface ScaleConfig {
  pixelsPerMeter: number;  // Scale ratio
  showRuler: boolean;      // Show measurement ruler
  unit: 'meters' | 'feet'; // Measurement unit
}

export interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export interface Measurement {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label?: string;
}

export interface Overlay {
  type: 'grid' | 'measurement' | 'reading';
  visible: boolean;
  zIndex: number;
}

export interface CanvasLayers {
  background: HTMLCanvasElement; // Floor plan image
  grid: HTMLCanvasElement;      // Grid overlay
  readings: HTMLCanvasElement;  // Moisture readings
  measurements: HTMLCanvasElement; // User measurements
  interaction: HTMLCanvasElement;  // Active interactions
}

export type RenderLayer = keyof CanvasLayers;

export interface DrawContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  viewport: ViewportState;
  config: {
    grid: GridConfig;
    scale: ScaleConfig;
  };
}
