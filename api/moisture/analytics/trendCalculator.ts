import { logger } from '../utils/logger';
import { AnalyticsMoistureReading, TrendAnalysis } from './types';

/**
 * Calculates moisture reading trends over time
 */
export class TrendCalculator {
  /**
   * Configuration constants
   */
  private static readonly MIN_READINGS = 3;
  private static readonly TREND_THRESHOLD = 0.1;
  private static readonly MS_PER_HOUR = 60 * 60 * 1000;

  /**
   * Calculates the linear regression slope for moisture readings
   * @param readings Sorted array of moisture readings
   * @returns Slope of the regression line (change per millisecond)
   */
  private calculateSlope(readings: AnalyticsMoistureReading[]): number {
    const n = readings.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (const reading of readings) {
      const x = reading.timestamp.getTime();
      const y = reading.value;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Calculates confidence score based on data consistency
   * @param readings Sorted array of moisture readings
   * @param slope Calculated trend slope
   * @returns Confidence score between 0 and 1
   */
  private calculateConfidence(readings: AnalyticsMoistureReading[], slope: number): number {
    const n = readings.length;
    const predictedValues = readings.map(r => {
      const x = r.timestamp.getTime();
      const meanX = readings.reduce((sum, r) => sum + r.timestamp.getTime(), 0) / n;
      return slope * (x - meanX);
    });
    
    const actualValues = readings.map(r => r.value);
    const meanY = actualValues.reduce((sum, y) => sum + y, 0) / n;
    
    const ssRes = predictedValues.reduce((sum, yHat, i) => 
      sum + Math.pow(actualValues[i] - yHat, 2), 0);
    const ssTot = actualValues.reduce((sum, y) => 
      sum + Math.pow(y - meanY, 2), 0);
    
    // R-squared value as confidence
    return Math.max(0, 1 - (ssRes / ssTot));
  }

  public calculateTrend(readings: AnalyticsMoistureReading[]): TrendAnalysis {
    if (readings.length < TrendCalculator.MIN_READINGS) {
      const error = `Insufficient data for trend analysis. Need at least ${TrendCalculator.MIN_READINGS} readings.`;
      logger.warn(error);
      throw new Error(error);
    }

    // Sort readings by timestamp
    const sortedReadings = [...readings].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate trend slope (change per millisecond)
    const slope = this.calculateSlope(sortedReadings);
    
    // Convert to change per hour for better readability
    const changeRate = slope * TrendCalculator.MS_PER_HOUR;
    
    // Determine trend direction
    const trend = changeRate > TrendCalculator.TREND_THRESHOLD ? 'increasing' :
                 changeRate < -TrendCalculator.TREND_THRESHOLD ? 'decreasing' : 'stable';
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(sortedReadings, slope);

    return {
      trend,
      changeRate,
      periodStart: sortedReadings[0].timestamp,
      periodEnd: sortedReadings[sortedReadings.length - 1].timestamp,
      location: sortedReadings[0].location,
      confidence
    };
  }
}
