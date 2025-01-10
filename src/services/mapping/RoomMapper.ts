import { GNSSProcessor } from './sensors/GNSSProcessor';
import { BarometerProcessor } from './sensors/BarometerProcessor';
import { IMUProcessor } from './sensors/IMUProcessor';
import { LiDARProcessor } from './sensors/LiDARProcessor';
import { 
  GNSSData, 
  BarometerData, 
  IMUData, 
  LiDARData, 
  SensorError 
} from '../../types/mapping/sensors';
import {
  Building,
  BuildingMap,
  Room,
  Floor,
  Transition,
  Point2D
} from '../../types/mapping/building';

export interface RoomMapperConfig {
  minRoomSize: number;  // minimum room size in square meters
  maxRoomSize: number;  // maximum room size in square meters
  minWallLength: number;  // minimum wall length in meters
  floorHeightThreshold: number;  // minimum height difference for new floor in meters
  autoStitchRooms: boolean;  // automatically stitch rooms when possible
}

export interface MappingState {
  isMapping: boolean;
  currentRoom: Room | null;
  currentFloor: number;
  currentBuilding: Building | null;
  lastError: string | null;
}

export class RoomMapper {
  private gnssProcessor: GNSSProcessor;
  private baroProcessor: BarometerProcessor;
  private imuProcessor: IMUProcessor;
  private lidarProcessor: LiDARProcessor;
  
  private config: RoomMapperConfig;
  private state: MappingState;
  private mappedRooms: Map<string, Room>;
  private transitions: Transition[];
  private errorLog: SensorError[];
  private initialLocationSet: boolean;

  constructor(config: Partial<RoomMapperConfig> = {}) {
    this.config = {
      minRoomSize: 2,
      maxRoomSize: 100,
      minWallLength: 0.5,
      floorHeightThreshold: 2.5,
      autoStitchRooms: true,
      ...config
    };

    this.gnssProcessor = new GNSSProcessor();
    this.baroProcessor = new BarometerProcessor();
    this.imuProcessor = new IMUProcessor();
    this.lidarProcessor = new LiDARProcessor();

    this.state = {
      isMapping: false,
      currentRoom: null,
      currentFloor: 0,
      currentBuilding: null,
      lastError: null
    };

    this.mappedRooms = new Map();
    this.transitions = [];
    this.errorLog = [];
    this.initialLocationSet = false;
  }

