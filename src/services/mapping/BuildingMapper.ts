import path from 'path';
import { RoomMapper, RoomMapperConfig } from './RoomMapper';
import { MapExporter, ExportOptions } from './exporters/MapExporter';
import { 
  GNSSData, 
  BarometerData, 
  IMUData, 
  LiDARData, 
  SensorError 
} from '../../types/mapping/sensors';
import { BuildingMap, Room } from '../../types/mapping/building';
import { 
  SketchGenerationResult, 
  Sketch2D, 
  Model3D, 
  Layer,
  Point2D,
  Point3D
} from '../../types/mapping/sketch';

export interface BuildingMapperOptions {
  roomMapper?: Partial<RoomMapperConfig>;
  export?: ExportOptions;
}

/**
 * Main facade for the building mapping system.
 * Coordinates sensor data processing, room mapping, and map export.
 */
export class BuildingMapper {
  private roomMapper: RoomMapper;
  private mapExporter: MapExporter;

  constructor(options: BuildingMapperOptions = {}) {
    this.roomMapper = new RoomMapper(options.roomMapper);
    this.mapExporter = new MapExporter();
  }

  /**
   * Start mapping a new building
   */
  startMapping(buildingId: string, buildingName?: string): void {
    this.roomMapper.startMapping(buildingId, buildingName);
  }

  /**
   * Process sensor data updates
   */
  processSensorData(
    gnssData?: GNSSData,
    baroData?: BarometerData,
    imuData?: IMUData,
    lidarData?: LiDARData
  ): void {
    this.roomMapper.processSensorData(gnssData, baroData, imuData, lidarData);
  }

  /**
   * Complete mapping and export results
   */
  async completeMapping(outputDir: string): Promise<BuildingMap> {
    const buildingMap = this.roomMapper.completeMapping();
    
    try {
      const result: SketchGenerationResult = {
        sketch2D: this.generateSketch(buildingMap),
        model3D: this.generate3DModel(buildingMap),
        annotations: this.generateAnnotations(buildingMap),
        labels: this.generateLabels(buildingMap),
        dimensions: this.generateDimensions(buildingMap),
        errors: this.convertErrors(this.getErrors()),
        metadata: {
          processingTime: Date.now(),
          pointCount: this.countPoints(buildingMap),
          roomCount: buildingMap.building.floors.reduce(
            (total, floor) => total + floor.rooms.length, 0
          ),
          floorCount: buildingMap.building.floors.length,
          accuracy: 1.0
        }
      };

      await this.mapExporter.exportMap(result, {
        outputDir,
        baseName: `building_${buildingMap.building.id}`,
        formats: ['json', 'geojson', 'svg', 'obj'],
        createSubdirs: true,
        overwrite: true
      });
    } catch (error) {
      console.error('Failed to export map:', error instanceof Error ? error.message : String(error));
    }

    return buildingMap;
  }

  /**
   * Generate 2D sketch from building map
   */
  private generateSketch(buildingMap: BuildingMap): Sketch2D {
    const layers: Layer[] = [];

    // Add walls layer
    layers.push({
      id: 'walls',
      name: 'Walls',
      type: 'walls',
      visible: true,
      locked: false,
      opacity: 1,
      data: buildingMap.building.floors.flatMap(floor =>
        floor.rooms.map(room => ({
          points: room.boundary.points,
          height: room.boundary.height
        }))
      )
    });

    // Add doors layer
    layers.push({
      id: 'doors',
      name: 'Doors',
      type: 'doors',
      visible: true,
      locked: false,
      opacity: 1,
      data: buildingMap.building.floors.flatMap(floor =>
        floor.rooms.flatMap(room => room.doors)
      )
    });

    // Add windows layer
    layers.push({
      id: 'windows',
      name: 'Windows',
      type: 'windows',
      visible: true,
      locked: false,
      opacity: 1,
      data: buildingMap.building.floors.flatMap(floor =>
        floor.rooms.flatMap(room => room.windows)
      )
    });

    // Calculate viewBox
    const points = buildingMap.building.floors.flatMap(floor =>
      floor.rooms.flatMap(room => room.boundary.points)
    );

    const viewBox = this.calculateViewBox(points);

    return {
      id: `sketch_${buildingMap.building.id}`,
      floorLevel: 0, // Default to ground floor
      viewBox,
      layers,
      scale: 50, // 50 pixels per meter
      rotation: 0,
      metadata: {
        generatedAt: Date.now(),
        source: 'BuildingMapper',
        version: '1.0.0'
      }
    };
  }

