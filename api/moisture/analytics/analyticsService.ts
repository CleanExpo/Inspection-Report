import { logger } from '../utils/logger';
import { AnalyticsMoistureReading, TrendAnalysis, Hotspot, AggregationResult } from './types';
import { TrendCalculator } from './trendCalculator';
import { HotspotDetector } from './hotspotDetector';
import { DataAggregator } from './dataAggregator';
import { PerformanceOptimizer } from './performanceOptimizer';

interface AnalyticsResult {
  trends: TrendAnalysis;
  hotspots: Hotspot[];
  statistics: {
    hourly: AggregationResult[];
    daily: AggregationResult[];
  };
  timestamp: Date;
  readingCount: number;
}

/**
 * Coordinates moisture analytics operations
 */
export class AnalyticsService {
  private trendCalculator: TrendCalculator;
  private hotspotDetector: HotspotDetector;
  private dataAggregator: DataAggregator;
  private optimizer: PerformanceOptimizer;

  constructor() {
    this.trendCalculator = new TrendCalculator();
    this.hotspotDetector = new HotspotDetector();
    this.dataAggregator = new DataAggregator();
    this.optimizer = new PerformanceOptimizer();
  }

  /**
   * Analyzes moisture readings to provide comprehensive insights
   */
  public async analyzeReadings(readings: AnalyticsMoistureReading[]): Promise<AnalyticsResult> {
    try {
      const [trends, hotspots, hourlyStats, dailyStats] = await Promise.all([
        this.getCachedTrends(readings),
        this.getCachedHotspots(readings),
        this.getCachedAggregation(readings, 'hourly'),
        this.getCachedAggregation(readings, 'daily')
      ]);

      return {
        trends,
        hotspots,
        statistics: {
          hourly: hourlyStats,
          daily: dailyStats
        },
        timestamp: new Date(),
        readingCount: readings.length
      };
    } catch (error) {
      logger.error('Analytics processing failed', { error });
      throw error;
    }
  }

  /**
   * Gets cached or calculates trend analysis
   */
  private getCachedTrends(readings: AnalyticsMoistureReading[]): Promise<TrendAnalysis> {
    const cacheKey = `trends-${this.getReadingsHash(readings)}`;
    return this.optimizer.getOrCalculate(cacheKey, () => 
      this.trendCalculator.calculateTrend(readings)
    );
  }

  /**
   * Gets cached or calculates hotspots
   */
  private getCachedHotspots(readings: AnalyticsMoistureReading[]): Promise<Hotspot[]> {
    const cacheKey = `hotspots-${this.getReadingsHash(readings)}`;
    return this.optimizer.getOrCalculate(cacheKey, () => {
      // Filter readings with spatial data
      const spatialReadings = readings.filter(
        (r): r is AnalyticsMoistureReading & Required<Pick<AnalyticsMoistureReading, 'x' | 'y' | 'z'>> =>
        typeof r.x === 'number' && typeof r.y === 'number' && typeof r.z === 'number'
      );
      return this.hotspotDetector.detectHotspots(spatialReadings);
    });
  }

  /**
   * Gets cached or calculates data aggregation
   */
  private getCachedAggregation(readings: AnalyticsMoistureReading[], period: 'hourly' | 'daily'): Promise<AggregationResult[]> {
    const cacheKey = `aggregation-${period}-${this.getReadingsHash(readings)}`;
    return this.optimizer.getOrCalculate(cacheKey, () =>
      this.dataAggregator.aggregate(readings, period)
    );
  }

  /**
   * Generates a simple hash for readings to use as cache key
   */
  private getReadingsHash(readings: AnalyticsMoistureReading[]): string {
    return readings
      .map(r => `${r.timestamp.getTime()}-${r.value}-${r.location}`)
      .join('|');
  }
}
