import {
  getMoistureReadingsInTimeRange,
  getMoistureReadingsByLocation,
  getAverageMoistureByLocation
} from '../../lib/db/moisture-queries';
import { prisma } from '../../lib/db/client';

// Ensure single instance of PrismaClient
beforeAll(() => {
  if (process.env.NODE_ENV === 'test') {
    prisma.$connect();
  }
});

describe('Moisture Queries', () => {
  const testJobId = 'test-job-123';
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  beforeEach(async () => {
    // Clear existing test data
    await prisma.$transaction([
      // Delete data points first due to foreign key constraint
      prisma.dataPoint.deleteMany({
        where: {
          moistureReading: {
            jobId: testJobId
          }
        }
      }),
      // Then delete moisture readings
      prisma.moistureReading.deleteMany({
        where: {
          jobId: testJobId
        }
      })
    ]);

    // Create test data for different scenarios
    await Promise.all([
      createTestReading(testJobId, 'room1', '1', 1.0, 1.0, [15, 16, 17], yesterday),
      createTestReading(testJobId, 'room1', '1', 1.0, 2.0, [18, 19, 20], now),
      createTestReading(testJobId, 'room2', '2', 2.0, 2.0, [21, 22, 23], now),
      createTestReading(testJobId, 'room2', '1', 3.0, 3.0, [24, 25, 26], now)
    ]);
  });

  afterEach(async () => {
    await prisma.$transaction([
      // Delete data points first due to foreign key constraint
      prisma.dataPoint.deleteMany({
        where: {
          moistureReading: {
            jobId: testJobId
          }
        }
      }),
      // Then delete moisture readings
      prisma.moistureReading.deleteMany({
        where: {
          jobId: testJobId
        }
      })
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('getMoistureReadingsInTimeRange', () => {
    test('returns all readings within time range', async () => {
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      const readings = await getMoistureReadingsInTimeRange({
        startDate: twoDaysAgo,
        endDate: now,
        jobId: testJobId
      });

      expect(readings).toHaveLength(4);
      expect(readings[0].dataPoints).toBeDefined();
      expect(readings[0].jobId).toBe(testJobId);
      
      // Verify data points are within time range
      readings.forEach(reading => {
        reading.dataPoints.forEach(point => {
          expect(point.createdAt.getTime()).toBeGreaterThanOrEqual(twoDaysAgo.getTime());
          expect(point.createdAt.getTime()).toBeLessThanOrEqual(now.getTime());
        });
      });
    });

    test('returns empty array for invalid time range', async () => {
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const readings = await getMoistureReadingsInTimeRange({
        startDate: future,
        endDate: future,
        jobId: testJobId
      });

      expect(readings).toHaveLength(0);
    });
  });

  describe('getMoistureReadingsByLocation', () => {
    test('filters by room and floor', async () => {
      const readings = await getMoistureReadingsByLocation({
        jobId: testJobId,
        room: 'room1',
        floor: '1'
      });

      expect(readings).toHaveLength(2);
      readings.forEach(reading => {
        expect(reading.room).toBe('room1');
        expect(reading.floor).toBe('1');
      });
    });

    test('filters by room only', async () => {
      const readings = await getMoistureReadingsByLocation({
        jobId: testJobId,
        room: 'room2'
      });

      expect(readings).toHaveLength(2);
      readings.forEach(reading => {
        expect(reading.room).toBe('room2');
      });
    });

    test('returns empty array for non-existent location', async () => {
      const readings = await getMoistureReadingsByLocation({
        jobId: testJobId,
        room: 'non-existent',
        floor: '999'
      });

      expect(readings).toHaveLength(0);
    });
  });

  describe('getAverageMoistureByLocation', () => {
    test('calculates correct averages', async () => {
      const averages = await getAverageMoistureByLocation({
        jobId: testJobId
      });

      expect(averages).toHaveLength(4);
      averages.forEach(avg => {
        expect(avg).toHaveProperty('x');
        expect(avg).toHaveProperty('y');
        expect(avg).toHaveProperty('average');
        expect(avg).toHaveProperty('count');
        expect(typeof avg.average).toBe('number');
        expect(avg.count).toBeGreaterThan(0);
      });

      // Verify specific average calculations
      const room1Avg = averages.find(a => a.x === 1.0 && a.y === 1.0);
      expect(room1Avg?.average).toBe((15 + 16 + 17) / 3);
    });

    test('returns empty array for non-existent job', async () => {
      const averages = await getAverageMoistureByLocation({
        jobId: 'non-existent'
      });

      expect(averages).toHaveLength(0);
    });
  });
});

async function createTestReading(
  jobId: string,
  room: string,
  floor: string,
  x: number,
  y: number,
  values: number[],
  date: Date
) {
  return prisma.moistureReading.create({
    data: {
      jobId,
      room,
      floor,
      locationX: x,
      locationY: y,
      equipmentId: 'test-meter',
      floorPlanId: 'test-plan',
      dataPoints: {
        create: values.map(value => ({
          value,
          unit: 'WME',
          createdAt: date
        }))
      }
    }
  });
}
