import { MoistureReading } from '@prisma/client';

// Mock data for HTTP method tests
export const httpMethodData = {
  validMethod: 'POST',
  invalidMethod: 'GET'
};

// Mock data for request validation
export const validationData = {
  jobId: 'job123',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-02T00:00:00Z'
};

// Mock database readings
interface DbReadingOptions {
  jobId?: string;
  count?: number;
  startDate?: Date;
  room?: string;
}

export const generateDbReadings = (options: DbReadingOptions | number = 3): MoistureReading[] => {
  const count = typeof options === 'number' ? options : (options.count || 3);
  const jobId = typeof options === 'number' ? 'job123' : (options.jobId || 'job123');
  const startDate = typeof options === 'number' ? new Date('2024-01-01T10:00:00Z') : (options.startDate || new Date('2024-01-01T10:00:00Z'));
  const room = typeof options === 'number' ? 'Room1' : (options.room || 'Room1');
  return Array(count).fill(null).map((_, i) => ({
    id: `${i + 1}`,
    jobId: 'job123',
    locationX: i,
    locationY: 0,
    room: 'Room1',
    floor: 'Floor1',
    temperature: 20 + i,
    humidity: 45 + i,
    pressure: 1013,
    createdAt: new Date(`2024-01-01T${10 + i}:00:00Z`),
    updatedAt: new Date(`2024-01-01T${10 + i}:00:00Z`),
    notes: null,
    equipmentId: 'equip1',
    floorPlanId: 'plan1'
  }));
};

export const dbReadings = generateDbReadings();
