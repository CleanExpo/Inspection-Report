import {
  HistoryEntry,
  ChangeType,
  EntityType,
  ReadingHistory,
  TrendAnalysis,
  ComparisonResult,
  HistoryReport,
  HistoryFilter,
  TrendDetectionOptions,
  ComparisonOptions,
  ExportOptions,
  RollbackOptions,
  AuditLogEntry,
  VersionInfo
} from '../types/history';
import crypto from 'crypto';

export class HistoryTrackingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HistoryTrackingError';
  }
}

/**
 * Creates a history entry for an entity change
 */
export function createHistoryEntry(
  entityId: string,
  entityType: EntityType,
  changeType: ChangeType,
  userId: string,
  previousState: any,
  newState: any,
  metadata?: Record<string, any>
): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    entityId,
    entityType,
    changeType,
    timestamp: new Date(),
    userId,
    previousVersion: previousState ? JSON.stringify(previousState) : undefined,
    newVersion: JSON.stringify(newState),
    metadata
  };
}

/**
 * Creates a version info object for version control
 */
export function createVersionInfo(
  entityId: string,
  entityType: EntityType,
  state: any,
  parentVersion?: string,
  branchName?: string,
  tags?: string[],
  changeDescription?: string
): VersionInfo {
  const stateString = JSON.stringify(state);
  const hash = crypto
    .createHash('sha256')
    .update(stateString)
    .digest('hex');

  return {
    versionId: crypto.randomUUID(),
    entityId,
    entityType,
    timestamp: new Date(),
    hash,
    parentVersion,
    branchName,
    tags,
    state: stateString,
    changeDescription
  };
}

/**
 * Analyzes trends in reading history
 */
export function analyzeTrends(
  history: ReadingHistory,
  options: TrendDetectionOptions
): TrendAnalysis {
  if (history.values.length < options.minDataPoints) {
    throw new HistoryTrackingError(
      `Insufficient data points. Required: ${options.minDataPoints}, Got: ${history.values.length}`
    );
  }

  // Calculate basic statistics
  const values = history.values.map(v => v.value);
  const statistics = calculateStatistics(values);

  // Detect trend
  const trend = detectTrend(values, options.smoothingFactor);

  // Find anomalies
  const anomalies = detectAnomalies(
    history.values,
    statistics,
    options.anomalyThreshold
  );

  // Calculate confidence
  const confidence = calculateTrendConfidence(
    values,
    trend,
    options.confidenceThreshold
  );

  return {
    readingId: history.readingId,
    period: {
      start: history.values[0].timestamp,
      end: history.values[history.values.length - 1].timestamp
    },
    statistics,
    trend,
    confidence,
    anomalies
  };
}

/**
 * Compares multiple reading histories
 */
export function compareReadings(
  histories: ReadingHistory[],
  options: ComparisonOptions
): ComparisonResult {
  if (histories.length < 2) {
    throw new HistoryTrackingError('At least two readings are required for comparison');
  }

  const readingIds = histories.map(h => h.readingId);
  const allValues = histories.map(h => h.values);

  // Align timestamps if needed
  const alignedValues = options.ignoreTimestamps
    ? alignValuesByIndex(allValues)
    : alignValuesByTimestamp(allValues);

  // Calculate differences
  const differences = calculateDifferences(alignedValues, options.tolerance);

  // Calculate correlation and similarity
  const correlation = calculateCorrelation(alignedValues);
  const similarityScore = calculateSimilarity(
    alignedValues,
    options.method,
    options.weightFactors
  );

  return {
    readingIds,
    period: {
      start: new Date(Math.min(...histories.map(h => h.values[0].timestamp.getTime()))),
      end: new Date(Math.max(...histories.map(h => h.values[h.values.length - 1].timestamp.getTime())))
    },
    differences,
    correlation,
    similarityScore
  };
}

/**
 * Generates a history report
 */
export function generateReport(
  entries: HistoryEntry[],
  trends?: TrendAnalysis[],
  comparisons?: ComparisonResult[],
  metadata?: Record<string, any>
): HistoryReport {
  if (!entries.length) {
    throw new HistoryTrackingError('No history entries provided');
  }

  // Group entries by change type
  const changesByType = entries.reduce((acc, entry) => {
    acc[entry.changeType] = (acc[entry.changeType] || 0) + 1;
    return acc;
  }, {} as Record<ChangeType, number>);

  return {
    id: crypto.randomUUID(),
    entityId: entries[0].entityId,
    entityType: entries[0].entityType,
    period: {
      start: entries[0].timestamp,
      end: entries[entries.length - 1].timestamp
    },
    changes: {
      total: entries.length,
      byType: changesByType
    },
    trends,
    comparisons,
    metadata,
    generatedAt: new Date()
  };
}

