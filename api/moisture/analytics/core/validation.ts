import { TimeSeriesData, TimeSeriesPoint } from '../types';
import { logger } from '../../utils/logger';

/**
 * Validates time series data for required properties and formats
 */
export function validateTimeSeriesData(data: TimeSeriesData): void {
  if (!data || !Array.isArray(data.points) || data.points.length === 0) {
    throw new Error('Invalid time series data: Empty or missing points array');
  }
  
  if (!data.interval || !['hourly', 'daily', 'weekly'].includes(data.interval)) {
    throw new Error('Invalid time series data: Missing or invalid interval (must be hourly, daily, or weekly)');
  }
  
  data.points.forEach((point, index) => {
    if (!point.timestamp || !point.value || typeof point.value !== 'number') {
      throw new Error(`Invalid point at index ${index}: Missing timestamp or value`);
    }
  });
}

/**
 * Type guard to validate metadata object
 */
export function isValidMetadata(metadata: any): metadata is { room: string; floor: string; locationX: number; locationY: number } {
  return (
    metadata !== null &&
    typeof metadata === 'object' &&
    typeof metadata.room === 'string' &&
    typeof metadata.floor === 'string' &&
    typeof metadata.locationX === 'number' &&
    typeof metadata.locationY === 'number'
  );
}

/**
 * Type guard to validate TimeSeriesPoint objects
 */
export interface ValidTimeSeriesPoint {
  timestamp: string;
  value: number;
  metadata: {
    room: string;
    floor: string;
    locationX: number;
    locationY: number;
  };
}

export function isValidTimeSeriesPoint(point: any): point is ValidTimeSeriesPoint {
  if (
    point === null ||
    typeof point !== 'object' ||
    typeof point.timestamp !== 'string' ||
    point.timestamp.length === 0 ||
    !isValidTimestamp(point.timestamp) ||
    typeof point.value !== 'number' ||
    !isValidMetadata(point.metadata)
  ) {
    return false;
  }
  return true;
}

/**
 * Validates if a string is a valid ISO timestamp
 */
export function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Removes statistical outliers from time series data
 */
export function removeOutliers(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (points.length < 4) return points;
  
  const values = points.map(p => p.value);
  const q1 = calculateQuantile(values, 0.25);
  const q3 = calculateQuantile(values, 0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return points.filter(p => p.value >= lowerBound && p.value <= upperBound);
}

/**
 * Helper function to calculate quantiles
 */
function calculateQuantile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (base + 1 < sorted.length) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}
