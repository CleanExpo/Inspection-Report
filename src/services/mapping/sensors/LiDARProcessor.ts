import { LiDARData, LiDARPoint, SensorError } from '../../../types/mapping/sensors';
import { Point2D, Point3D, Boundary, Door, Window } from '../../../types/mapping/building';

export class LiDARProcessor {
  private static readonly MIN_POINTS_FOR_WALL = 10;
  private static readonly WALL_THICKNESS_THRESHOLD = 0.3; // meters
  private static readonly MIN_WALL_LENGTH = 0.5; // meters
  private static readonly DOOR_WIDTH_RANGE = { min: 0.7, max: 2.0 }; // meters
  private static readonly WINDOW_HEIGHT_RANGE = { min: 0.6, max: 2.1 }; // meters

  private lastValidReading: LiDARData | null = null;
  private errorLog: SensorError[] = [];
  private currentScan: Map<string, LiDARPoint[]> = new Map();

  /**
   * Process raw LiDAR data and detect room features
   */
  processReading(data: LiDARData): LiDARData | null {
    try {
      this.validateReading(data);
      this.currentScan.set(data.scanId, data.points);
      this.lastValidReading = data;
      return data;
    } catch (error) {
      this.logError(error as Error);
      return this.lastValidReading;
    }
  }

  /**
   * Detect room boundaries from point cloud
   */
  detectBoundary(): Boundary | null {
    if (!this.lastValidReading) return null;

    try {
      const walls = this.detectWalls(this.lastValidReading.points);
      if (walls.length < 3) return null;

      const orderedWalls = this.orderWallsClockwise(walls);
      const height = this.estimateRoomHeight(this.lastValidReading.points);

      return {
        points: this.extractCornerPoints(orderedWalls),
        height,
      };
    } catch (error) {
      this.logError(error as Error);
      return null;
    }
  }

  /**
   * Detect doors in the room
   */
  detectDoors(): Door[] {
    if (!this.lastValidReading) return [];

    try {
      const walls = this.detectWalls(this.lastValidReading.points);
      return this.findOpenings(walls, LiDARProcessor.DOOR_WIDTH_RANGE)
        .map(opening => ({
          start: opening.start,
          end: opening.end,
          isOpen: this.checkIfDoorOpen(opening, this.lastValidReading!.points),
          type: 'unknown',
        }));
    } catch (error) {
      this.logError(error as Error);
      return [];
    }
  }

  /**
   * Detect windows in the room
   */
  detectWindows(): Window[] {
    if (!this.lastValidReading) return [];

    try {
      const walls = this.detectWalls(this.lastValidReading.points);
      const windowOpenings = this.findOpenings(walls, LiDARProcessor.WINDOW_HEIGHT_RANGE);
      
      return windowOpenings.map(opening => {
        const sillHeight = this.estimateWindowSillHeight(opening, this.lastValidReading!.points);
        return {
          start: opening.start,
          end: opening.end,
          height: opening.end.y - opening.start.y,
          sillHeight,
        };
      });
    } catch (error) {
      this.logError(error as Error);
      return [];
    }
  }

  /**
   * Detect walls from point cloud data
   */
  private detectWalls(points: LiDARPoint[]): Point2D[][] {
    // Project points to 2D for wall detection
    const points2D = points.map(p => ({ x: p.x, y: p.y }));
    
    // Group points into potential walls using RANSAC
    const walls: Point2D[][] = [];
    let remainingPoints = [...points2D];

    while (remainingPoints.length >= LiDARProcessor.MIN_POINTS_FOR_WALL) {
      const wall = this.extractWallPoints(remainingPoints);
      if (wall.length >= LiDARProcessor.MIN_POINTS_FOR_WALL) {
        walls.push(wall);
        remainingPoints = remainingPoints.filter(p => !wall.includes(p));
      } else {
        break;
      }
    }

    return walls;
  }

  /**
   * Extract wall points using RANSAC algorithm
   */
  private extractWallPoints(points: Point2D[]): Point2D[] {
    // Simplified RANSAC implementation for wall detection
    const maxIterations = 100;
    let bestWall: Point2D[] = [];
    let bestInliers = 0;

    for (let i = 0; i < maxIterations; i++) {
      // Randomly select two points to form a line
      const p1 = points[Math.floor(Math.random() * points.length)];
      const p2 = points[Math.floor(Math.random() * points.length)];
      if (p1 === p2) continue;

      // Find points close to the line
      const wallPoints = points.filter(p => 
        this.pointToLineDistance(p, p1, p2) < LiDARProcessor.WALL_THICKNESS_THRESHOLD
      );

      if (wallPoints.length > bestInliers) {
        bestInliers = wallPoints.length;
        bestWall = wallPoints;
      }
    }

    return bestWall;
  }

  /**
   * Calculate distance from point to line
   */
  private pointToLineDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
    const numerator = Math.abs(
      (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x
    );
    const denominator = Math.sqrt(
      Math.pow(lineEnd.y - lineStart.y, 2) +
      Math.pow(lineEnd.x - lineStart.x, 2)
    );
    return numerator / denominator;
  }

  /**
   * Order walls in clockwise direction
   */
  private orderWallsClockwise(walls: Point2D[][]): Point2D[][] {
    // Calculate centroids for each wall
    const centroids = walls.map(wall => ({
      x: wall.reduce((sum, p) => sum + p.x, 0) / wall.length,
      y: wall.reduce((sum, p) => sum + p.y, 0) / wall.length,
    }));

    // Calculate room center
    const center = {
      x: centroids.reduce((sum, p) => sum + p.x, 0) / centroids.length,
      y: centroids.reduce((sum, p) => sum + p.y, 0) / centroids.length,
    };

    // Sort walls by angle from center
    return walls.sort((a, b) => {
      const angleA = Math.atan2(
        a[0].y - center.y,
        a[0].x - center.x
      );
      const angleB = Math.atan2(
        b[0].y - center.y,
        b[0].x - center.x
      );
      return angleA - angleB;
    });
  }

