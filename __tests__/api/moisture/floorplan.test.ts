import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, PATCH } from '../../../app/api/moisture/floorplan';
import { prisma } from '../../../app/lib/prisma';

// Mock Prisma client
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    floorPlan: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    annotation: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    moistureReading: {
      create: jest.fn(),
    },
  },
}));

describe('Floor Plan API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/moisture/floorplan', () => {
    it('should return floor plans for a given job ID', async () => {
      const mockFloorPlans = [
        {
          id: '1',
          jobId: 'job123',
          name: 'First Floor',
          level: 1,
          annotations: [],
          readings: [],
        },
      ];

      (prisma.floorPlan.findMany as jest.Mock).mockResolvedValue(mockFloorPlans);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/moisture/floorplan?jobId=job123')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFloorPlans);
      expect(prisma.floorPlan.findMany).toHaveBeenCalledWith({
        where: { jobId: 'job123' },
        include: {
          annotations: true,
          readings: {
            include: {
              dataPoints: true,
            },
          },
        },
        orderBy: {
          level: 'asc',
        },
      });
    });

    it('should return 400 if job ID is missing', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/moisture/floorplan')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Job ID is required' });
    });
  });

  describe('POST /api/moisture/floorplan', () => {
    it('should create a new floor plan', async () => {
      const mockFloorPlan = {
        id: '1',
        jobId: 'job123',
        name: 'First Floor',
        level: 1,
        imageUrl: 'http://example.com/image.jpg',
        width: 100,
        height: 100,
        scale: 1,
        annotations: [],
        readings: [],
      };

      (prisma.floorPlan.create as jest.Mock).mockResolvedValue(mockFloorPlan);

      const request = new NextRequest(
        'http://localhost:3000/api/moisture/floorplan',
        {
          method: 'POST',
          body: JSON.stringify({
            jobId: 'job123',
            name: 'First Floor',
            level: 1,
            imageUrl: 'http://example.com/image.jpg',
            width: 100,
            height: 100,
            scale: 1,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFloorPlan);
    });

    it('should return 400 if required fields are missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/moisture/floorplan',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required fields' });
    });
  });

  describe('PATCH /api/moisture/floorplan', () => {
    it('should add a new annotation', async () => {
      const mockAnnotation = {
        id: '1',
        floorPlanId: 'floor123',
        type: 'TEXT',
        content: 'Test annotation',
        x: 100,
        y: 100,
        color: '#FF0000',
      };

      (prisma.annotation.create as jest.Mock).mockResolvedValue(mockAnnotation);

      const request = new NextRequest(
        'http://localhost:3000/api/moisture/floorplan?action=add-annotation',
        {
          method: 'PATCH',
          body: JSON.stringify({
            floorPlanId: 'floor123',
            type: 'TEXT',
            content: 'Test annotation',
            x: 100,
            y: 100,
            color: '#FF0000',
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAnnotation);
    });

    it('should add a new moisture reading', async () => {
      const mockReading = {
        id: '1',
        jobId: 'job123',
        floorPlanId: 'floor123',
        room: 'Living Room',
        floor: 'Carpet',
        equipment: 'Moisture Meter',
        locationX: 100,
        locationY: 100,
        dataPoints: [
          { value: 15.5, unit: '%' },
        ],
      };

      (prisma.moistureReading.create as jest.Mock).mockResolvedValue(mockReading);

      const request = new NextRequest(
        'http://localhost:3000/api/moisture/floorplan?action=add-reading',
        {
          method: 'PATCH',
          body: JSON.stringify({
            jobId: 'job123',
            floorPlanId: 'floor123',
            room: 'Living Room',
            floor: 'Carpet',
            equipment: 'Moisture Meter',
            locationX: 100,
            locationY: 100,
            dataPoints: [
              { value: 15.5, unit: '%' },
            ],
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockReading);
    });
  });
});
