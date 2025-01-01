import { Point2D, TrendLine, TrendAnalysis, TimeSeriesPoint } from '../types';
import { removeOutliers } from './validation';

/**
 * Calculates linear regression for a set of points
 */
function calculateLinearRegression(points: Point2D[]): TrendLine {
  if (points.length < 2) {
    throw new Error('Insufficient points for linear regression');
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const correlation = calculateCorrelation(points);
  const r2 = correlation * correlation;

  return {
    slope,
    intercept,
    r2
  };
}

/**
 * Helper function to calculate correlation coefficient
 */
function calculateCorrelation(points: Point2D[]): number {
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
    sumYY += point.y * point.y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Finds segments in time series data where trend changes significantly
 */
function findTrendSegments(points: Point2D[]): Array<{
  start: number;
  end: number;
  slope: number;
  intercept: number;
}> {
  if (points.length < 4) {
    return [{
      start: 0,
      end: points.length - 1,
      slope: 0,
      intercept: points[0]?.y ?? 0
    }];
  }

  const segments: Array<{
    start: number;
    end: number;
    slope: number;
    intercept: number;
  }> = [];
  
  let startIdx = 0;
  const minSegmentLength = Math.max(3, Math.floor(points.length * 0.05));

  while (startIdx < points.length - minSegmentLength) {
    let bestEndIdx = startIdx + minSegmentLength;
    let bestError = Infinity;
    let bestRegression: TrendLine | null = null;

    // Try different segment lengths
    for (let endIdx = startIdx + minSegmentLength; endIdx < points.length; endIdx++) {
      const segment = points.slice(startIdx, endIdx + 1);
      const regression = calculateLinearRegression(segment);
      const error = calculateRegressionError(segment, regression);

      if (error < bestError) {
        bestError = error;
        bestEndIdx = endIdx;
        bestRegression = regression;
      } else if (error > bestError * 1.5) {
        // If error increases significantly, we've found a trend change
        break;
      }
    }

    if (bestRegression) {
      segments.push({
        start: startIdx,
        end: bestEndIdx,
        slope: bestRegression.slope,
        intercept: bestRegression.intercept
      });
    }

    startIdx = bestEndIdx + 1;
  }

  // Add final segment if needed
  if (startIdx < points.length - 1) {
    const finalRegression = calculateLinearRegression(points.slice(startIdx));
    segments.push({
      start: startIdx,
      end: points.length - 1,
      slope: finalRegression.slope,
      intercept: finalRegression.intercept
    });
  }

  return segments;
}

/**
 * Helper function to calculate regression error
 */
function calculateRegressionError(points: Point2D[], regression: TrendLine): number {
  return points.reduce((error, point) => {
    const predicted = regression.slope * point.x + regression.intercept;
    return error + Math.pow(predicted - point.y, 2);
  }, 0) / points.length;
}

/**
 * Analyze trends in time series data
 */
export function analyzeTrend(data: TimeSeriesPoint[]): TrendAnalysis {
  // Remove outliers first
  const cleanData = removeOutliers(data);
  
  // Convert to points for analysis
  const points = cleanData.map((p: TimeSeriesPoint, i: number) => ({
    x: i,
    y: p.value
  }));

  // Calculate overall trend
  const overall = calculateLinearRegression(points);
  
  // Find trend segments
  const segments = findTrendSegments(points);

  return {
    overall,
    segments: segments.map(segment => ({
      startDate: cleanData[segment.start].timestamp,
      endDate: cleanData[segment.end].timestamp,
      trend: {
        slope: segment.slope,
        intercept: segment.intercept,
        r2: calculateLinearRegression(
          points.slice(segment.start, segment.end + 1)
        ).r2
      }
    }))
  };
}
