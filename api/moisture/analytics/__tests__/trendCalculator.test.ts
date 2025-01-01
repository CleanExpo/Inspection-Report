import { TrendCalculator } from '../trendCalculator';
import { generateTrendReadings } from '../../__tests__/analyticsTestData';

describe('TrendCalculator', () => {
  let calculator: TrendCalculator;

  beforeEach(() => {
    calculator = new TrendCalculator();
  });

  describe('calculateTrend', () => {
    it('should throw error for insufficient readings', () => {
      const readings = generateTrendReadings('increasing', 2);
      expect(() => calculator.calculateTrend(readings)).toThrow('Insufficient data');
    });

    it('should detect increasing trend', () => {
      const readings = generateTrendReadings('increasing');
      const result = calculator.calculateTrend(readings);
      expect(result.trend).toBe('increasing');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect decreasing trend', () => {
      const readings = generateTrendReadings('decreasing');
      const result = calculator.calculateTrend(readings);
      expect(result.trend).toBe('decreasing');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect stable trend for minor changes', () => {
      const readings = generateTrendReadings('stable');
      const result = calculator.calculateTrend(readings);
      expect(result.trend).toBe('stable');
    });

    it('should calculate accurate change rate', () => {
      const readings = [
        { value: 10, timestamp: new Date('2024-01-01T00:00:00Z'), location: 'Room1' },
        { value: 11, timestamp: new Date('2024-01-01T01:00:00Z'), location: 'Room1' },
        { value: 12, timestamp: new Date('2024-01-01T02:00:00Z'), location: 'Room1' }
      ];

      const result = calculator.calculateTrend(readings);
      expect(result.changeRate).toBeCloseTo(1.0, 1); // Approximately 1 unit per hour
      expect(result.periodStart).toEqual(readings[0].timestamp);
      expect(result.periodEnd).toEqual(readings[2].timestamp);
      expect(result.location).toBe('Room1');
    });
  });
});
