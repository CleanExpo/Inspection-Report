export interface Position {
  x: number;
  y: number;
}

export interface ReadingValue {
  value: number;
  timestamp: string;
}

export interface MoistureReadingData {
  id: string;
  position: Position;
  values: ReadingValue[];
  material?: string;
  notes?: string;
}

export interface MoistureHistory {
  readings: MoistureReadingData[];
  timestamps: string[];
}