  /**
   * Generate 3D model from building map
   */
  private generate3DModel(buildingMap: BuildingMap): Model3D {
    const vertices: Point3D[] = [];
    const faces: number[][] = [];
    const normals: Point3D[] = [];

    buildingMap.building.floors.forEach((floor, floorIndex) => {
      floor.rooms.forEach(room => {
        const baseHeight = floor.elevation;
        const topHeight = baseHeight + room.ceiling;

        // Add vertices for floor and ceiling
        const baseVertices = room.boundary.points.map(point => ({
          x: point.x,
          y: point.y,
          z: baseHeight
        }));

        const topVertices = room.boundary.points.map(point => ({
          x: point.x,
          y: point.y,
          z: topHeight
        }));

        const startIndex = vertices.length;
        vertices.push(...baseVertices, ...topVertices);

        // Add faces (triangulate the floor and ceiling)
        for (let i = 2; i < room.boundary.points.length; i++) {
          // Floor triangle
          faces.push([
            startIndex,
            startIndex + i - 1,
            startIndex + i
          ]);

          // Ceiling triangle
          const topOffset = room.boundary.points.length;
          faces.push([
            startIndex + topOffset,
            startIndex + topOffset + i - 1,
            startIndex + topOffset + i
          ]);
        }

        // Add walls
        for (let i = 0; i < room.boundary.points.length; i++) {
          const next = (i + 1) % room.boundary.points.length;
          faces.push([
            startIndex + i,
            startIndex + next,
            startIndex + room.boundary.points.length + i,
            startIndex + room.boundary.points.length + next
          ]);
        }

        // Add normals
        this.calculateNormals(vertices, faces).forEach(normal => 
          normals.push(normal)
        );
      });
    });

    return {
      id: `model_${buildingMap.building.id}`,
      vertices,
      faces,
      normals,
      metadata: {
        generatedAt: Date.now(),
        source: 'BuildingMapper',
        version: '1.0.0',
        boundingBox: this.calculateBoundingBox(vertices)
      }
    };
  }

  /**
   * Calculate normals for 3D model faces
   */
  private calculateNormals(vertices: Point3D[], faces: number[][]): Point3D[] {
    return faces.map(face => {
      const v1 = vertices[face[0]];
      const v2 = vertices[face[1]];
      const v3 = vertices[face[2]];

      // Calculate vectors from v1 to v2 and v1 to v3
      const vec1 = {
        x: v2.x - v1.x,
        y: v2.y - v1.y,
        z: v2.z - v1.z
      };

      const vec2 = {
        x: v3.x - v1.x,
        y: v3.y - v1.y,
        z: v3.z - v1.z
      };

      // Cross product
      const normal = {
        x: vec1.y * vec2.z - vec1.z * vec2.y,
        y: vec1.z * vec2.x - vec1.x * vec2.z,
        z: vec1.x * vec2.y - vec1.y * vec2.x
      };

      // Normalize
      const length = Math.sqrt(
        normal.x * normal.x +
        normal.y * normal.y +
        normal.z * normal.z
      );

      return {
        x: normal.x / length,
        y: normal.y / length,
        z: normal.z / length
      };
    });
  }

  /**
   * Calculate bounding box for 3D model
   */
  private calculateBoundingBox(vertices: Point3D[]): {
    min: Point3D;
    max: Point3D;
  } {
    const min = {
      x: Infinity,
      y: Infinity,
      z: Infinity
    };

    const max = {
      x: -Infinity,
      y: -Infinity,
      z: -Infinity
    };

    vertices.forEach(vertex => {
      min.x = Math.min(min.x, vertex.x);
      min.y = Math.min(min.y, vertex.y);
      min.z = Math.min(min.z, vertex.z);

      max.x = Math.max(max.x, vertex.x);
      max.y = Math.max(max.y, vertex.y);
      max.z = Math.max(max.z, vertex.z);
    });

    return { min, max };
  }

