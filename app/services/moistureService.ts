import type { 
  MoistureInspection, 
  MoistureReading, 
  DryingProgress,
  MaterialType,
  DeviceName,
  ReadingTypeName,
  ReadingMethodName
} from '../types/moisture';

class MoistureService {
  private static instance: MoistureService;

  private constructor() {}

  public static getInstance(): MoistureService {
    if (!MoistureService.instance) {
      MoistureService.instance = new MoistureService();
    }
    return MoistureService.instance;
  }

  async createInspection(data: {
    jobNumber: string;
    roomName: string;
    roomDescription?: string;
    roomSketch?: string;
  }): Promise<MoistureInspection> {
    try {
      const response = await fetch('/api/moisture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create moisture inspection');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating moisture inspection:', error);
      throw error;
    }
  }

  async getInspections(jobNumber: string): Promise<MoistureInspection[]> {
    try {
      const response = await fetch(`/api/moisture?jobNumber=${jobNumber}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch moisture inspections');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching moisture inspections:', error);
      throw error;
    }
  }

  async addReading(inspectionId: string, data: {
    value: number;
    location: string;
    materialType: MaterialType;
    deviceName: DeviceName;
    deviceModel: string;
    readingType: ReadingTypeName;
    readingUnit: string;
    readingMethod: ReadingMethodName;
    inspectionDay: number;
    notes?: string;
  }): Promise<MoistureReading> {
    try {
      const response = await fetch(`/api/moisture/${inspectionId}/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add moisture reading');
      }

      return response.json();
    } catch (error) {
      console.error('Error adding moisture reading:', error);
      throw error;
    }
  }

  async getReadings(inspectionId: string): Promise<MoistureReading[]> {
    try {
      const response = await fetch(`/api/moisture/${inspectionId}/readings`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch moisture readings');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching moisture readings:', error);
      throw error;
    }
  }

  // Helper function to calculate drying progress
  calculateDryingProgress(readings: MoistureReading[]): DryingProgress[] {
    const readingsByDay = readings.reduce<{ [key: number]: MoistureReading[] }>((acc, reading) => {
      const day = reading.inspectionDay;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(reading);
      return acc;
    }, {});

    return Object.entries(readingsByDay).map(([day, dayReadings]) => {
      const values = dayReadings.map(r => r.value);
      const dryLocations = dayReadings.filter(r => r.value <= 15).length; // Using 15% as dry threshold

      return {
        day: parseInt(day),
        date: dayReadings[0].timestamp,
        averageReading: values.reduce((a, b) => a + b, 0) / values.length,
        highestReading: Math.max(...values),
        lowestReading: Math.min(...values),
        readingsCount: values.length,
        dryLocationsCount: dryLocations,
        totalLocations: dayReadings.length,
      };
    }).sort((a, b) => a.day - b.day);
  }
}

export const moistureService = MoistureService.getInstance();
