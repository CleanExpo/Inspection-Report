import { logger } from '../utils/logger';

export type AggregationPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface MoistureReading {
  value: number;
  timestamp: Date;
  location: string;
}

export interface AggregationResult {
  period: AggregationPeriod;
  startTime: Date;
  endTime: Date;
  location: string;
  count: number;
  min: number;
  max: number;
  average: number;
  standardDeviation: number;
}

/**
 * Aggregates moisture readings over specified time periods
 */
export class DataAggregator {
  /**
   * Configuration constants
   */
  private static readonly MIN_READINGS = 2;
  private static readonly PERIOD_DURATIONS = {
    hourly: 60 * 60 * 1000,        // 1 hour in ms
    daily: 24 * 60 * 60 * 1000,    // 24 hours in ms
    weekly: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
    monthly: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
  };

  /**
   * Groups readings by time period and location
   * @param readings Array of moisture readings
   * @param period Aggregation time period
   * @returns Array of aggregation results
   * @throws Error if insufficient data for aggregation
   */
  /**
   * Calculates standard deviation for a set of values
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    
    const squareDiffs = values.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    
    const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculates statistical metrics for a group of readings
   */
  private calculateStats(readings: MoistureReading[]): {
    min: number;
    max: number;
    average: number;
    standardDeviation: number;
  } {
    const values = readings.map(r => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const standardDeviation = this.calculateStandardDeviation(values, average);

    return { min, max, average, standardDeviation };
  }

  public aggregate(readings: MoistureReading[], period: AggregationPeriod): AggregationResult[] {
    if (readings.length < DataAggregator.MIN_READINGS) {
      const error = `Insufficient data for aggregation. Need at least ${DataAggregator.MIN_READINGS} readings.`;
      logger.warn(error);
      throw new Error(error);
    }

    // Sort readings by timestamp
    const sortedReadings = [...readings].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Group readings by period and location
    const groups = this.groupReadings(sortedReadings, period);

    // Calculate statistics for each group
    return Array.from(groups.values()).map(group => {
      const stats = this.calculateStats(group);
      return {
        period,
        startTime: group[0].timestamp,
        endTime: group[group.length - 1].timestamp,
        location: group[0].location,
        count: group.length,
        ...stats
      };
    });
  }

  /**
   * Groups readings by time period and location
   */
  private groupReadings(readings: MoistureReading[], period: AggregationPeriod): Map<string, MoistureReading[]> {
    const groups = new Map<string, MoistureReading[]>();
    const periodDuration = DataAggregator.PERIOD_DURATIONS[period];

    for (const reading of readings) {
      const periodStart = new Date(
        Math.floor(reading.timestamp.getTime() / periodDuration) * periodDuration
      );
      const key = `${reading.location}-${periodStart.getTime()}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(reading);
    }

    return groups;
  }
}
