import { processTimeSeries, calculateSMA, calculateEMA, analyzeTrend, detectChangePoints } from '../../api/moisture/analytics/core/trend';
import { TimeSeriesData, TimeSeriesPoint, TrendAnalysis, ChangePoint, SMAResult } from '../../api/moisture/analytics/types';

describe('Trend Analysis', () => {
  // Test data setup
  const testData: TimeSeriesPoint[] = [
    {
      timestamp: '2024-01-01T00:00:00Z',
      value: 10,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    },
    {
      timestamp: '2024-01-01T01:00:00Z',
      value: 12,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    },
    {
      timestamp: '2024-01-01T02:00:00Z',
      value: 15,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    },
    {
      timestamp: '2024-01-01T03:00:00Z',
      value: 13,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    },
    {
      timestamp: '2024-01-01T04:00:00Z',
      value: 11,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    },
    {
      timestamp: '2024-01-01T05:00:00Z',
      value: 14,
      metadata: {
        room: 'room1',
        floor: '1',
        locationX: 0,
        locationY: 0
      }
    }
  ];

  const timeSeriesData: TimeSeriesData = {
    points: testData,
    interval: 'hourly',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-02T00:00:00Z'
  };

  describe('Time Series Processing', () => {
    test('processes time series data correctly', () => {
      const processed = processTimeSeries(timeSeriesData);
      
      expect(processed.rawData).toHaveLength(testData.length);
      expect(processed.normalizedData).toBeDefined();
      expect(processed.samplingRate).toBeGreaterThan(0);
      expect(processed.gaps).toBeInstanceOf(Array);
    });

    test('handles missing data points', () => {
      const sparseData = {
        ...timeSeriesData,
        points: testData.filter((_: TimeSeriesPoint, i: number) => i % 2 === 0) // Create gaps
      };

      const processed = processTimeSeries(sparseData);
      expect(processed.gaps).toHaveLength(expect.any(Number));
      expect(processed.normalizedData).toBeDefined();
    });

    test('validates input data format', () => {
      const invalidData = {
        ...timeSeriesData,
        interval: 'invalid' as any
      };

      expect(() => processTimeSeries(invalidData)).toThrow();
    });
  });

  describe('Moving Averages', () => {
    test('calculates simple moving average', () => {
      const sma = calculateSMA(testData, {
        windowSize: 3,
        centered: true
      });

      expect(sma).toHaveLength(testData.length - 2); // Account for window size
      sma.forEach((point: SMAResult) => {
        expect(point).toMatchObject({
          timestamp: expect.any(String),
          value: expect.any(Number),
          windowStart: expect.any(String),
          windowEnd: expect.any(String)
        });
      });
    });

    test('calculates exponential moving average', () => {
      const ema = calculateEMA(testData, {
        alpha: 0.2
      });

      expect(ema).toHaveLength(testData.length);
      ema.forEach((point: SMAResult) => {
        expect(point.value).toBeGreaterThanOrEqual(0);
      });
    });

    test('handles edge cases in moving averages', () => {
      // Test with minimum window size
      const minSMA = calculateSMA(testData, {
        windowSize: 2,
        centered: false
      });
      expect(minSMA).toBeDefined();

      // Test with window size equal to data length
      const maxSMA = calculateSMA(testData, {
        windowSize: testData.length,
        centered: false
      });
      expect(maxSMA).toBeDefined();
    });
  });

  describe('Trend Detection', () => {
    test('identifies increasing trends', () => {
      const increasingData = testData.map((point: TimeSeriesPoint, i: number) => ({
        ...point,
        value: point.value + i // Create increasing trend
      }));

      const trend = analyzeTrend(increasingData);
      expect(trend.overall.slope).toBeGreaterThan(0);
    });

    test('identifies decreasing trends', () => {
      const decreasingData = testData.map((point: TimeSeriesPoint, i: number) => ({
        ...point,
        value: point.value - i // Create decreasing trend
      }));

      const trend = analyzeTrend(decreasingData);
      expect(trend.overall.slope).toBeLessThan(0);
    });

    test('calculates trend strength', () => {
      const trend = analyzeTrend(testData);
      expect(trend.overall.r2).toBeGreaterThanOrEqual(0);
      expect(trend.overall.r2).toBeLessThanOrEqual(1);
    });

    test('detects change points', () => {
      const changes = detectChangePoints(testData, 0.05);
      
      changes.forEach((change: ChangePoint) => {
        expect(change).toMatchObject({
          timestamp: expect.any(String),
          confidence: expect.any(Number),
          previousTrend: expect.stringMatching(/increasing|decreasing|stable/),
          newTrend: expect.stringMatching(/increasing|decreasing|stable/),
          magnitude: expect.any(Number)
        });
      });
    });
  });
});
