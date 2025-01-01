import {
  TimeSeriesData,
  TimeSeriesPoint,
  ProcessedTimeSeries,
  SMAConfig,
  EMAConfig,
  SMAResult,
  TrendAnalysis,
  TrendLine,
  Point2D
} from '../types';

/**
 * Validates time series data for required properties and formats
 */
function validateTimeSeriesData(data: TimeSeriesData): void {
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
 * Removes statistical outliers from time series data
 */
function removeOutliers(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
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

/**
 * Type guard to validate metadata object
 */
function isValidMetadata(metadata: any): metadata is { room: string; floor: string; locationX: number; locationY: number } {
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
interface ValidTimeSeriesPoint {
  timestamp: string;
  value: number;
  metadata: {
    room: string;
    floor: string;
    locationX: number;
    locationY: number;
  };
}

function isValidTimeSeriesPoint(point: any): point is ValidTimeSeriesPoint {
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
function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Generates a deterministic cache key for SMA calculations
 */
// Caches for expensive calculations
const smaCache = new Map<string, TimeSeriesPoint[]>();
const regressionCache = new Map<string, TrendLine>();
const varianceCache = new Map<string, number>();

/**
 * Calculates Simple Moving Average (SMA) for time series data with caching
 */
function calculateSMA(data: TimeSeriesPoint[], config: SMAConfig): TimeSeriesPoint[] {
  const { windowSize, centered } = config;
  if (windowSize < 1 || windowSize > data.length) {
    throw new Error('Invalid window size for SMA calculation');
  }

  // Validate data array
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data array: must be non-empty array of TimeSeriesPoint');
  }

  // Validate all points in the array
  for (let i = 0; i < data.length; i++) {
    if (!isValidTimeSeriesPoint(data[i])) {
      throw new Error(`Invalid TimeSeriesPoint at index ${i}`);
    }
  }

  // After validation, we know data array has at least one element and all elements are valid
  if (data.length < 2) {
    throw new Error('Invalid time series data: Need at least 2 points');
  }

  // We've already validated that data has at least 2 points
  if (data.length < 2) {
    throw new Error('Invalid time series data: Need at least 2 points');
  }

  // Validate first and last points explicitly
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  if (!isValidTimeSeriesPoint(firstPoint) || !isValidTimeSeriesPoint(lastPoint)) {
    throw new Error('Invalid time series data: Invalid points');
  }

  // Now TypeScript knows these points are valid
  const cacheKey = `${data.length}-${windowSize}-${centered}-${firstPoint.timestamp}-${lastPoint.timestamp}`;
  
  // Check cache first
  const cached = smaCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Optimize by pre-calculating window sums
  const values = data.map(p => p.value);
  let windowSum = values.slice(0, windowSize).reduce((a, b) => a + b, 0);
  const result: TimeSeriesPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, centered ? i - Math.floor(windowSize / 2) : i - windowSize + 1);
    const end = Math.min(data.length, centered ? i + Math.floor(windowSize / 2) + 1 : i + 1);
    
    // Update window sum efficiently
    if (i > 0) {
      windowSum = windowSum - (values[start - 1] || 0) + (values[end - 1] || 0);
    }

    const point = data[i];
    if (!isValidTimeSeriesPoint(point)) {
      throw new Error(`Invalid TimeSeriesPoint at index ${i}`);
    }

    // Since we've validated the point with isValidTimeSeriesPoint, we know these properties exist
    const validPoint: TimeSeriesPoint = {
      timestamp: point.timestamp,
      value: windowSum / (end - start),
      metadata: { ...point.metadata }
    };
    
    result.push(validPoint);
  }

// Cache management with LRU-like behavior
if (smaCache.size >= 100) {
    // Remove oldest 10% of entries when cache is full
    const keysToRemove = Array.from(smaCache.keys()).slice(0, 10);
    keysToRemove.forEach(key => smaCache.delete(key));
  }
  
  // Cache the result
  smaCache.set(cacheKey, result);

  return result;
}

// Cache for seasonality calculations
const seasonalityCache = new Map<string, number>();

/**
 * Detects seasonality in time series data using autocorrelation with optimized calculations
 */
function detectSeasonality(points: Point2D[]): number {
  if (points.length < 4) return 0;

  // Validate points data and create cache key
  const cacheKey = points.map(p => {
    if (typeof p.x !== 'number' || typeof p.y !== 'number') {
      throw new Error('Invalid point data: x and y must be numbers');
    }
    return `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
  }).join('|');
  
  // Check cache first
  const cached = seasonalityCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const values = points.map(p => p.y);
  const maxLag = Math.floor(points.length / 2);
  const correlations: number[] = [];
  
  // Pre-calculate mean and variance for efficiency
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  
  // Use TypedArray for better performance with numeric operations
  const deviations = new Float64Array(values.map(v => v - mean));

  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    const n = values.length - lag;
    
    // Optimized correlation calculation using pre-calculated deviations
    for (let i = 0; i < n; i++) {
      sum += deviations[i] * deviations[i + lag];
    }
    
    correlations.push(sum / (n * variance));
  }

  // Find the first significant peak
  let result = 0;
  for (let i = 1; i < correlations.length - 1; i++) {
    if (correlations[i] > correlations[i - 1] && 
        correlations[i] > correlations[i + 1] && 
        correlations[i] > 0.5) {
      result = i + 1;
      break;
    }
  }

  // Cache the result
  seasonalityCache.set(cacheKey, result);
  
  // Limit cache size
  if (seasonalityCache.size > 100) {
    const firstKey = seasonalityCache.keys().next().value;
    seasonalityCache.delete(firstKey);
  }

  return result;
}

/**
 * Removes seasonal component from time series data
 */
function removeSeasonality(points: Point2D[], period: number): Point2D[] {
  if (period <= 1 || points.length < period * 2) return points;

  const values = points.map(p => p.y);
  const seasonalPattern: number[] = new Array(period).fill(0);
  const seasonalCounts: number[] = new Array(period).fill(0);

  // Calculate average seasonal pattern
  for (let i = 0; i < values.length; i++) {
    const idx = i % period;
    seasonalPattern[idx] += values[i];
    seasonalCounts[idx]++;
  }

  for (let i = 0; i < period; i++) {
    seasonalPattern[i] /= seasonalCounts[i];
  }

  // Remove seasonal component
  return points.map((point, i) => ({
    x: point.x,
    y: point.y - seasonalPattern[i % period]
  }));
}

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
  const r2 = correlation * correlation; // R-squared is correlation coefficient squared

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
function findTrendSegments(points: Point2D[]): SegmentStats[] {
  if (points.length < 4) {
    return [{
      start: 0,
      end: points.length - 1,
      slope: 0,
      intercept: points[0]?.y ?? 0
    }];
  }

  const segments: SegmentStats[] = [];
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
 * Gets the direction of trend in time series data
 */
function getTrendDirection(points: TimeSeriesPoint[]): 'increasing' | 'decreasing' | 'stable' {
  if (points.length < 2) return 'stable';

  const regression = calculateLinearRegression(points.map((p, i) => ({ x: i, y: p.value })));
  const slope = regression.slope;
  const threshold = 0.1; // Minimum slope to consider as a trend

  if (Math.abs(slope) < threshold) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}

/**
 * Calculates confidence score for a change point
 */
function calculateChangeConfidence(before: TimeSeriesPoint[], after: TimeSeriesPoint[]): number {
  if (before.length < 2 || after.length < 2) return 0;

  const beforeRegression = calculateLinearRegression(before.map((p, i) => ({ x: i, y: p.value })));
  const afterRegression = calculateLinearRegression(after.map((p, i) => ({ x: i, y: p.value })));

  // Calculate angle between trends
  const beforeAngle = Math.atan(beforeRegression.slope);
  const afterAngle = Math.atan(afterRegression.slope);
  const angleDiff = Math.abs(afterAngle - beforeAngle);

  // Calculate variance change
  const beforeVar = calculateVariance(before.map(p => p.value));
  const afterVar = calculateVariance(after.map(p => p.value));
  const varRatio = Math.max(beforeVar, afterVar) / Math.min(beforeVar, afterVar);

  // Combine metrics
  const angleConfidence = Math.min(1, angleDiff / Math.PI);
  const varConfidence = Math.min(1, Math.log(varRatio) / Math.log(4));

  return (angleConfidence + varConfidence) / 2;
}

/**
 * Helper function to calculate variance
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
}

/**
 * Finds spatial cluster around a point
 */
function findSpatialCluster(point: TimeSeriesPoint): SpatialCluster {
  const { locationX, locationY } = point.metadata;
  
  return {
    centroid: { x: locationX, y: locationY },
    points: [{ x: locationX, y: locationY }],
    radius: 0,
    density: 1
  };
}

/**
 * Calculates spatial density around a point
 */
function calculateSpatialDensity(
  points: TimeSeriesPoint[],
  centerIdx: number,
  windowSize: number
): number {
  const center = points[centerIdx];
  const window = points.slice(
    Math.max(0, centerIdx - windowSize),
    Math.min(points.length, centerIdx + windowSize + 1)
  );

  let spatialCount = 0;
  const radius = 5; // Arbitrary radius for spatial density calculation

  for (const point of window) {
    const dx = point.metadata.locationX - center.metadata.locationX;
    const dy = point.metadata.locationY - center.metadata.locationY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      spatialCount++;
    }
  }

  return spatialCount / window.length;
}

/**
 * Calculates magnitude of change between two segments
 */
function calculateChangeMagnitude(before: TimeSeriesPoint[], after: TimeSeriesPoint[]): number {
  if (before.length < 2 || after.length < 2) return 0;

  const beforeMean = before.reduce((sum, p) => sum + p.value, 0) / before.length;
  const afterMean = after.reduce((sum, p) => sum + p.value, 0) / after.length;
  const beforeStd = Math.sqrt(calculateVariance(before.map(p => p.value)));
  const afterStd = Math.sqrt(calculateVariance(after.map(p => p.value)));

  const meanChange = Math.abs(afterMean - beforeMean);
  const stdChange = Math.abs(afterStd - beforeStd);

  return (meanChange / beforeStd + stdChange / beforeStd) / 2;
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

export type DataSummary = {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
};

export type GridSummary = {
  x: number;
  y: number;
  readings: DataSummary;
};

export type AggregatedData = {
  timestamp: string;
  value: number;
  confidence: number;
};

export type SegmentStats = {
  start: number;
  end: number;
  slope: number;
  intercept: number;
};

export type ChangeMetrics = {
  magnitude: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
};

export type SpatialCluster = {
  centroid: Point2D;
  points: Point2D[];
  radius: number;
  density: number;
};

export type ChangePoint = {
  timestamp: string;
  confidence: number;
  previousTrend: 'increasing' | 'decreasing' | 'stable';
  newTrend: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
  cluster?: SpatialCluster;
};

/**
 * Process time series data by normalizing and identifying gaps
 */
export function processTimeSeries(data: TimeSeriesData): ProcessedTimeSeries {
  validateTimeSeriesData(data);
  
  const sortedPoints = [...data.points].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const gaps = findGaps(sortedPoints, data.interval as 'hourly' | 'daily' | 'weekly');
  const normalizedData = normalizeTimeSeries(sortedPoints);
  const samplingRate = calculateSamplingRate(sortedPoints);

  return {
    rawData: sortedPoints,
    normalizedData,
    samplingRate,
    gaps
  };
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

  // Apply smoothing using SMA to reduce noise
  const smaConfig: SMAConfig = {
    windowSize: Math.max(3, Math.floor(cleanData.length * 0.1)),
    centered: true
  };
  const smoothedData = calculateSMA(cleanData, smaConfig);
  const smoothedPoints = smoothedData.map((p: TimeSeriesPoint, i: number) => ({
    x: i,
    y: p.value
  }));

  // Detect seasonality
  const seasonalityPeriod = detectSeasonality(points);
  let deseasonalizedPoints = points;
  
  if (seasonalityPeriod > 0) {
    deseasonalizedPoints = removeSeasonality(points, seasonalityPeriod);
  }

  // Calculate overall trend on deseasonalized data
  const overall = calculateLinearRegression(deseasonalizedPoints);
  
  // Find trend segments on smoothed data
  const segments = findTrendSegments(smoothedPoints);

  return {
    overall,
    segments: segments.map((segment: SegmentStats) => ({
      startDate: cleanData[segment.start].timestamp,
      endDate: cleanData[segment.end].timestamp,
      trend: calculateLinearRegression(deseasonalizedPoints.slice(segment.start, segment.end + 1))
    }))
  };
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
        // Get spatial cluster for this time point
        const spatialCluster = findSpatialCluster(cleanData[i]);
        const spatialDensity = calculateSpatialDensity(cleanData, i, windowSize);
        
        changes.push({
          timestamp: cleanData[i].timestamp,
          confidence: Math.min(1, confidence * spatialDensity),
          previousTrend: beforeTrend,
          newTrend: afterTrend,
          magnitude: calculateChangeMagnitude(before, after) * spatialDensity,
          cluster: spatialCluster
        });
      }
    }
  }

  // Merge nearby changes
  return mergeNearbyChanges(changes, windowSize);
}
