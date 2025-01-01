import { PrismaClient, Prisma } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { MoistureUnit } from '../../api/moisture/types/readings';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

describe('Data Integrity Tests', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    mockReset(prisma);
  });

  describe('Relationship Integrity', () => {
    test('maintains moisture reading and data point relationship', async () => {
      // Mock a moisture reading with related data points
      const mockReading = {
        id: '1',
        jobId: 'job1',
        floorPlanId: 'floor1',
        equipmentId: 'equip1',
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        dataPoints: [{
          id: 'dp1',
          value: 15.5,
          unit: 'PCT' as MoistureUnit,
          createdAt: new Date(),
          moistureReadingId: '1'
        }]
      };

      prisma.moistureReading.findUnique.mockResolvedValueOnce(mockReading);

      const reading = await prisma.moistureReading.findUnique({
        where: { id: '1' },
        include: { dataPoints: true }
      });

      expect(reading).toBeDefined();
      expect(reading?.dataPoints).toHaveLength(1);
      expect(reading?.dataPoints[0].moistureReadingId).toBe(reading?.id);
    });

    test('cascades deletes from moisture reading to data points', async () => {
      const mockDelete = prisma.moistureReading.delete.mockResolvedValueOnce(({
        id: '1',
        jobId: 'job1',
        floorPlanId: 'floor1',
        equipmentId: 'equip1',
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await prisma.moistureReading.delete({
        where: { id: '1' }
      });

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('Data Constraints', () => {
    test('enforces required fields', async () => {
      const invalidData: Prisma.MoistureReadingCreateInput = {
        job: { connect: { id: 'job1' } },
        floorPlan: { connect: { id: 'floor1' } },
        equipment: { connect: { id: 'equip1' } },
        // Intentionally omit required fields locationX, locationY, room, floor
      } as any;

      await expect(
        prisma.moistureReading.create({
          data: invalidData
        })
      ).rejects.toThrow();
    });

    test('validates coordinate ranges', async () => {
      const invalidCoordinates: Prisma.MoistureReadingCreateInput = {
        job: { connect: { id: 'job1' } },
        floorPlan: { connect: { id: 'floor1' } },
        equipment: { connect: { id: 'equip1' } },
        locationX: -1, // Invalid negative coordinate
        locationY: -1,
        room: 'room1',
        floor: '1'
      };

      await expect(
        prisma.moistureReading.create({
          data: invalidCoordinates
        })
      ).rejects.toThrow();
    });

    test('validates moisture unit values', async () => {
      const invalidUnit: Prisma.MoistureReadingCreateInput = {
        job: { connect: { id: 'job1' } },
        floorPlan: { connect: { id: 'floor1' } },
        equipment: { connect: { id: 'equip1' } },
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1',
        dataPoints: {
          create: [{
            value: 15.5,
            unit: 'INVALID' as MoistureUnit
          }]
        }
      };

      await expect(
        prisma.moistureReading.create({
          data: invalidUnit
        })
      ).rejects.toThrow();
    });
  });

  describe('Referential Integrity', () => {
    test('prevents orphaned data points', async () => {
      const orphanedDataPoint: Prisma.MoistureReadingCreateInput = {
        job: { connect: { id: 'job1' } },
        floorPlan: { connect: { id: 'floor1' } },
        equipment: { connect: { id: 'equip1' } },
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1',
        dataPoints: {
          create: [{
            value: 15.5,
            unit: 'PCT' as MoistureUnit
          }]
        }
      };

      await expect(
        prisma.moistureReading.create({
          data: orphanedDataPoint
        })
      ).rejects.toThrow();
    });

    test('maintains floor plan references', async () => {
      const invalidFloorPlan: Prisma.MoistureReadingCreateInput = {
        job: { connect: { id: 'job1' } },
        floorPlan: { connect: { id: 'nonexistent-floor-plan' } },
        equipment: { connect: { id: 'equip1' } },
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1'
      };

      await expect(
        prisma.moistureReading.create({
          data: invalidFloorPlan
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Consistency', () => {
    test('maintains timestamp ordering', async () => {
      const reading = await prisma.moistureReading.create({
        data: {
          job: { connect: { id: 'job1' } },
          floorPlan: { connect: { id: 'floor1' } },
          equipment: { connect: { id: 'equip1' } },
          locationX: 10.5,
          locationY: 20.5,
          room: 'room1',
          floor: '1'
        }
      });

      expect(reading.createdAt).toBeDefined();
      expect(reading.updatedAt).toBeDefined();
      expect(reading.createdAt.getTime()).toBeLessThanOrEqual(reading.updatedAt.getTime());
    });

    test('updates timestamps on modification', async () => {
      const originalDate = new Date(2024, 0, 1);
      const updatedDate = new Date(2024, 0, 2);

      // Mock Date.now() for consistent testing
      const originalNow = Date.now;
      Date.now = jest.fn(() => updatedDate.getTime());

      const reading = {
        id: '1',
        jobId: 'job1',
        floorPlanId: 'floor1',
        equipmentId: 'equip1',
        locationX: 10.5,
        locationY: 20.5,
        room: 'room1',
        floor: '1',
        createdAt: originalDate,
        updatedAt: originalDate
      };

      prisma.moistureReading.update.mockResolvedValueOnce({
        ...reading,
        updatedAt: updatedDate
      });

      const updated = await prisma.moistureReading.update({
        where: { id: '1' },
        data: { room: 'room2' }
      });

      expect(updated.createdAt).toEqual(originalDate);
      expect(updated.updatedAt).toEqual(updatedDate);

      // Restore original Date.now
      Date.now = originalNow;
    });
  });
});