  /**
   * Extract corner points from ordered walls
   */
  private extractCornerPoints(walls: Point2D[][]): Point2D[] {
    const corners: Point2D[] = [];
    for (let i = 0; i < walls.length; i++) {
      const currentWall = walls[i];
      const nextWall = walls[(i + 1) % walls.length];
      
      // Find intersection of current and next wall
      const intersection = this.findWallIntersection(currentWall, nextWall);
      if (intersection) {
        corners.push(intersection);
      }
    }
    return corners;
  }

  /**
   * Find intersection point of two walls
   */
  private findWallIntersection(wall1: Point2D[], wall2: Point2D[]): Point2D | null {
    // Use first and last points of each wall to form lines
    const line1Start = wall1[0];
    const line1End = wall1[wall1.length - 1];
    const line2Start = wall2[0];
    const line2End = wall2[wall2.length - 1];

    // Calculate intersection
    const denominator = (line1End.x - line1Start.x) * (line2End.y - line2Start.y) -
                       (line1End.y - line1Start.y) * (line2End.x - line2Start.x);
    
    if (denominator === 0) return null;

    const t = ((line1Start.x - line2Start.x) * (line2End.y - line2Start.y) -
               (line1Start.y - line2Start.y) * (line2End.x - line2Start.x)) / denominator;

    return {
      x: line1Start.x + t * (line1End.x - line1Start.x),
      y: line1Start.y + t * (line1End.y - line1Start.y),
    };
  }

  /**
   * Find openings (doors/windows) in walls
   */
  private findOpenings(walls: Point2D[][], sizeRange: { min: number; max: number }): { start: Point2D; end: Point2D }[] {
    const openings: { start: Point2D; end: Point2D }[] = [];

    walls.forEach(wall => {
      // Sort points along wall
      const sortedPoints = [...wall].sort((a, b) => a.x - b.x);
      
      // Find gaps between points that match door/window size
      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const gap = Math.sqrt(
          Math.pow(sortedPoints[i + 1].x - sortedPoints[i].x, 2) +
          Math.pow(sortedPoints[i + 1].y - sortedPoints[i].y, 2)
        );

        if (gap >= sizeRange.min && gap <= sizeRange.max) {
          openings.push({
            start: sortedPoints[i],
            end: sortedPoints[i + 1],
          });
        }
      }
    });

    return openings;
  }

  /**
   * Check if a door is currently open
   */
  private checkIfDoorOpen(door: { start: Point2D; end: Point2D }, points: LiDARPoint[]): boolean {
    // Count points in door area
    const doorPoints = points.filter(p => 
      this.pointToLineDistance(p, door.start, door.end) < LiDARProcessor.WALL_THICKNESS_THRESHOLD
    );

    // If few points in door area, likely open
    return doorPoints.length < LiDARProcessor.MIN_POINTS_FOR_WALL;
  }

  /**
   * Estimate window sill height
   */
  private estimateWindowSillHeight(window: { start: Point2D; end: Point2D }, points: LiDARPoint[]): number {
    const windowPoints = points.filter(p =>
      this.pointToLineDistance(p, window.start, window.end) < LiDARProcessor.WALL_THICKNESS_THRESHOLD
    );

    if (windowPoints.length === 0) return 0;

    // Find lowest point in window area
    return Math.min(...windowPoints.map(p => p.z));
  }

  /**
   * Estimate room height from point cloud
   */
  private estimateRoomHeight(points: LiDARPoint[]): number {
    if (points.length === 0) return 0;
    
    // Find highest point that likely represents ceiling
    const maxHeight = Math.max(...points.map(p => p.z));
    return maxHeight;
  }

  /**
   * Validate LiDAR reading data integrity
   */
  private validateReading(data: LiDARData): void {
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      throw new Error('Invalid timestamp in LiDAR data');
    }

    if (!data.scanId || typeof data.scanId !== 'string') {
      throw new Error('Invalid scan ID');
    }

    if (!Array.isArray(data.points) || data.points.length === 0) {
      throw new Error('Empty or invalid points array');
    }

    data.points.forEach((point, index) => {
      if (!this.isValidPoint(point)) {
        throw new Error(`Invalid point data at index ${index}`);
      }
    });
  }

  /**
   * Validate individual LiDAR point
   */
  private isValidPoint(point: LiDARPoint): boolean {
    return (
      typeof point.x === 'number' &&
      typeof point.y === 'number' &&
      typeof point.z === 'number' &&
      !isNaN(point.x) &&
      !isNaN(point.y) &&
      !isNaN(point.z) &&
      (point.intensity === undefined || typeof point.intensity === 'number')
    );
  }

  /**
   * Log sensor errors
   */
  private logError(error: Error): void {
    const sensorError: SensorError = {
      sensorType: 'LiDAR',
      errorCode: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: {
        lastValidReading: this.lastValidReading,
        currentScanSize: this.currentScan.size,
      },
    };
    this.errorLog.push(sensorError);
  }

  /**
   * Get all logged errors
   */
  getErrors(): SensorError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = [];
  }

  /**
   * Clear current scan data
   */
  clearScan(): void {
    this.currentScan.clear();
  }
}
