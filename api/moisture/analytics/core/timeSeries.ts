import { TimeSeriesData, TimeSeriesPoint, ProcessedTimeSeries } from '../types';
import { validateTimeSeriesData } from './validation';

/**
 * Converts interval string to milliseconds
 */
function intervalToMs(interval: 'hourly' | 'daily' | 'weekly'): number {
  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_WEEK = 7 * MS_PER_DAY;

  switch (interval) {
    case 'hourly':
      return MS_PER_HOUR;
    case 'daily':
      return MS_PER_DAY;
    case 'weekly':
      return MS_PER_WEEK;
    default:
      throw new Error('Invalid interval');
  }
}

/**
 * Finds gaps in time series data based on expected interval
 */
function findGaps(points: TimeSeriesPoint[], interval: 'hourly' | 'daily' | 'weekly'): { start: string; end: string }[] {
  const gaps: { start: string; end: string }[] = [];
  
  for (let i = 1; i < points.length; i++) {
    const current = new Date(points[i].timestamp).getTime();
    const previous = new Date(points[i - 1].timestamp).getTime();
    const gap = current - previous;
    
    if (gap > intervalToMs(interval) * 1.5) { // Allow 50% tolerance
      gaps.push({
        start: points[i - 1].timestamp,
        end: points[i].timestamp
      });
    }
  }
  
  return gaps;
}

/**
 * Normalizes time series data by interpolating missing values
 */
function normalizeTimeSeries(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
  if (points.length < 2) return points;
  
  const normalized: TimeSeriesPoint[] = [];
  const startTime = new Date(points[0].timestamp).getTime();
  const endTime = new Date(points[points.length - 1].timestamp).getTime();
  const avgInterval = (endTime - startTime) / (points.length - 1);
  
  let currentIndex = 0;
  let currentTime = startTime;
  
  while (currentTime <= endTime) {
    const point = points[currentIndex];
    const pointTime = new Date(point.timestamp).getTime();
    
    if (Math.abs(currentTime - pointTime) < avgInterval / 2) {
      normalized.push(point);
      currentTime = pointTime + avgInterval;
      currentIndex++;
    } else if (currentTime < pointTime) {
      // Interpolate
      const prevPoint = points[currentIndex - 1];
      const nextPoint = points[currentIndex];
      const ratio = (currentTime - new Date(prevPoint.timestamp).getTime()) /
                   (new Date(nextPoint.timestamp).getTime() - new Date(prevPoint.timestamp).getTime());
      
      normalized.push({
        timestamp: new Date(currentTime).toISOString(),
        value: prevPoint.value + (nextPoint.value - prevPoint.value) * ratio,
        metadata: {
          room: 'interpolated',
          floor: 'interpolated',
          locationX: prevPoint.metadata.locationX + (nextPoint.metadata.locationX - prevPoint.metadata.locationX) * ratio,
          locationY: prevPoint.metadata.locationY + (nextPoint.metadata.locationY - prevPoint.metadata.locationY) * ratio
        }
      });
      currentTime += avgInterval;
    } else {
      currentIndex++;
    }
  }
  
  return normalized;
}

/**
 * Calculates the average sampling rate of time series data
 */
function calculateSamplingRate(points: TimeSeriesPoint[]): number {
  if (points.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const current = new Date(points[i].timestamp).getTime();
    const previous = new Date(points[i - 1].timestamp).getTime();
    intervals.push(current - previous);
  }
  
  return intervals.reduce((a, b) => a + b, 0) / intervals.length;
}

/**
 * Process time series data by normalizing and identifying gaps
 */
export function processTimeSeries(data: TimeSeriesData): ProcessedTimeSeries {
  validateTimeSeriesData(data);
  
  const sortedPoints = [...data.points].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const gaps = findGaps(sortedPoints, data.interval);
  const normalizedData = normalizeTimeSeries(sortedPoints);
  const samplingRate = calculateSamplingRate(sortedPoints);

  return {
    rawData: sortedPoints,
    normalizedData,
    samplingRate,
    gaps
  };
}
