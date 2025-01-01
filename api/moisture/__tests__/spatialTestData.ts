import { AnalyticsMoistureReading } from '../analytics/types';

export const generateSpatialReadings = (count: number = 3): Required<AnalyticsMoistureReading>[] => {
  return Array(count).fill(null).map((_, i) => ({
    value: 20 + i,
    timestamp: new Date(`2024-01-01T${10 + i}:00:00Z`),
    location: 'Room1',
    x: i,
    y: 0,
    z: 0
  }));
};

interface SpatialPoint {
  x: number;
  y: number;
  z: number;
}

export const generateCircularHotspot = (
  center: SpatialPoint,
  radius: number = 1.5
): Required<AnalyticsMoistureReading>[] => {
  const readings: Required<AnalyticsMoistureReading>[] = [
    // Center point
    {
      value: 20,
      x: center.x,
      y: center.y,
      z: center.z,
      timestamp: new Date(),
      location: 'Room1'
    }
  ];

  // Points on circle
  [
    [center.x + radius, center.y],
    [center.x - radius, center.y],
    [center.x, center.y + radius],
    [center.x, center.y - radius]
  ].forEach(([x, y], i) => {
    readings.push({
      value: 20 + i,
      x,
      y,
      z: center.z,
      timestamp: new Date(),
      location: 'Room1'
    });
  });

  return readings as Required<AnalyticsMoistureReading>[];
};

export const generateMultipleHotspots = (centers: SpatialPoint[]): Required<AnalyticsMoistureReading>[] => {
  return centers.flatMap(center => generateCircularHotspot(center));
};
