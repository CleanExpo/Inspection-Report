import { exportService } from '../../app/services/exportService';
import { prisma } from '../../app/lib/prisma';
import { MaterialType } from '@prisma/client';
import type { MoistureReading } from '../../app/types/moisture';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    moistureReading: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    moistureMap: {
      findUnique: jest.fn(),
    },
    template: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('ExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToCsv', () => {
    it('exports data to CSV format', async () => {
      const mockData = [
        { id: '1', name: 'Test 1', value: 10 },
        { id: '2', name: 'Test 2', value: 20 },
      ];
      const fields = ['id', 'name', 'value'];

      const result = await exportService.exportToCsv(mockData, fields);

      const rows = result.split('\n');
      // Check header row
      expect(rows[0]).toBe('id,name,value');
      // Check data rows
      expect(rows[1]).toBe('1,"Test 1",10');
      expect(rows[2]).toBe('2,"Test 2",20');
    });

    it('handles errors during CSV export', async () => {
      const invalidData: any[] = [];
      const fields = ['id'];

      await expect(exportService.exportToCsv(invalidData, fields)).rejects.toThrow('Invalid data format');
    });
  });

  describe('exportMoistureReadingsToCsv', () => {
    it('exports moisture readings to CSV', async () => {
      const mockReadings = [
        {
          id: '1',
          mapId: 'map-1',
          value: 15.5,
          materialType: MaterialType.Drywall,
          locationX: 100,
          locationY: 200,
          notes: 'Test note',
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(mockReadings);

      const result = await exportService.exportMoistureReadingsToCsv('map-1');

      expect(prisma.moistureReading.findMany).toHaveBeenCalledWith({
        where: { mapId: 'map-1' },
        orderBy: { timestamp: 'asc' },
      });

      const rows = result.split('\n');
      // Check header row
      expect(rows[0]).toBe('id,value,materialType,locationX,locationY,notes,timestamp');
      // Check data row (note: actual timestamp string might vary)
      expect(rows[1]).toBe('1,15.5,Drywall,100,200,"Test note","2025-01-01T00:00:00.000Z"');
    });
  });

  describe('exportTemplateToJson', () => {
    it('exports template to JSON format', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Test Template',
        sections: [
          {
            id: '1',
            title: 'Section 1',
            fields: [
              {
                id: '1',
                label: 'Field 1',
                validationRules: [
                  {
                    id: '1',
                    type: 'required',
                    message: 'Required field',
                  },
                ],
              },
            ],
          },
        ],
      };

      (prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await exportService.exportTemplateToJson('1');
      const parsed = JSON.parse(result);

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          sections: {
            include: {
              fields: {
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });

      expect(parsed).toEqual(mockTemplate);
    });

    it('handles non-existent template', async () => {
      (prisma.template.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(exportService.exportTemplateToJson('non-existent')).rejects.toThrow('Template not found');
    });
  });

  describe('importMoistureReadingsFromCsv', () => {
    it('imports moisture readings from CSV', async () => {
      const csvString = `value,materialType,locationX,locationY,notes,timestamp
15.5,Drywall,100,200,Test note,2025-01-01T00:00:00.000Z`;

      const mockMap = { id: 'map-1' };
      const mockReading = {
        id: '1',
        mapId: 'map-1',
        value: 15.5,
        materialType: MaterialType.Drywall,
        locationX: 100,
        locationY: 200,
        notes: 'Test note',
        timestamp: new Date('2025-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.moistureMap.findUnique as jest.Mock).mockResolvedValue(mockMap);
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockReading]);

      const result = await exportService.importMoistureReadingsFromCsv('map-1', csvString);

      expect(prisma.moistureMap.findUnique).toHaveBeenCalledWith({
        where: { id: 'map-1' },
      });

      expect(result[0]).toMatchObject({
        id: '1',
        mapId: 'map-1',
        value: 15.5,
        materialType: MaterialType.Drywall,
        location: { x: 100, y: 200 },
        notes: 'Test note',
        timestamp: expect.any(String),
      });
    });

    it('handles non-existent map', async () => {
      (prisma.moistureMap.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(exportService.importMoistureReadingsFromCsv('non-existent', '')).rejects.toThrow('Map not found');
    });

    it('handles invalid CSV format', async () => {
      const invalidCsv = 'invalid,csv,format';
      (prisma.moistureMap.findUnique as jest.Mock).mockResolvedValue({ id: 'map-1' });
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Invalid CSV format'));

      await expect(exportService.importMoistureReadingsFromCsv('map-1', invalidCsv)).rejects.toThrow();
    });
  });

  describe('importTemplateFromJson', () => {
    it('imports template from JSON', async () => {
      const templateJson = JSON.stringify({
        id: '1',
        name: 'Test Template',
        sections: [
          {
            id: '1',
            title: 'Section 1',
            fields: [
              {
                id: '1',
                label: 'Field 1',
                validationRules: [
                  {
                    id: '1',
                    type: 'required',
                    message: 'Required field',
                  },
                ],
              },
            ],
          },
        ],
      });

      const mockTemplate = {
        id: '2', // New ID assigned by database
        name: 'Test Template',
        sections: [
          {
            id: '2',
            title: 'Section 1',
            fields: [
              {
                id: '2',
                label: 'Field 1',
                validationRules: [
                  {
                    id: '2',
                    type: 'required',
                    message: 'Required field',
                  },
                ],
              },
            ],
          },
        ],
      };

      (prisma.template.create as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await exportService.importTemplateFromJson(templateJson);

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Template',
          sections: expect.any(Object),
        }),
        include: {
          sections: {
            include: {
              fields: {
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(mockTemplate);
    });

    it('handles invalid JSON format', async () => {
      const invalidJson = 'invalid json';

      await expect(exportService.importTemplateFromJson(invalidJson)).rejects.toThrow();
    });
  });
});
