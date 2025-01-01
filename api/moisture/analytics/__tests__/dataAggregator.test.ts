import { DataAggregator } from '../dataAggregator';
import { generateTimeBasedReadings, generatePeriodReadings } from '../../__tests__/testData';

describe('DataAggregator', () => {
  let aggregator: DataAggregator;

  beforeEach(() => {
    aggregator = new DataAggregator();
  });

  describe('aggregate', () => {
    it('should throw error for insufficient readings', () => {
      const readings = [{
        value: 10,
        timestamp: new Date('2024-01-01'),
        location: 'Room1'
      }];

      expect(() => aggregator.aggregate(readings, 'hourly')).toThrow('Insufficient data');
    });

    it('should correctly group hourly readings', () => {
      const readings = generatePeriodReadings('hourly');
      const results = aggregator.aggregate(readings, 'hourly');
      
      expect(results).toHaveLength(2); // Two different hours
      expect(results[0].count).toBe(3); // First hour has 3 readings
      expect(results[1].count).toBe(1); // Second hour has 1 reading
    });

    it('should calculate correct statistics', () => {
      const readings = generateTimeBasedReadings({
        baseTime: new Date('2024-01-01T10:00:00Z'),
        location: 'Room1',
        intervals: [
          { offsetHours: 0, value: 10 },
          { offsetHours: 0.5, value: 20 }, // 30 minutes
          { offsetHours: 0.75, value: 30 } // 45 minutes
        ]
      });

      const results = aggregator.aggregate(readings, 'hourly');
      expect(results).toHaveLength(1);
      expect(results[0].min).toBe(10);
      expect(results[0].max).toBe(30);
      expect(results[0].average).toBe(20);
      expect(results[0].standardDeviation).toBeCloseTo(8.16, 2); // sqrt(((10-20)² + (20-20)² + (30-20)²) / 3)
    });

    it('should handle multiple locations separately', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      const room1Readings = generateTimeBasedReadings({
        baseTime,
        location: 'Room1',
        intervals: [
          { offsetHours: 0, value: 10 },
          { offsetHours: 0.5, value: 15 }
        ]
      });
      const room2Readings = generateTimeBasedReadings({
        baseTime,
        location: 'Room2',
        intervals: [
          { offsetHours: 0, value: 20 },
          { offsetHours: 0.5, value: 25 }
        ]
      });

      const results = aggregator.aggregate([...room1Readings, ...room2Readings], 'hourly');
      expect(results).toHaveLength(2); // One result per location
      expect(results.map(r => r.location)).toContain('Room1');
      expect(results.map(r => r.location)).toContain('Room2');
    });

    it('should handle different aggregation periods', () => {
      const readings = generatePeriodReadings('daily');

      // Test daily aggregation
      const dailyResults = aggregator.aggregate(readings, 'daily');
      expect(dailyResults).toHaveLength(4); // 4 different days

      // Test weekly aggregation
      const weeklyResults = aggregator.aggregate(readings, 'weekly');
      expect(weeklyResults).toHaveLength(2); // 2 different weeks

      // Test monthly aggregation
      const monthlyResults = aggregator.aggregate(readings, 'monthly');
      expect(monthlyResults).toHaveLength(1); // All in same month

      // Verify period boundaries
      const week2Data = weeklyResults.find(r => r.count === 2);
      expect(week2Data?.average).toBe(13.5); // (13 + 14) / 2
    });

    it('should handle weekly data correctly', () => {
      const readings = generatePeriodReadings('weekly');
      const results = aggregator.aggregate(readings, 'weekly');
      
      expect(results).toHaveLength(3); // 3 different weeks
      expect(results[0].count).toBe(2); // Week 1: 2 readings
      expect(results[1].count).toBe(1); // Week 2: 1 reading
      expect(results[2].count).toBe(1); // Week 3: 1 reading
    });

    it('should handle monthly data correctly', () => {
      const readings = generatePeriodReadings('monthly');
      const results = aggregator.aggregate(readings, 'monthly');
      
      expect(results).toHaveLength(2); // 2 different months
      expect(results[0].count).toBe(2); // Month 1: 2 readings
      expect(results[1].count).toBe(1); // Month 2: 1 reading
    });
  });
});
