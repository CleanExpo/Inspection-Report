import { describe, expect, it, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/jobs/[jobNumber]/power-readings/route';

// Define types for our mocks
interface PowerReading {
  id: string;
  jobNumber: string;
  equipmentId: string;
  equipmentName: string;
  watts: number;
  amps: number;
  voltage: number;
  timestamp: string;  // Changed from Date to string
}

interface Job {
  id: string;
  jobNumber: string;
  totalEquipmentPower: number;
  status: 'pending' | 'in-progress' | 'completed';
  lastUpdated: Date;
}

// Get the mock Prisma instance from global
const mockPrisma = (global as any).__prisma__;

describe('Power Readings API', () => {
  const mockJobNumber = '123456-01';
  const mockJob: Job = {
    id: '1',
    jobNumber: mockJobNumber,
    totalEquipmentPower: 5000,
    status: 'pending',
    lastUpdated: new Date()
  };

  const mockPowerReadings: PowerReading[] = [
    {
      id: '1',
      jobNumber: mockJobNumber,
      equipmentId: 'dehu-1',
      equipmentName: 'Dehumidifier 1',
      watts: 1500,
      amps: 12.5,
      voltage: 120,
      timestamp: new Date().toISOString()  // Store as ISO string
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up default mock implementations
    mockPrisma.powerReading.findMany.mockResolvedValue([]);
    mockPrisma.powerReading.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.powerReading.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.job.findUnique.mockResolvedValue(null);
    mockPrisma.job.update.mockResolvedValue(mockJob);
  });

  describe('GET /api/jobs/[jobNumber]/power-readings', () => {
    it('should return 400 for invalid job number format', async () => {
      const request = new NextRequest('http://localhost/api/jobs/invalid/power-readings');
      const response = await GET(request, { params: { jobNumber: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid job number format');
    });

    it('should return 404 when job is not found', async () => {
      mockPrisma.powerReading.findMany.mockResolvedValueOnce([]);
      mockPrisma.job.findUnique.mockResolvedValueOnce(null);

      const request = new NextRequest(`http://localhost/api/jobs/${mockJobNumber}/power-readings`);
      const response = await GET(request, { params: { jobNumber: mockJobNumber } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Job not found');
    });

    it('should return power readings successfully', async () => {
      mockPrisma.powerReading.findMany.mockResolvedValueOnce(mockPowerReadings);
      mockPrisma.job.findUnique.mockResolvedValueOnce(mockJob);

      const request = new NextRequest(`http://localhost/api/jobs/${mockJobNumber}/power-readings`);
      const response = await GET(request, { params: { jobNumber: mockJobNumber } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.readings).toEqual(mockPowerReadings);
      expect(data.totalEquipmentPower).toBe(mockJob.totalEquipmentPower);
    });
  });

  describe('POST /api/jobs/[jobNumber]/power-readings', () => {
    const validReadings = {
      readings: [{
        equipmentId: 'dehu-1',
        equipmentName: 'Dehumidifier 1',
        watts: 1500,
        amps: 12.5,
        voltage: 120,
        timestamp: new Date().toISOString()
      }]
    };

    it('should return 400 for invalid job number format', async () => {
      const request = new NextRequest(
        'http://localhost/api/jobs/invalid/power-readings',
        { method: 'POST', body: JSON.stringify(validReadings) }
      );
      const response = await POST(request, { params: { jobNumber: 'invalid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid job number format');
    });

    it('should validate power calculations', async () => {
      const invalidReadings = {
        readings: [{
          ...validReadings.readings[0],
          watts: 2000 // This doesn't match amps * voltage
        }]
      };

      const request = new NextRequest(
        `http://localhost/api/jobs/${mockJobNumber}/power-readings`,
        { method: 'POST', body: JSON.stringify(invalidReadings) }
      );
      const response = await POST(request, { params: { jobNumber: mockJobNumber } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid power calculations detected (W = A × V)');
    });

    it('should validate total power against equipment capacity', async () => {
      const lowCapacityJob = { ...mockJob, totalEquipmentPower: 1000 };
      mockPrisma.job.findUnique.mockResolvedValueOnce(lowCapacityJob);

      const request = new NextRequest(
        `http://localhost/api/jobs/${mockJobNumber}/power-readings`,
        { method: 'POST', body: JSON.stringify(validReadings) }
      );
      const response = await POST(request, { params: { jobNumber: mockJobNumber } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('exceeds equipment capacity');
    });

    it('should save power readings successfully', async () => {
      mockPrisma.job.findUnique.mockResolvedValueOnce(mockJob);

      const request = new NextRequest(
        `http://localhost/api/jobs/${mockJobNumber}/power-readings`,
        { method: 'POST', body: JSON.stringify(validReadings) }
      );
      const response = await POST(request, { params: { jobNumber: mockJobNumber } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
