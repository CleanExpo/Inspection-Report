import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { moistureService } from '../../app/services/moistureService';
import { prisma } from '../../app/lib/prisma';
import { createMockPrisma, mockSuccess } from '../setup';
import type { MoistureReading, MoistureMap } from '../../app/types/moisture';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: createMockPrisma(),
}));

describe('MoistureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReading: MoistureReading = {
    id: '1',
    mapId: '1',
    value: 15.5,
    materialType: 'Drywall',
    location: { x: 100, y: 200 },
    notes: 'Test reading',
    timestamp: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMap: MoistureMap = {
    id: '1',
    jobId: '123',
    name: 'Test Map',
    layout: {
      walls: [
        { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
        { start: { x: 100, y: 0 }, end: { x: 100, y: 100 } },
      ],
      doors: [
        { position: { x: 50, y: 0 }, width: 30, height: 80 },
      ],
      windows: [
        { position: { x: 75, y: 20 }, width: 40, height: 40 },
      ],
    },
    readings: [mockReading],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createMap', () => {
    test('should create a new moisture map', async () => {
      (prisma.moistureMap.create as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(mockMap)
      );

      const result = await moistureService.createMap({
        jobId: '123',
        name: 'Test Map',
        layout: mockMap.layout,
      });

      expect(prisma.moistureMap.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobId: '123',
          name: 'Test Map',
          layout: expect.any(Object),
        }),
        include: {
          readings: true,
        },
      });

      expect(result).toEqual(mockMap);
    });

    test('should validate layout data', async () => {
      await expect(moistureService.createMap({
        jobId: '123',
        name: 'Test Map',
        layout: {
          walls: [{ start: { x: 'invalid' } }], // Invalid coordinates
        } as any,
      })).rejects.toThrow('Invalid layout data');
    });
  });

  describe('getMaps', () => {
    test('should return all maps for a job', async () => {
      (prisma.moistureMap.findMany as jest.Mock).mockImplementationOnce(() => 
        mockSuccess([mockMap])
      );

      const result = await moistureService.getMaps('123');

      expect(prisma.moistureMap.findMany).toHaveBeenCalledWith({
        where: { jobId: '123' },
        include: {
          readings: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual([mockMap]);
    });
  });

  describe('getMapById', () => {
    test('should return map by id with readings', async () => {
      (prisma.moistureMap.findUnique as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(mockMap)
      );

      const result = await moistureService.getMapById('1');

      expect(prisma.moistureMap.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          readings: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });

      expect(result).toEqual(mockMap);
    });

    test('should return null if map not found', async () => {
      (prisma.moistureMap.findUnique as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(null)
      );

      const result = await moistureService.getMapById('999');

      expect(result).toBeNull();
    });
  });

  describe('updateMap', () => {
    test('should update map layout', async () => {
      const updatedMap = {
        ...mockMap,
        layout: {
          ...mockMap.layout,
          walls: [
            ...mockMap.layout.walls,
            { start: { x: 100, y: 100 }, end: { x: 0, y: 100 } },
          ],
        },
      };

      (prisma.moistureMap.update as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(updatedMap)
      );

      const result = await moistureService.updateMap('1', {
        layout: updatedMap.layout,
      });

      expect(prisma.moistureMap.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          layout: expect.any(Object),
        },
        include: {
          readings: true,
        },
      });

      expect(result).toEqual(updatedMap);
    });

    test('should validate updated layout', async () => {
      await expect(moistureService.updateMap('1', {
        layout: {
          walls: [{ start: { x: 'invalid' } }], // Invalid coordinates
        } as any,
      })).rejects.toThrow('Invalid layout data');
    });
  });

  describe('addReading', () => {
    test('should add new moisture reading', async () => {
      const updatedMap = {
        ...mockMap,
        readings: [
          ...mockMap.readings,
          {
            ...mockReading,
            id: '2',
            value: 18.2,
            location: { x: 150, y: 250 },
          },
        ],
      };

      (prisma.moistureMap.update as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(updatedMap)
      );

      const result = await moistureService.addReading('1', {
        value: 18.2,
        materialType: 'Drywall',
        location: { x: 150, y: 250 },
        notes: 'Test reading',
      });

      expect(prisma.moistureMap.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          readings: {
            create: expect.objectContaining({
              value: 18.2,
              materialType: 'Drywall',
              location: expect.any(Object),
              notes: 'Test reading',
            }),
          },
        },
        include: {
          readings: true,
        },
      });

      expect(result).toEqual(updatedMap);
    });

    test('should validate reading data', async () => {
      await expect(moistureService.addReading('1', {
        value: -1, // Invalid value
        materialType: 'Drywall',
        location: { x: 150, y: 250 },
      })).rejects.toThrow('Invalid reading value');
    });
  });

  describe('updateReading', () => {
    test('should update moisture reading', async () => {
      const updatedReading = {
        ...mockReading,
        value: 20.5,
        notes: 'Updated reading',
      };

      (prisma.moistureReading.update as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(updatedReading)
      );

      const result = await moistureService.updateReading('1', {
        value: 20.5,
        notes: 'Updated reading',
      });

      expect(prisma.moistureReading.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          value: 20.5,
          notes: 'Updated reading',
        },
      });

      expect(result).toEqual(updatedReading);
    });

    test('should validate updated reading value', async () => {
      await expect(moistureService.updateReading('1', {
        value: -1, // Invalid value
      })).rejects.toThrow('Invalid reading value');
    });
  });

  describe('deleteReading', () => {
    test('should delete moisture reading', async () => {
      (prisma.moistureReading.delete as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(mockReading)
      );

      await moistureService.deleteReading('1');

      expect(prisma.moistureReading.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getReadingHistory', () => {
    test('should return reading history for a location', async () => {
      const mockHistory = [
        { ...mockReading, timestamp: '2023-01-01T00:00:00Z', value: 15.5 },
        { ...mockReading, timestamp: '2023-01-02T00:00:00Z', value: 14.2 },
        { ...mockReading, timestamp: '2023-01-03T00:00:00Z', value: 12.8 },
      ];

      (prisma.moistureReading.findMany as jest.Mock).mockImplementationOnce(() => 
        mockSuccess(mockHistory)
      );

      const result = await moistureService.getReadingHistory('1', {
        x: 100,
        y: 200,
      }, {
        radius: 10,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-03'),
      });

      expect(prisma.moistureReading.findMany).toHaveBeenCalledWith({
        where: {
          mapId: '1',
          timestamp: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
          location: expect.any(Object),
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      expect(result).toEqual(mockHistory);
    });
  });
});
