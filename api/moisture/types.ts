export interface MoistureReading {
  value: number;
  timestamp: Date;
  location: string;
  x?: number;
  y?: number;
  z?: number;
}
