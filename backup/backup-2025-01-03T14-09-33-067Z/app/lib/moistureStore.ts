import fs from 'fs';
import path from 'path';
import type { 
  SketchData, 
  DailyReadings, 
  MoistureReading 
} from '../types/moisture';

const DATA_DIR = path.join(process.cwd(), 'data', 'moisture');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class MoistureStore {
  private static getJobPath(jobId: string) {
    const filePath = path.join(DATA_DIR, `${jobId}.json`);
    console.log('Accessing file path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    return filePath;
  }

  static async getMoistureData(jobId: string): Promise<{
    sketchData: SketchData;
    readingHistory: DailyReadings[];
  } | null> {
    try {
      const filePath = this.getJobPath(jobId);
      console.log('Reading moisture data from:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return null;
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      console.log('Raw data:', rawData);
      
      const data = JSON.parse(rawData);
      console.log('Parsed data:', data);
      
      return data;
    } catch (error) {
      console.error('Error reading moisture data:', error);
      return null;
    }
  }

  static async createMoistureData(jobId: string, floorPlan: string): Promise<SketchData> {
    console.log('Creating moisture data for job:', jobId);
    
    const sketchData: SketchData = {
      id: `moisture_${jobId}_${Date.now()}`,
      jobId,
      floorPlan,
      moistureReadings: [],
      equipment: [],
      annotations: [],
      lastUpdated: new Date().toISOString(),
    };

    const data = {
      sketchData,
      readingHistory: [],
    };

    try {
      const filePath = this.getJobPath(jobId);
      console.log('Writing moisture data to:', filePath);
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
      );
      
      console.log('Successfully wrote moisture data');
      return sketchData;
    } catch (error) {
      console.error('Error creating moisture data:', error);
      throw error;
    }
  }

  static async updateMoistureData(
    jobId: string,
    updates: Partial<SketchData>
  ): Promise<SketchData> {
    try {
      console.log('Updating moisture data for job:', jobId);
      console.log('Updates:', updates);
      
      const data = await this.getMoistureData(jobId);
      if (!data) {
        throw new Error('Moisture data not found');
      }

      const updatedSketchData = {
        ...data.sketchData,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      const filePath = this.getJobPath(jobId);
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            ...data,
            sketchData: updatedSketchData,
          },
          null,
          2
        )
      );

      console.log('Successfully updated moisture data');
      return updatedSketchData;
    } catch (error) {
      console.error('Error updating moisture data:', error);
      throw error;
    }
  }

  static async addReading(
    jobId: string,
    reading: Omit<MoistureReading, 'id'>
  ): Promise<MoistureReading> {
    try {
      console.log('Adding reading for job:', jobId);
      console.log('Reading data:', reading);
      
      const data = await this.getMoistureData(jobId);
      if (!data) {
        throw new Error('Moisture data not found');
      }

      const newReading: MoistureReading = {
        ...reading,
        id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Add to sketch data
      const updatedSketchData = {
        ...data.sketchData,
        moistureReadings: [...data.sketchData.moistureReadings, newReading],
        lastUpdated: new Date().toISOString(),
      };

      // Update reading history
      const today = new Date().toISOString().split('T')[0];
      const readingHistory = [...data.readingHistory];
      const todayIndex = readingHistory.findIndex(day => day.date === today);

      if (todayIndex >= 0) {
        readingHistory[todayIndex].readings.push(newReading);
        readingHistory[todayIndex].averageValue = 
          readingHistory[todayIndex].readings.reduce((sum, r) => sum + r.value, 0) / 
          readingHistory[todayIndex].readings.length;
        readingHistory[todayIndex].maxValue = Math.max(
          ...readingHistory[todayIndex].readings.map(r => r.value)
        );
        readingHistory[todayIndex].minValue = Math.min(
          ...readingHistory[todayIndex].readings.map(r => r.value)
        );
        readingHistory[todayIndex].dryLocations = 
          readingHistory[todayIndex].readings.filter(r => r.value <= 15).length;
        readingHistory[todayIndex].totalLocations = 
          readingHistory[todayIndex].readings.length;
      } else {
        readingHistory.push({
          date: today,
          readings: [newReading],
          averageValue: newReading.value,
          maxValue: newReading.value,
          minValue: newReading.value,
          dryLocations: newReading.value <= 15 ? 1 : 0,
          totalLocations: 1,
        });
      }

      const filePath = this.getJobPath(jobId);
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            sketchData: updatedSketchData,
            readingHistory,
          },
          null,
          2
        )
      );

      console.log('Successfully added reading');
      return newReading;
    } catch (error) {
      console.error('Error adding reading:', error);
      throw error;
    }
  }
}
