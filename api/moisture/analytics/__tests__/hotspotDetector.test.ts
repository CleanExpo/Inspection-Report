import { HotspotDetector } from '../hotspotDetector';
import { generateCircularHotspot, generateSpatialReadings, generateMultipleHotspots } from '../../__tests__/spatialTestData';
import { AnalyticsMoistureReading } from '../types';

describe('HotspotDetector', () => {
  let detector: HotspotDetector;

  beforeEach(() => {
    detector = new HotspotDetector();
  });

  describe('detectHotspots', () => {
    it('should throw error for insufficient readings', () => {
      const readings = generateSpatialReadings(2);
      expect(() => detector.detectHotspots(readings)).toThrow('Insufficient data');
    });

    it('should return empty array when no readings above threshold', () => {
      const readings = generateCircularHotspot({ x: 0, y: 0, z: 0 }, 1.5).map(reading => ({
        ...reading,
        value: 10 // Below threshold of 15
      }));

      const result = detector.detectHotspots(readings);
      expect(result).toHaveLength(0);
    });

    it('should detect single hotspot from clustered readings', () => {
      const readings = generateCircularHotspot({ x: 0, y: 0, z: 0 }, 1.5);
      const isolatedPoint: Required<AnalyticsMoistureReading> = {
        value: 18,
        x: 10,
        y: 10,
        z: 0,
        timestamp: new Date(),
        location: 'Room1'
      };
      readings.push(isolatedPoint);

      const hotspots = detector.detectHotspots(readings);
      expect(hotspots).toHaveLength(1);
      expect(hotspots[0].readingCount).toBe(5); // 5 points in circular pattern
      expect(hotspots[0].location).toBe('Room1');
      expect(hotspots[0].maxValue).toBeGreaterThanOrEqual(20); // Base value from generator
    });

    it('should detect multiple separate hotspots', () => {
      const readings = generateMultipleHotspots([
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 0 }
      ]);

      const hotspots = detector.detectHotspots(readings);
      expect(hotspots).toHaveLength(2);
      expect(hotspots[0].readingCount).toBe(5); // 5 points per hotspot
      expect(hotspots[1].readingCount).toBe(5);
      expect(hotspots[0].maxValue).toBeGreaterThanOrEqual(20); // Base value from generator
      expect(hotspots[1].maxValue).toBeGreaterThanOrEqual(20);
    });

    it('should calculate accurate hotspot radius', () => {
      const centerPoint = { x: 5, y: 5, z: 0 };
      const radius = 1.5;
      const readings = generateCircularHotspot(centerPoint, radius);

      const hotspots = detector.detectHotspots(readings);
      expect(hotspots).toHaveLength(1);
      expect(hotspots[0].radius).toBeCloseTo(radius, 1);
      expect(hotspots[0].centerX).toBeCloseTo(centerPoint.x, 1);
      expect(hotspots[0].centerY).toBeCloseTo(centerPoint.y, 1);
      expect(hotspots[0].centerZ).toBeCloseTo(centerPoint.z, 1);
    });

    it('should only detect hotspots above threshold value', () => {
      const readings = generateCircularHotspot({ x: 0, y: 0, z: 0 }, 1.5);
      const thresholdReadings = generateCircularHotspot({ x: 10, y: 10, z: 0 }, 1.5).map(reading => ({
        ...reading,
        value: 14 // Just below threshold of 15
      }));

      const hotspots = detector.detectHotspots([...readings, ...thresholdReadings]);
      expect(hotspots).toHaveLength(1); // Only one hotspot above threshold
      expect(hotspots[0].maxValue).toBeGreaterThanOrEqual(20);
    });
  });
});
