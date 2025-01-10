export interface MoistureReading {
  locationX: number;
  locationY: number;
  dataPoints: {
    value: number;
    unit: string;
  }[];
}

export interface FloorPlan {
  id: string;
  level: number;
  scale: number;
  width: number;
  height: number;
  readings: MoistureReading[];
}

export interface ControlSettings {
  minDistance?: number;
  maxDistance?: number;
  rotationSpeed?: number;
  zoomSpeed?: number;
  enableDamping?: boolean;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  dampingFactor?: number;
}

export interface ThreeDVisualizationProps {
  backgroundColor?: number;
  fov?: number;
  floorPlans?: FloorPlan[];
  controlSettings?: ControlSettings;
}
