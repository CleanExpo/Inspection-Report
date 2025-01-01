import { DataPointData, MoistureReadingData } from '../types/readings';

/**
 * Determines the severity level based on the magnitude of change
 */
export function getSeverity(magnitude: number): 'low' | 'medium' | 'high' {
  if (magnitude < 0.3) return 'low';
  if (magnitude < 0.7) return 'medium';
  return 'high';
}

/**
 * Checks if two points are within a specified distance of each other
 */
export function isNearby(x1: number, y1: number, x2: number, y2: number): boolean {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance < 2.0; // Consider points within 2 units as nearby
}

/**
 * Calculates the standard deviation of a set of values
 */
export function calculateStandardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Validates a date range
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format in time range');
  }
  
  if (startDate > endDate) {
    throw new Error('Start date must be before end date');
  }
}

/**
 * Filters and validates readings data
 */
export function filterValidReadings<T extends MoistureReadingData & { dataPoints: DataPointData[] }>(
  readings: T[]
): T[] {
  return readings.filter(reading => 
    reading.dataPoints.length > 0 &&
    reading.dataPoints.every(dp => 
      dp.value !== null &&
      dp.value !== undefined &&
      !isNaN(dp.value) &&
      dp.value >= 0
    )
  );
}
