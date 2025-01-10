import type { MoistureReading as PrismaMoistureReading } from '@prisma/client';

export interface MoistureReading extends PrismaMoistureReading {
  value: number; // Calculated moisture value (0-100)
}

export interface ThreeDVisualizationProps {
  readings: MoistureReading[]; // Using our extended type
  width?: number;
  height?: number;
  onPointSelect?: (reading: MoistureReading) => void;
}

export interface SceneConfig {
  width: number;
  height: number;
  fov: number;
  near: number;
  far: number;
  cameraPosition: [number, number, number];
}

export interface PointMaterial {
  size: number;
  color: number;
  opacity: number;
  transparent: boolean;
}

export interface ViewControls {
  autoRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  maxDistance: number;
  minDistance: number;
}

export type Point3D = [number, number, number];
