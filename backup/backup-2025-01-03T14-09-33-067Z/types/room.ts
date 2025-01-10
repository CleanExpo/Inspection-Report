import { Point } from './moisture';

export interface Room {
  id: string;
  width: number;
  height: number;
  dimensions: {
    width: string;
    height: string;
    unit: string;
  };
}

export interface Equipment {
  id: string;
  type: string;
  position: Point;
  rotation: number;
  notes: string[];
}

export interface DamageArea {
  id: string;
  points: Point[];
  severity: DamageSeverity;
  notes: string[];
}

export interface RoomConnection {
  room1Id: string;
  room2Id: string;
  connectionType: 'door' | 'opening';
  position: Point;
}

export interface ProcessedReading {
  id: string;
  position: Point;
  value: number;
  materialType: string;
  timestamp: string;
  nearby: ProcessedReading[];
}

export interface MoistureHotspot {
  id: string;
  position: Point;
  value: number;
  readings: ProcessedReading[];
}

export interface PositionScore {
  position: Point;
  score: number;
}

export interface RoomCluster {
  id: string;
  readings: ProcessedReading[];
  center: Point;
}

export type DamageSeverity = 'mild' | 'moderate' | 'severe';
