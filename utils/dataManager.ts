import { SketchData, Room, MoistureReading, Wall, Door, Window } from '../types/moisture';

export class DataManager {
  private jobId: string;
  private roomData: Room | null;
  private moistureReadings: MoistureReading[];
  private walls: Wall[];
  private doors: Door[];
  private windows: Window[];
  private storageKey: string;

  constructor(jobId: string) {
    this.jobId = jobId;
    this.roomData = null;
    this.moistureReadings = [];
    this.walls = [];
    this.doors = [];
    this.windows = [];
    this.storageKey = `moisture-mapping-data-${jobId}`;

    // Try to recover data on initialization
    this.recoverData();
  }

  private recoverData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.roomData) this.roomData = parsed.roomData;
        if (parsed.moistureReadings) this.moistureReadings = parsed.moistureReadings;
        if (parsed.walls) this.walls = parsed.walls;
        if (parsed.doors) this.doors = parsed.doors;
        if (parsed.windows) this.windows = parsed.windows;
      }
    } catch (error) {
      console.error('Error recovering data:', error);
      // If recovery fails, create backup of corrupted data
      const corruptedData = localStorage.getItem(this.storageKey);
      if (corruptedData) {
        localStorage.setItem(`${this.storageKey}-corrupted-${Date.now()}`, corruptedData);
      }
      // Reset to empty state
      this.resetData();
    }
  }

  private persistData() {
    try {
      const dataToSave = {
        roomData: this.roomData,
        moistureReadings: this.moistureReadings,
        walls: this.walls,
        doors: this.doors,
        windows: this.windows,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private resetData() {
    this.roomData = null;
    this.moistureReadings = [];
    this.walls = [];
    this.doors = [];
    this.windows = [];
  }

  // Room data management
  saveRoomData(room: Room) {
    this.roomData = room;
    this.walls = room.walls;
    this.doors = room.doors;
    this.windows = room.windows;
    this.persistData();
  }

  getRoomData(): Room | null {
    return this.roomData;
  }

  // Moisture readings management
  addMoistureReading(reading: MoistureReading) {
    this.moistureReadings.push(reading);
    this.persistData();
  }

  updateMoistureReading(readingId: string, updates: Partial<MoistureReading>) {
    const index = this.moistureReadings.findIndex(r => r.id === readingId);
    if (index !== -1) {
      this.moistureReadings[index] = {
        ...this.moistureReadings[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.persistData();
    }
  }

  deleteMoistureReading(readingId: string) {
    this.moistureReadings = this.moistureReadings.filter(r => r.id !== readingId);
    this.persistData();
  }

  getMoistureReadings(): MoistureReading[] {
    return this.moistureReadings;
  }

  // Element management
  updateWalls(walls: Wall[]) {
    this.walls = walls;
    if (this.roomData) {
      this.roomData.walls = walls;
    }
    this.persistData();
  }

  updateDoors(doors: Door[]) {
    this.doors = doors;
    if (this.roomData) {
      this.roomData.doors = doors;
    }
    this.persistData();
  }

  updateWindows(windows: Window[]) {
    this.windows = windows;
    if (this.roomData) {
      this.roomData.windows = windows;
    }
    this.persistData();
  }

  // Get complete sketch data
  getSketchData(): SketchData {
    return {
      id: crypto.randomUUID(), // Generate new ID for each snapshot
      jobId: this.jobId,
      rooms: this.roomData ? [this.roomData] : [],
      moistureReadings: this.moistureReadings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Clear all data
  clearData() {
    this.resetData();
    localStorage.removeItem(this.storageKey);
  }

  // Export data
  exportData(): string {
    return JSON.stringify(this.getSketchData(), null, 2);
  }

  // Import data
  importData(data: SketchData) {
    if (data.jobId !== this.jobId) {
      throw new Error('Job ID mismatch');
    }

    if (data.rooms?.[0]) {
      this.roomData = data.rooms[0];
      this.walls = data.rooms[0].walls;
      this.doors = data.rooms[0].doors;
      this.windows = data.rooms[0].windows;
    }

    this.moistureReadings = data.moistureReadings;
    this.persistData();
  }
}
