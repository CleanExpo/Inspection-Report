export interface AnalyticsMoistureReading {
  value: number;
  timestamp: Date;
  location: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  periodStart: Date;
  periodEnd: Date;
  location: string;
  confidence: number;
}

export interface Hotspot {
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  averageValue: number;
  maxValue: number;
  readingCount: number;
  location: string;
  timestamp: Date;
}

export interface AggregationResult {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime: Date;
  endTime: Date;
  location: string;
  count: number;
  min: number;
  max: number;
  average: number;
  standardDeviation: number;
}
