import { AnalyticsService } from '../analyticsService';
import { 
  spatialReadings, 
  basicReadings, 
  generateTimeBasedReadings 
} from '../../__tests__/testData';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  describe('analyzeReadings', () => {
    it('should provide comprehensive analysis of moisture readings', async () => {
      // Combine spatial and trend readings
      const trendReadings = generateTimeBasedReadings({
        baseTime: new Date('2024-01-01T11:00:00Z'),
        location: 'Room1',
        intervals: [
          { offsetHours: 0, value: 18 },
          { offsetHours: 1, value: 16 },
          { offsetHours: 2, value: 15 }
        ]
      });

      const readings = [...spatialReadings, ...trendReadings];
      const result = await service.analyzeReadings(readings);

      // Verify structure
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('hotspots');
      expect(result).toHaveProperty('statistics');
      expect(result.statistics).toHaveProperty('hourly');
      expect(result.statistics).toHaveProperty('daily');

      // Verify trend detection
      expect(result.trends.trend).toBe('decreasing');
      expect(result.trends.confidence).toBeGreaterThan(0);

      // Verify hotspot detection
      expect(result.hotspots).toHaveLength(1);
      expect(result.hotspots[0].maxValue).toBe(25);

      // Verify statistics
      expect(result.statistics.hourly).toHaveLength(4); // 4 different hours
      expect(result.statistics.daily).toHaveLength(1);  // All in same day

      // Verify metadata
      expect(result.readingCount).toBe(6);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle readings without spatial data', async () => {
      const result = await service.analyzeReadings(basicReadings);
      expect(result.hotspots).toHaveLength(0); // No hotspots without spatial data
      expect(result.trends).toBeDefined(); // Should still calculate trends
      expect(result.statistics.hourly).toHaveLength(3); // 3 different hours
    });

    it('should cache results for identical readings', async () => {
      // First call
      const result1 = await service.analyzeReadings(basicReadings);
      // Second call with same data
      const result2 = await service.analyzeReadings(basicReadings);

      expect(result2).toEqual(result1);
    });

    it('should handle mixed spatial and non-spatial data', async () => {
      const mixedReadings = [
        ...spatialReadings.slice(0, 1), // Take one spatial reading
        ...basicReadings.slice(0, 2)    // Take two basic readings
      ];

      const result = await service.analyzeReadings(mixedReadings);
      expect(result.hotspots).toHaveLength(0); // Not enough spatial readings for hotspot
      expect(result.trends).toBeDefined();
      expect(result.readingCount).toBe(3);
    });
  });
});
