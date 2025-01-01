export type DrawingTool = 
  | 'pen' 
  | 'line' 
  | 'rectangle' 
  | 'text' 
  | 'moisture' 
  | 'photo' 
  | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface MoistureData {
  value: number;
  materialType: string;
  readingType: {
    id: string;
    name: string;
    unit: string;
  };
  readingMethod: {
    id: string;
    name: string;
  };
  timestamp: string;
}

export interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  width: number;
  inspectionDay: number;
  version: number;
  lastModified: string;
  data?: {
    text?: string;
    moisture?: MoistureData;
    photoUrl?: string;
  };
}

export interface SketchState {
  inspectionDay: number;
  elements: DrawingElement[];
  currentTool: DrawingTool;
  currentColor: string;
  lineWidth: number;
  isDrawing: boolean;
}
