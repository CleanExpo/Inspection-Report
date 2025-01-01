import { NextResponse } from 'next/server';
import { GET, POST, PUT } from '../../../app/api/moisture/equipment';
import prisma from '../../../lib/prisma';
import { PrismaClient } from '@prisma/client';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) => {
      return {
        status: init?.status || 200,
        json: async () => body,
      };
    },
  },
}));

// Mock Prisma client
jest.mock('../../../lib/prisma', () => {
  const mockPrisma = {
    equipment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Type assertion for mocked prisma
const mockedPrisma = prisma as unknown as jest.Mocked<PrismaClient> & {
  equipment: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe('Equipment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET', () => {
    it('should return all equipment', async () => {
      const mockEquipment = [
        {
          id: '1',
          serialNumber: 'ABC-12345',
          model: 'Test Model',
          type: 'MOISTURE_METER',
          calibrationDate: new Date('2023-01-01'),
          nextCalibrationDue: new Date('2024-12-31'),
          status: 'ACTIVE',
          lastUsed: new Date('2023-12-01'),
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-12-01'),
        },
      ];

      mockedPrisma.equipment.findMany.mockResolvedValue(mockEquipment);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual(mockEquipment);
      expect(mockedPrisma.equipment.findMany).toHaveBeenCalledWith({
        orderBy: { lastUsed: 'desc' },
      });
    });
  });

  describe('POST', () => {
    it('should create new equipment with valid data', async () => {
      const mockEquipment = {
        serialNumber: 'ABC-12345',
        model: 'Test Model',
        type: 'MOISTURE_METER',
        calibrationDate: '2023-06-01',
        nextCalibrationDue: '2024-06-01',
        status: 'ACTIVE',
      };

      mockedPrisma.equipment.findUnique.mockResolvedValue(null);
      mockedPrisma.equipment.create.mockResolvedValue({
        ...mockEquipment,
        id: '1',
        calibrationDate: new Date(mockEquipment.calibrationDate),
        nextCalibrationDue: new Date(mockEquipment.nextCalibrationDue),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      });

      const request = new Request('http://localhost/api/moisture/equipment', {
        method: 'POST',
        body: JSON.stringify(mockEquipment),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.serialNumber).toBe(mockEquipment.serialNumber);
      expect(mockedPrisma.equipment.create).toHaveBeenCalled();
    });

    it('should reject invalid equipment data', async () => {
      const invalidEquipment = {
        serialNumber: 'invalid',
        model: 'Test Model',
        type: 'INVALID_TYPE',
        calibrationDate: '2023-01-01',
        nextCalibrationDue: '2024-01-01',
        status: 'INVALID_STATUS',
      };

      const request = new Request('http://localhost/api/moisture/equipment', {
        method: 'POST',
        body: JSON.stringify(invalidEquipment),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
      expect(mockedPrisma.equipment.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('should update existing equipment', async () => {
      const mockEquipment = {
        id: '1',
        serialNumber: 'ABC-12345',
        model: 'Updated Model',
        type: 'MOISTURE_METER',
        calibrationDate: '2023-06-01',
        nextCalibrationDue: '2024-06-01',
        status: 'ACTIVE',
      };

      mockedPrisma.equipment.findUnique.mockResolvedValue({ id: '1' });
      mockedPrisma.equipment.update.mockResolvedValue({
        ...mockEquipment,
        calibrationDate: new Date(mockEquipment.calibrationDate),
        nextCalibrationDue: new Date(mockEquipment.nextCalibrationDue),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-12-01'),
      });

      const request = new Request('http://localhost/api/moisture/equipment', {
        method: 'PUT',
        body: JSON.stringify(mockEquipment),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.model).toBe(mockEquipment.model);
      expect(mockedPrisma.equipment.update).toHaveBeenCalled();
    });

    it('should reject update with invalid data', async () => {
      const invalidEquipment = {
        id: '1',
        serialNumber: 'invalid',
        model: 'Updated Model',
        type: 'INVALID_TYPE',
        calibrationDate: '2023-01-01',
        nextCalibrationDue: '2024-01-01',
        status: 'INVALID_STATUS',
      };

      const request = new Request('http://localhost/api/moisture/equipment', {
        method: 'PUT',
        body: JSON.stringify(invalidEquipment),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
      expect(mockedPrisma.equipment.update).not.toHaveBeenCalled();
    });

    it('should handle non-existent equipment', async () => {
      const mockEquipment = {
        id: 'non-existent',
        serialNumber: 'ABC-12345',
        model: 'Test Model',
        type: 'MOISTURE_METER',
        calibrationDate: '2023-06-01',
        nextCalibrationDue: '2024-06-01',
        status: 'ACTIVE',
      };

      mockedPrisma.equipment.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/moisture/equipment', {
        method: 'PUT',
        body: JSON.stringify(mockEquipment),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Equipment not found');
      expect(mockedPrisma.equipment.update).not.toHaveBeenCalled();
    });
  });
});
