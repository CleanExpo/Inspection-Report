import { TimeSeriesPoint, ChangePoint, Point2D } from '../types';
import { removeOutliers } from './validation';

/**
 * Gets the direction of trend in time series data
 */
function getTrendDirection(points: TimeSeriesPoint[]): 'increasing' | 'decreasing' | 'stable' {
  if (points.length < 2) return 'stable';

  const values = points.map(p => p.value);
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const threshold = 0.1; // Minimum slope to consider as a trend

  if (Math.abs(slope) < threshold) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}

/**
 * Calculates confidence score for a change point
 */
function calculateChangeConfidence(before: TimeSeriesPoint[], after: TimeSeriesPoint[]): number {
  if (before.length < 2 || after.length < 2) return 0;

  const beforeValues = before.map(p => p.value);
  const afterValues = after.map(p => p.value);

  // Calculate means
  const beforeMean = beforeValues.reduce((a, b) => a + b, 0) / beforeValues.length;
  const afterMean = afterValues.reduce((a, b) => a + b, 0) / afterValues.length;

  // Calculate variances
  const beforeVar = beforeValues.reduce((a, b) => a + Math.pow(b - beforeMean, 2), 0) / beforeValues.length;
  const afterVar = afterValues.reduce((a, b) => a + Math.pow(b - afterMean, 2), 0) / afterValues.length;

  // Calculate confidence based on mean shift and variance change
  const meanShift = Math.abs(afterMean - beforeMean) / Math.max(beforeMean, 1);
  const varChange = Math.abs(afterVar - beforeVar) / Math.max(beforeVar, 1);

  return Math.min(1, (meanShift + varChange) / 2);
}

/**
 * Calculates magnitude of change between two segments
 */
function calculateChangeMagnitude(before: TimeSeriesPoint[], after: TimeSeriesPoint[]): number {
  if (before.length < 2 || after.length < 2) return 0;

  const beforeMean = before.reduce((sum, p) => sum + p.value, 0) / before.length;
  const afterMean = after.reduce((sum, p) => sum + p.value, 0) / after.length;
  
  const beforeStd = Math.sqrt(
    before.reduce((sum, p) => sum + Math.pow(p.value - beforeMean, 2), 0) / before.length
  );
  
  const afterStd = Math.sqrt(
    after.reduce((sum, p) => sum + Math.pow(p.value - afterMean, 2), 0) / after.length
  );

  const meanChange = Math.abs(afterMean - beforeMean);
  const stdChange = Math.abs(afterStd - beforeStd);

  return Math.min(1, (meanChange / Math.max(beforeStd, 1) + stdChange / Math.max(beforeStd, 1)) / 2);
}

/**
 * Merges nearby change points to avoid duplicates
 */
function mergeNearbyChanges(changes: ChangePoint[], windowSize: number): ChangePoint[] {
  if (changes.length <= 1) return changes;

  const merged: ChangePoint[] = [changes[0]];
  let lastChange = changes[0];

  for (let i = 1; i < changes.length; i++) {
    const current = changes[i];
    const timeDiff = new Date(current.timestamp).getTime() - new Date(lastChange.timestamp).getTime();

    if (timeDiff > windowSize * 1000) { // Convert windowSize to milliseconds
      merged.push(current);
      lastChange = current;
    } else if (current.confidence > lastChange.confidence) {
      // Replace last change with higher confidence one
      merged[merged.length - 1] = current;
      lastChange = current;
    }
  }

  return merged;
}

/**
 * Detect change points in time series data
 */
export function detectChangePoints(
  data: TimeSeriesPoint[],
  sensitivity: number
): ChangePoint[] {
  if (sensitivity <= 0 || sensitivity >= 1) {
    throw new Error('Sensitivity must be between 0 and 1');
  }

  // Remove outliers first
  const cleanData = removeOutliers(data);
  
  // Detect temporal changes
  const changes: ChangePoint[] = [];
  const windowSize = Math.max(5, Math.floor(cleanData.length * 0.1));

  for (let i = windowSize; i < cleanData.length - windowSize; i++) {
    const before = cleanData.slice(i - windowSize, i);
    const after = cleanData.slice(i, i + windowSize);

    const beforeTrend = getTrendDirection(before);
    const afterTrend = getTrendDirection(after);

    if (beforeTrend !== afterTrend) {
      const confidence = calculateChangeConfidence(before, after);
      if (confidence >= sensitivity) {
        changes.push({
          timestamp: cleanData[i].timestamp,
          confidence,
          previousTrend: beforeTrend,
          newTrend: afterTrend,
          magnitude: calculateChangeMagnitude(before, after)
        });
      }
    }
  }

  // Merge nearby changes
  return mergeNearbyChanges(changes, windowSize);
}
