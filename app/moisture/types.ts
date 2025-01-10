export interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  points: Point[];
  gridSpacing: number;
  referenceValues: {
    dry: number;
    warning: number;
    critical: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Comparison {
  point: Point;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  withinTolerance: boolean;
}

export interface MeasurementHistory {
  sessionId: string;
  templateId: string;
  timestamp: Date;
  readings: any[];
  comparisons: Comparison[];
  summary: {
    averageDeviation: number;
    maxDeviation: number;
    pointsOutOfTolerance: number;
  };
}
