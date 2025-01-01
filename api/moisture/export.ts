import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { ExportRequestSchema } from './types/schemas';
import type { z } from 'zod';
import { withErrorHandlingAndTiming } from './middleware/errorHandler';
import { ErrorCode, createErrorResponse } from './utils/errorCodes';

// Infer types from Zod schemas
type ExportRequest = z.infer<typeof ExportRequestSchema>;

// Response types
interface ExportResponse {
  readings: ReadingExport[];
  exportedAt: string;
  totalReadings: number;
  totalDataPoints: number;
}

interface ReadingExport {
  id: string;
  jobId: string;
  location: {
    room: string;
    floor: string;
    x: number;
    y: number;
  };
  dataPoints: DataPointExport[];
  equipment: {
    model: string;
    serialNumber: string;
  };
  metadata?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface DataPointExport {
  value: number;
  unit: string;
  createdAt: string;
}

// Extended Prisma type with environmental data
type MoistureReadingWithRelations = Prisma.MoistureReadingGetPayload<{
  include: {
    dataPoints: true;
    equipment: true;
  };
}> & {
  // Make environmental fields optional since they might not be included in all queries
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExportResponse | string>
) {
  if (req.method !== 'POST') {
    throw createErrorResponse(
      ErrorCode.INVALID_REQUEST,
      'Method not allowed',
      { allowedMethods: ['POST'] }
    );
  }

  const result = ExportRequestSchema.safeParse(req.body);
  
  if (!result.success) {
    throw result.error;
  }

  const { options, filters } = result.data;

  // Build query filters
    const where: Prisma.MoistureReadingWhereInput = {
      ...(filters?.jobId && { jobId: filters.jobId }),
      ...(filters?.room && { room: filters.room }),
      ...(filters?.floor && { floor: filters.floor }),
      ...(filters?.equipmentId && { equipmentId: filters.equipmentId }),
      ...(options.dateRange && {
        createdAt: {
          gte: new Date(options.dateRange.start),
          lte: new Date(options.dateRange.end)
        }
      })
    };

    // Fetch readings with related data
    const readings = await prisma.moistureReading.findMany({
      where,
      include: {
        dataPoints: true,
        equipment: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }) as MoistureReadingWithRelations[];

    // Transform data based on format
    if (options.format === 'csv') {
      const csvData = generateCSV(readings, options.includeMetadata);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=moisture-readings.csv');
      return res.status(200).send(csvData);
    } else {
      const jsonData = generateJSON(readings, options.includeMetadata);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=moisture-readings.json');
      return res.status(200).json(jsonData);
    }
}

export default withErrorHandlingAndTiming(handler);

// Generate CSV format
function generateCSV(
  readings: MoistureReadingWithRelations[],
  includeMetadata: boolean = false
): string {
  const headers = [
    'Reading ID',
    'Job ID',
    'Room',
    'Floor',
    'Location X',
    'Location Y',
    'Value',
    'Unit',
    'Created At',
    'Equipment Model',
    'Equipment Serial',
    ...(includeMetadata ? [
      'Temperature',
      'Humidity',
      'Pressure',
      'Created At',
      'Updated At'
    ] : [])
  ].join(',');

  const rows = readings.flatMap(reading =>
    reading.dataPoints.map(point => [
      reading.id,
      reading.jobId,
      reading.room,
      reading.floor,
      reading.locationX,
      reading.locationY,
      point.value,
      point.unit,
      point.createdAt.toISOString(),
      reading.equipment.model,
      reading.equipment.serialNumber,
      ...(includeMetadata ? [
        reading.temperature ?? '',
        reading.humidity ?? '',
        reading.pressure ?? '',
        reading.createdAt.toISOString(),
        reading.updatedAt.toISOString()
      ] : [])
    ].join(','))
  );

  return [headers, ...rows].join('\n');
}

// Generate JSON format
function generateJSON(
  readings: MoistureReadingWithRelations[],
  includeMetadata: boolean = false
): ExportResponse {
  return {
    readings: readings.map(reading => ({
      id: reading.id,
      jobId: reading.jobId,
      location: {
        room: reading.room,
        floor: reading.floor,
        x: reading.locationX,
        y: reading.locationY
      },
      dataPoints: reading.dataPoints.map(point => ({
        value: point.value,
        unit: point.unit,
        createdAt: point.createdAt.toISOString()
      })),
      equipment: {
        model: reading.equipment.model,
        serialNumber: reading.equipment.serialNumber
      },
      ...(includeMetadata && {
        metadata: {
          temperature: reading.temperature ?? undefined,
          humidity: reading.humidity ?? undefined,
          pressure: reading.pressure ?? undefined,
          createdAt: reading.createdAt.toISOString(),
          updatedAt: reading.updatedAt.toISOString()
        }
      })
    })),
    exportedAt: new Date().toISOString(),
    totalReadings: readings.length,
    totalDataPoints: readings.reduce((sum, r) => sum + r.dataPoints.length, 0)
  };
}
