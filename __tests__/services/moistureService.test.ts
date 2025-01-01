import { moistureService } from '@/services/moistureService';
import { readingCache } from '@/utils/cache';
import { MoistureReading, SketchData, DailyReadings } from '@/types/moisture';

describe('MoistureService', () => {
  // Mock data
  const mockReading: MoistureReading = {
    id: 'reading-1',
    position: { x: 100, y: 100 },
    value: 15,
    materialType: 'drywall',
    timestamp: new Date().toISOString(),
  };

  const mockSketchData: SketchData = {
    room: {
      id: 'room-1',
      width: 500,
      height: 300,
      dimensions: { width: '20', height: '15', unit: 'ft' },
    },
    damageAreas: [],
    equipment: [],
    moistureReadings: [mockReading],
  };

  const mockDailyReadings: DailyReadings = {
    date: new Date().toISOString().split('T')[0],
    readings: [mockReading],
  };

  beforeEach(() => {
    // Clear localStorage and cache before each test
    localStorage.clear();
    readingCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Data Storage and Caching', () => {
    it('saves and retrieves sketch data with caching', async () => {
      await moistureService.saveSketchData('job-1', mockSketchData);
      
      // Check cache
      expect(readingCache.get(mockReading.id)).toEqual(mockReading);
      
      // Check localStorage
      const retrieved = await moistureService.getSketchData('job-1');
      expect(retrieved).toEqual(mockSketchData);
    });

    it('saves and retrieves reading history with caching', async () => {
      await moistureService.saveReadingHistory('job-1', [mockDailyReadings]);
      
      // Check cache
      expect(readingCache.get(mockReading.id)).toEqual(mockReading);
      
      // Check localStorage
      const retrieved = await moistureService.getReadingHistory('job-1');
      expect(retrieved).toEqual([mockDailyReadings]);
    });

    it('handles batch processing of readings', async () => {
      // Set up initial data
      await moistureService.saveSketchData('job-1', mockSketchData);

      // Add new reading through batch processor
      const newReading: MoistureReading = {
        ...mockReading,
        id: 'reading-2',
      };
      await moistureService.addReading('job-1', newReading);

      // Fast-forward timers to trigger batch processing
      jest.runAllTimers();
      await Promise.resolve(); // Flush promises

      // Check if reading was added
      const updatedData = await moistureService.getSketchData('job-1');
      expect(updatedData?.moistureReadings).toHaveLength(2);
      expect(updatedData?.moistureReadings).toContainEqual(newReading);
    });
  });

  describe('Validation', () => {
    it('validates sketch data', async () => {
      const invalidData: SketchData = {
        ...mockSketchData,
        room: {
          ...mockSketchData.room,
          width: -1, // Invalid width
        },
      };

      await expect(moistureService.saveSketchData('job-1', invalidData))
        .rejects
        .toThrow('Room dimensions must be positive numbers');
    });

    it('validates moisture readings', async () => {
      const invalidReading: MoistureReading = {
        ...mockReading,
        value: -1, // Invalid value
      };

      const invalidData: SketchData = {
        ...mockSketchData,
        moistureReadings: [invalidReading],
      };

      await expect(moistureService.saveSketchData('job-1', invalidData))
        .rejects
        .toThrow('Moisture reading cannot be negative');
    });
  });

  describe('Progress Tracking', () => {
    it('calculates drying progress', () => {
      const readings: MoistureReading[] = [
        { ...mockReading, value: 10 }, // Below benchmark (dry)
        { ...mockReading, id: 'reading-2', value: 15 }, // Above benchmark (wet)
      ];

      const progress = moistureService.getDryingProgress(readings);
      expect(progress).toBe(50); // 1 out of 2 readings is dry
    });

    it('estimates drying time', () => {
      const readings: MoistureReading[] = [
        { ...mockReading, value: 20, materialType: 'concrete' }, // Takes longer to dry
        { ...mockReading, id: 'reading-2', value: 15, materialType: 'drywall' },
      ];

      const time = moistureService.getEstimatedDryingTime(readings);
      expect(time).toBe(14); // Concrete takes 14 days
    });
  });

  describe('Data Export', () => {
    it('exports data with progress information', async () => {
      // Set up data
      await moistureService.saveSketchData('job-1', mockSketchData);
      await moistureService.saveReadingHistory('job-1', [mockDailyReadings]);

      // Export data
      const blob = await moistureService.exportData('job-1');
      const data = JSON.parse(await blob.text());

      expect(data).toMatchObject({
        jobId: 'job-1',
        sketchData: mockSketchData,
        history: [mockDailyReadings],
        dryingProgress: expect.any(Number),
        estimatedDryingTime: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', async () => {
      const data = await moistureService.getSketchData('non-existent');
      expect(data).toBeNull();
    });

    it('handles invalid JSON in localStorage', async () => {
      localStorage.setItem('moisture-data-job-1-sketch', 'invalid json');
      const data = await moistureService.getSketchData('job-1');
      expect(data).toBeNull();
    });

    it('handles batch processing errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error by providing invalid data
      const invalidReading = { ...mockReading, value: -1 };
      await moistureService.addReading('job-1', invalidReading);

      jest.runAllTimers();
      await Promise.resolve();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