/**
 * Validates rollback operation
 */
export function validateRollback(
  entry: HistoryEntry,
  options: RollbackOptions
): void {
  if (!entry.previousVersion) {
    throw new HistoryTrackingError('Cannot rollback without previous version');
  }

  try {
    JSON.parse(entry.previousVersion);
  } catch (error) {
    throw new HistoryTrackingError('Invalid previous version format');
  }

  if (options.cascadeChanges) {
    // Additional validation for cascade operations would go here
  }
}

/**
 * Creates an audit log entry
 */
export function createAuditLogEntry(
  entry: HistoryEntry,
  ipAddress?: string,
  userAgent?: string,
  location?: { x: number; y: number; floor?: number },
  validationResults?: { isValid: boolean; errors: string[] }
): AuditLogEntry {
  return {
    ...entry,
    ipAddress,
    userAgent,
    location,
    validationResults
  };
}

// Helper functions

function calculateStatistics(values: number[]): TrendAnalysis['statistics'] {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const squareDiffs = values.map(value => Math.pow(value - average, 2));
  const standardDeviation = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average,
    median,
    standardDeviation
  };
}

function detectTrend(
  values: number[],
  smoothingFactor?: number
): TrendAnalysis['trend'] {
  const smoothed = smoothingFactor
    ? exponentialSmoothing(values, smoothingFactor)
    : values;

  const differences = smoothed
    .slice(1)
    .map((value, index) => value - smoothed[index]);
  
  const increasingCount = differences.filter(d => d > 0).length;
  const decreasingCount = differences.filter(d => d < 0).length;
  const stableCount = differences.filter(d => d === 0).length;

  const totalCount = differences.length;
  const threshold = 0.6; // 60% threshold for trend determination

  if (increasingCount / totalCount > threshold) return 'INCREASING';
  if (decreasingCount / totalCount > threshold) return 'DECREASING';
  if (stableCount / totalCount > threshold) return 'STABLE';
  return 'FLUCTUATING';
}

function detectAnomalies(
  values: ReadingHistory['values'],
  statistics: TrendAnalysis['statistics'],
  threshold: number
): TrendAnalysis['anomalies'] {
  const anomalies: TrendAnalysis['anomalies'] = [];
  const stdDevRange = statistics.standardDeviation * threshold;

  values.forEach(reading => {
    if (
      reading.value < statistics.average - stdDevRange ||
      reading.value > statistics.average + stdDevRange
    ) {
      anomalies.push({
        timestamp: reading.timestamp,
        value: reading.value,
        expectedRange: {
          min: statistics.average - stdDevRange,
          max: statistics.average + stdDevRange
        }
      });
    }
  });

  return anomalies;
}

function calculateTrendConfidence(
  values: number[],
  trend: TrendAnalysis['trend'],
  threshold: number
): number {
  let confidence = 1.0;

  // Reduce confidence based on data variability
  const stats = calculateStatistics(values);
  const variabilityFactor = stats.standardDeviation / stats.average;
  confidence *= Math.max(0, 1 - variabilityFactor);

  // Reduce confidence for fluctuating trends
  if (trend === 'FLUCTUATING') {
    confidence *= 0.7;
  }

  // Reduce confidence if below threshold
  if (confidence < threshold) {
    confidence *= 0.8;
  }

  return Math.max(0, Math.min(1, confidence));
}

function exponentialSmoothing(values: number[], alpha: number): number[] {
  const smoothed = [values[0]];
  for (let i = 1; i < values.length; i++) {
    smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

function alignValuesByTimestamp(
  allValues: ReadingHistory['values'][]
): ReadingHistory['values'][] {
  // Implementation would align values based on timestamps
  return allValues;
}

function alignValuesByIndex(
  allValues: ReadingHistory['values'][]
): ReadingHistory['values'][] {
  // Implementation would align values based on indices
  return allValues;
}

function calculateDifferences(
  alignedValues: ReadingHistory['values'][],
  tolerance: number
): ComparisonResult['differences'] {
  // Implementation would calculate differences between aligned values
  return [];
}

function calculateCorrelation(
  alignedValues: ReadingHistory['values'][]
): number {
  // Implementation would calculate correlation coefficient
  return 0;
}

function calculateSimilarity(
  alignedValues: ReadingHistory['values'][],
  method: ComparisonOptions['method'],
  weightFactors?: ComparisonOptions['weightFactors']
): number {
  // Implementation would calculate similarity score based on method
  return 0;
}