  /**
   * Calculate viewBox for 2D sketch
   */
  private calculateViewBox(points: Point2D[]): {
    minX: number;
    minY: number;
    width: number;
    height: number;
  } {
    const min = {
      x: Infinity,
      y: Infinity
    };

    const max = {
      x: -Infinity,
      y: -Infinity
    };

    points.forEach(point => {
      min.x = Math.min(min.x, point.x);
      min.y = Math.min(min.y, point.y);
      max.x = Math.max(max.x, point.x);
      max.y = Math.max(max.y, point.y);
    });

    return {
      minX: min.x,
      minY: min.y,
      width: max.x - min.x,
      height: max.y - min.y
    };
  }

  /**
   * Generate annotations from building map
   */
  private generateAnnotations(buildingMap: BuildingMap) {
    return [];  // Implement annotation generation
  }

  /**
   * Generate labels from building map
   */
  private generateLabels(buildingMap: BuildingMap) {
    return [];  // Implement label generation
  }

  /**
   * Generate dimensions from building map
   */
  private generateDimensions(buildingMap: BuildingMap) {
    return [];  // Implement dimension generation
  }

  /**
   * Count total points in building map
   */
  private countPoints(buildingMap: BuildingMap): number {
    return buildingMap.building.floors.reduce(
      (total, floor) => total + floor.rooms.reduce(
        (roomTotal, room) => roomTotal + room.boundary.points.length,
        0
      ),
      0
    );
  }

  /**
   * Export current map state without completing mapping
   */
  async exportCurrentState(outputDir: string): Promise<void> {
    const state = this.getMappingState();
    if (!state.currentBuilding) {
      throw new Error('No mapping in progress');
    }

    const timestamp = Date.now();
    const result: SketchGenerationResult = {
      sketch2D: undefined,
      model3D: undefined,
      annotations: [],
      labels: [],
      dimensions: [],
      errors: this.convertErrors(this.getErrors()),
      metadata: {
        processingTime: timestamp,
        pointCount: 0,
        roomCount: state.currentBuilding.floors.reduce(
          (total, floor) => total + floor.rooms.length, 0
        ),
        floorCount: state.currentBuilding.floors.length,
        accuracy: 0.5, // Partial mapping has lower accuracy
        partial: true,
        exportTime: new Date(timestamp).toISOString(),
        mappingState: state
      }
    };

    await this.mapExporter.exportMap(result, {
      outputDir,
      baseName: `building_${state.currentBuilding.id}_partial`,
      formats: ['json'],
      createSubdirs: true,
      overwrite: true
    });
  }

  /**
   * Export error log
   */
  async exportErrorLog(outputPath: string): Promise<void> {
    const errors = this.getErrors();
    const state = this.getMappingState();
    
    const result: SketchGenerationResult = {
      sketch2D: undefined,
      model3D: undefined,
      annotations: [],
      labels: [],
      dimensions: [],
      errors: this.convertErrors(errors),
      metadata: {
        processingTime: Date.now(),
        pointCount: 0,
        roomCount: state.currentBuilding?.floors.reduce(
          (total, floor) => total + floor.rooms.length, 0
        ) || 0,
        floorCount: state.currentBuilding?.floors.length || 0,
        accuracy: 1.0,
        timestamp: Date.now(),
        errorCount: errors.length,
        mappingState: state
      }
    };

    await this.mapExporter.exportMap(result, {
      outputDir: path.dirname(outputPath),
      baseName: path.basename(outputPath, '.txt'),
      formats: ['json'],
      createSubdirs: false,
      overwrite: true
    });
  }

  /**
   * Convert SensorError array to SketchGenerationResult error format
   */
  private convertErrors(errors: SensorError[]): Array<{
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    details?: Record<string, any>;
  }> {
    return errors.map(error => ({
      code: error.errorCode,
      message: error.message,
      severity: 'error',
      details: {
        sensorType: error.sensorType,
        timestamp: error.timestamp,
        ...error.details
      }
    }));
  }

  /**
   * Get current mapping state
   */
  getMappingState() {
    return this.roomMapper.getState();
  }

  /**
   * Get all errors from mapping process
   */
  getErrors(): SensorError[] {
    return this.roomMapper.getErrors();
  }
}