  /**
   * Start mapping a new building
   */
  startMapping(buildingId: string, buildingName?: string): void {
    if (this.state.isMapping) {
      throw new Error('Mapping already in progress');
    }

    this.state.isMapping = true;
    this.initialLocationSet = false;

    // Create building without location initially
    this.state.currentBuilding = {
      id: buildingId,
      name: buildingName,
      location: {
        latitude: 0,
        longitude: 0,
        elevation: 0
      },
      floors: [],
      metadata: {
        mappingStartTime: Date.now()
      }
    };
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
    if (!this.state.isMapping) {
      throw new Error('Mapping not started');
    }

    try {
      // Process each sensor's data if available
      if (gnssData) {
        const processedGNSS = this.gnssProcessor.processReading(gnssData);
        if (processedGNSS && !this.initialLocationSet && this.state.currentBuilding) {
          // Update building location with first valid GNSS reading
          this.state.currentBuilding.location = {
            latitude: processedGNSS.latitude,
            longitude: processedGNSS.longitude,
            elevation: processedGNSS.elevation
          };
          this.initialLocationSet = true;
        }
      }

      if (baroData) this.updateFloorLevel(baroData);
      if (imuData) this.imuProcessor.processReading(imuData);
      if (lidarData) this.updateRoomBoundary(lidarData);

      // Attempt room stitching if enabled
      if (this.config.autoStitchRooms) {
        this.attemptRoomStitching();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Update current floor level based on barometer data
   */
  private updateFloorLevel(baroData: BarometerData): void {
    const processedData = this.baroProcessor.processReading(baroData);
    if (!processedData) return;

    const newFloorLevel = this.baroProcessor.estimateFloorLevel();
    if (newFloorLevel !== null && newFloorLevel !== this.state.currentFloor) {
      this.handleFloorChange(newFloorLevel);
    }
  }

  /**
   * Update room boundary based on LiDAR data
   */
  private updateRoomBoundary(lidarData: LiDARData): void {
    const processedData = this.lidarProcessor.processReading(lidarData);
    if (!processedData) return;

    const boundary = this.lidarProcessor.detectBoundary();
    if (!boundary) return;

    // Update or create current room
    if (!this.state.currentRoom) {
      this.createNewRoom(boundary);
    } else {
      this.updateCurrentRoom(boundary);
    }

    // Detect and update doors and windows
    const doors = this.lidarProcessor.detectDoors();
    const windows = this.lidarProcessor.detectWindows();
    
    if (this.state.currentRoom) {
      this.state.currentRoom.doors = doors;
      this.state.currentRoom.windows = windows;
    }
  }

  /**
   * Create a new room with detected boundary
   */
  private createNewRoom(boundary: { points: Point2D[]; height: number }): void {
    const roomId = `room_${Date.now()}`;
    const room: Room = {
      id: roomId,
      boundary,
      doors: [],
      windows: [],
      floorLevel: this.state.currentFloor,
      ceiling: boundary.height,
      metadata: {
        createdAt: Date.now(),
        position: this.imuProcessor.getPosition()
      }
    };

    this.state.currentRoom = room;
    this.mappedRooms.set(roomId, room);
  }

  /**
   * Update current room with new boundary data
   */
  private updateCurrentRoom(boundary: { points: Point2D[]; height: number }): void {
    if (!this.state.currentRoom) return;

    this.state.currentRoom.boundary = boundary;
    this.state.currentRoom.ceiling = Math.max(
      this.state.currentRoom.ceiling,
      boundary.height
    );

    // Update room in mapped rooms collection
    this.mappedRooms.set(this.state.currentRoom.id, this.state.currentRoom);
  }

  /**
   * Handle floor level changes
   */
  private handleFloorChange(newFloorLevel: number): void {
    // Complete current room if any
    if (this.state.currentRoom) {
      this.completeCurrentRoom();
    }

    this.state.currentFloor = newFloorLevel;
    
    // Ensure floor exists in building
    if (this.state.currentBuilding) {
      const floorExists = this.state.currentBuilding.floors.some(
        f => f.level === newFloorLevel
      );

      if (!floorExists) {
        this.state.currentBuilding.floors.push({
          level: newFloorLevel,
          rooms: [],
          elevation: this.baroProcessor.getRelativeAltitude() || 0,
          metadata: {
            createdAt: Date.now()
          }
        });
      }
    }
  }

  /**
   * Complete mapping of current room
   */
  private completeCurrentRoom(): void {
    if (!this.state.currentRoom || !this.state.currentBuilding) return;

    const floor = this.state.currentBuilding.floors.find(
      f => f.level === this.state.currentFloor
    );

    if (floor) {
      const roomIndex = floor.rooms.findIndex(
        r => r.id === this.state.currentRoom!.id
      );

      if (roomIndex >= 0) {
        floor.rooms[roomIndex] = this.state.currentRoom;
      } else {
        floor.rooms.push(this.state.currentRoom);
      }
    }

    this.state.currentRoom = null;
  }

  /**
   * Attempt to stitch rooms together
   */
  private attemptRoomStitching(): void {
    if (!this.state.currentRoom) return;

    const currentPosition = this.imuProcessor.getPosition();
    const nearbyRooms = Array.from(this.mappedRooms.values()).filter(room => 
      room.id !== this.state.currentRoom!.id &&
      room.floorLevel === this.state.currentFloor &&
      this.areRoomsNearby(room, currentPosition)
    );

    nearbyRooms.forEach(nearbyRoom => {
      const transition = this.detectTransition(this.state.currentRoom!, nearbyRoom);
      if (transition) {
        this.transitions.push(transition);
      }
    });
  }

  /**
   * Check if rooms are nearby based on position
   */
  private areRoomsNearby(room: Room, position: Point2D): boolean {
    // Simple distance check to room centroid
    const centroid = this.calculateRoomCentroid(room);
    const distance = Math.sqrt(
      Math.pow(centroid.x - position.x, 2) +
      Math.pow(centroid.y - position.y, 2)
    );

    return distance < Math.sqrt(this.config.maxRoomSize);
  }

  /**
   * Calculate room centroid
   */
  private calculateRoomCentroid(room: Room): Point2D {
    const points = room.boundary.points;
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  }

  /**
   * Detect transition between rooms
   */
  private detectTransition(room1: Room, room2: Room): Transition | null {
    // Check for matching doors
    for (const door1 of room1.doors) {
      for (const door2 of room2.doors) {
        if (this.arePointsNearby(door1.start, door2.start) ||
            this.arePointsNearby(door1.start, door2.end) ||
            this.arePointsNearby(door1.end, door2.start) ||
            this.arePointsNearby(door1.end, door2.end)) {
          return {
            type: 'door',
            from: {
              roomId: room1.id,
              floorLevel: room1.floorLevel
            },
            to: {
              roomId: room2.id,
              floorLevel: room2.floorLevel
            },
            points: [
              { ...door1.start, z: 0 },
              { ...door1.end, z: 0 }
            ]
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if two points are nearby
   */
  private arePointsNearby(p1: Point2D, p2: Point2D): boolean {
    const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2)
    );
    return distance < 0.5; // 50cm threshold
  }

  /**
   * Complete mapping and return final map
   */
  completeMapping(): BuildingMap {
    if (!this.state.isMapping) {
      throw new Error('No mapping in progress');
    }

    if (!this.initialLocationSet) {
      throw new Error('Unable to determine building location');
    }

    if (this.state.currentRoom) {
      this.completeCurrentRoom();
    }

    if (!this.state.currentBuilding) {
      throw new Error('No building data available');
    }

    const buildingMap: BuildingMap = {
      building: this.state.currentBuilding,
      transitions: this.transitions,
      timestamp: Date.now(),
      version: '1.0.0',
      metadata: {
        creator: 'RoomMapper',
        totalRooms: this.mappedRooms.size,
        totalFloors: this.state.currentBuilding.floors.length,
        errors: this.errorLog.length
      }
    };

    this.resetMapping();
    return buildingMap;
  }

  /**
   * Reset mapping state
   */
  private resetMapping(): void {
    this.state = {
      isMapping: false,
      currentRoom: null,
      currentFloor: 0,
      currentBuilding: null,
      lastError: null
    };

    this.mappedRooms.clear();
    this.transitions = [];
    this.errorLog = [];
    this.initialLocationSet = false;
    this.imuProcessor.resetPosition();
    this.lidarProcessor.clearScan();
    this.baroProcessor.resetBaseline();
  }

  /**
   * Handle and log errors
   */
  private handleError(error: Error): void {
    this.state.lastError = error.message;
    console.error('RoomMapper error:', error);

    const sensorError: SensorError = {
      sensorType: 'LiDAR',
      errorCode: 'MAPPING_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: {
        currentRoom: this.state.currentRoom,
        currentFloor: this.state.currentFloor,
        position: this.imuProcessor.getPosition()
      }
    };

    this.errorLog.push(sensorError);
  }

  /**
   * Get current mapping state
   */
  getState(): MappingState {
    return { ...this.state };
  }

  /**
   * Get all mapping errors
   */
  getErrors(): SensorError[] {
    return [
      ...this.errorLog,
      ...this.gnssProcessor.getErrors(),
      ...this.baroProcessor.getErrors(),
      ...this.imuProcessor.getErrors(),
      ...this.lidarProcessor.getErrors()
    ];
  }
}
