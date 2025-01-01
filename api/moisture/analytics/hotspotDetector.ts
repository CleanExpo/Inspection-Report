import { logger } from '../utils/logger';

import { AnalyticsMoistureReading, Hotspot } from './types';

type SpatialReading = Required<AnalyticsMoistureReading>;

/**
 * Detects moisture hotspots in spatial moisture readings
 */
export class HotspotDetector {
  /**
   * Configuration constants
   */
  private static readonly MIN_READINGS = 5;
  private static readonly HOTSPOT_THRESHOLD = 15; // Moisture value threshold
  private static readonly CLUSTER_RADIUS = 2.0;   // Meters
  private static readonly MIN_CLUSTER_SIZE = 3;   // Minimum points to form a hotspot

  /**
   * Calculates the 3D distance between two points
   */
  private calculateDistance(p1: Required<AnalyticsMoistureReading>, p2: Required<AnalyticsMoistureReading>): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Groups nearby points into clusters
   */
  private clusterPoints(points: Required<AnalyticsMoistureReading>[]): Required<AnalyticsMoistureReading>[][] {
    const clusters: SpatialReading[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;

      const cluster: SpatialReading[] = [];
      const queue: number[] = [i];
      visited.add(i);

      while (queue.length > 0) {
        const currentIndex = queue.shift()!;
        const currentPoint = points[currentIndex];
        cluster.push(currentPoint);

        // Find neighbors
        for (let j = 0; j < points.length; j++) {
          if (visited.has(j)) continue;

          if (this.calculateDistance(currentPoint, points[j]) <= HotspotDetector.CLUSTER_RADIUS) {
            queue.push(j);
            visited.add(j);
          }
        }
      }

      if (cluster.length >= HotspotDetector.MIN_CLUSTER_SIZE) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Creates a hotspot from a cluster of points
   */
  private createHotspot(cluster: Required<AnalyticsMoistureReading>[]): Hotspot {
    const sum = cluster.reduce(
      (acc, reading) => ({
        x: acc.x + reading.x,
        y: acc.y + reading.y,
        z: acc.z + reading.z,
        value: acc.value + reading.value
      }),
      { x: 0, y: 0, z: 0, value: 0 }
    );

    const count = cluster.length;
    const center = {
      x: sum.x / count,
      y: sum.y / count,
      z: sum.z / count
    };

    const maxReading = cluster.reduce(
      (max, reading) => reading.value > max.value ? reading : max,
      cluster[0]
    );

    // Find the maximum distance from center to any point
    const radius = Math.max(
      ...cluster.map(p => 
        this.calculateDistance(p, { ...p, x: center.x, y: center.y, z: center.z })
      )
    );

    return {
      centerX: center.x,
      centerY: center.y,
      centerZ: center.z,
      radius: radius,
      averageValue: sum.value / count,
      maxValue: maxReading.value,
      readingCount: count,
      location: cluster[0].location,
      timestamp: new Date(Math.max(...cluster.map(p => p.timestamp.getTime())))
    };
  }

  /**
   * Analyzes spatial moisture readings to detect hotspots
   * @param readings Array of spatial moisture readings
   * @returns Array of detected hotspots
   * @throws Error if insufficient data for analysis
   */
  public detectHotspots(readings: Required<AnalyticsMoistureReading>[]): Hotspot[] {
    if (readings.length < HotspotDetector.MIN_READINGS) {
      const error = `Insufficient data for hotspot detection. Need at least ${HotspotDetector.MIN_READINGS} readings.`;
      logger.warn(error);
      throw new Error(error);
    }

    // Filter readings above threshold
    const highMoisturePoints = readings.filter(
      reading => reading.value >= HotspotDetector.HOTSPOT_THRESHOLD
    );

    if (highMoisturePoints.length === 0) {
      return [];
    }

    // Group high moisture points into clusters
    const clusters = this.clusterPoints(highMoisturePoints);
    
    // Convert clusters to hotspots
    return clusters.map(cluster => this.createHotspot(cluster));
  }
}
