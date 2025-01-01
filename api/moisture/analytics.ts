import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AnalyticsRequestSchema, TimeframeSchema } from './types/schemas';
import { AnalyticsResponse, ErrorResponse } from './types/responses';
import { withValidation, createErrorResponse } from './middleware/validation';
import { withLogging } from '../../middleware/logging';

// Internal types for data processing
interface TrendPoint {
  createdAt: string;
  averageValue: number;
  minValue: number;
  maxValue: number;
  readingCount: number;
}

interface LocationHotspot {
  x: number;
  y: number;
  averageValue: number;
  readingCount: number;
}

type MoistureReadingWithDataPoints = Prisma.MoistureReadingGetPayload<{
  include: { dataPoints: true }
}>;

async function handler(
  req: NextApiRequest & { validatedData: z.infer<typeof AnalyticsRequestSchema> },
  res: NextApiResponse<AnalyticsResponse | ErrorResponse>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json(
        createErrorResponse(405, 'Method not allowed', { allowedMethods: ['GET'] })
      );
    }

    const { jobId, room, floor, timeframe } = req.validatedData;
    const timeframeDate = getTimeframeDate(timeframe);
    
    process.stderr.write(`Analytics Request: ${JSON.stringify({ jobId, room, floor, timeframe, timeframeDate: timeframeDate.toISOString() })}\n`);

    // Enable query logging
    prisma.$use(async (params, next) => {
      const before = Date.now();
      process.stderr.write(`Query: ${JSON.stringify(params)}\n`);
      const result = await next(params);
      const after = Date.now();
      process.stderr.write(`Query took ${after - before}ms\n`);
      return result;
    });
    
    // Get trends data
    const trends = await getMoistureTrends(
      jobId,
      room,
      floor,
      timeframeDate
    );

    process.stderr.write(`Trends Result: ${JSON.stringify({ count: trends.length })}\n`);
    
    if (trends.length === 0) {
      process.stderr.write(`No readings found for criteria: ${JSON.stringify({ jobId, room, floor, timeframe })}\n`);
      return res.status(404).json(
        createErrorResponse(404, 'No moisture readings found for the specified criteria')
      );
    }

    // Get hotspots data
    process.stderr.write('Found trends, getting hotspots...\n');
    const hotspots = await getMoistureHotspots(
      jobId,
      room,
      floor
    );
    process.stderr.write(`Hotspots Result: ${JSON.stringify({ count: hotspots.length })}\n`);

    process.stderr.write('Building response...\n');
    const response: AnalyticsResponse = {
      timeframe,
      summary: {
        average: trends.reduce((sum, t) => sum + t.averageValue, 0) / trends.length,
        max: Math.max(...trends.map(t => t.maxValue)),
        min: Math.min(...trends.map(t => t.minValue)),
        readings: trends.reduce((sum, t) => sum + t.readingCount, 0),
        unit: 'WME' // Default unit, could be made dynamic based on readings
      },
      trends: trends.map(t => ({
        timestamp: t.createdAt,
        value: t.averageValue
      })),
      hotspots: hotspots.map(h => ({
        location: {
          room: room || '',
          floor: floor || '',
          x: h.x,
          y: h.y
        },
        intensity: h.averageValue
      }))
    };

    process.stderr.write(`Sending response: ${JSON.stringify(response)}\n`);
    res.status(200).json(response);
  } catch (error) {
    process.stderr.write(`Analytics Error: ${error instanceof Error ? error.stack : error}\n`);
    res.status(500).json(
      createErrorResponse(
        500,
        'Failed to retrieve analytics data',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
}

// Helper to get date based on timeframe string
function getTimeframeDate(timeframe: z.infer<typeof TimeframeSchema>): Date {
  const now = new Date();
  switch (timeframe as z.infer<typeof TimeframeSchema>) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '12h':
      return new Date(now.getTime() - 12 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
  }
}

// Get moisture reading trends over time
async function getMoistureTrends(
  jobId: string,
  room?: string,
  floor?: string,
  since?: Date
): Promise<TrendPoint[]> {
  const where: Prisma.MoistureReadingWhereInput = {
    jobId,
    ...(room && { room }),
    ...(floor !== undefined && { floor }),
    ...(since && {
      dataPoints: {
        some: {
          createdAt: {
            gte: since
          }
        }
      }
    })
  };

  process.stderr.write(`Moisture Trends Query: ${JSON.stringify(where)}\n`);
  
  const readings = await prisma.moistureReading.findMany({
    where,
    include: {
      dataPoints: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Group readings by hour
  const hourlyGroups = new Map<string, number[]>();
  
  process.stderr.write(`Found Readings: ${readings.length}\n`);
  if (readings.length > 0) {
    const sample = readings[0];
    process.stderr.write(`Reading Sample: ${JSON.stringify({
      id: sample.id,
      jobId: sample.jobId,
      dataPointCount: sample.dataPoints.length
    })}\n`);
  }
  
  readings.forEach((reading: MoistureReadingWithDataPoints) => {
    reading.dataPoints.forEach((point) => {
      const hour = point.createdAt.toISOString().slice(0, 13);
      const values = hourlyGroups.get(hour) || [];
      values.push(point.value);
      hourlyGroups.set(hour, values);
    });
  });

  // Calculate statistics for each hour
  const result = Array.from(hourlyGroups.entries()).map(([hour, values]) => ({
    createdAt: hour + ':00:00Z',
    averageValue: values.reduce((a, b) => a + b, 0) / values.length,
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
    readingCount: values.length
  }));
  
  process.stderr.write(`Processed Trends: ${result.length}\n`);
  if (result.length > 0) {
    process.stderr.write(`Trends Sample: ${JSON.stringify({
      timestamp: result[0].createdAt,
      avgValue: result[0].averageValue.toFixed(2)
    })}\n`);
  }
  return result;
}

// Get moisture hotspots based on location
async function getMoistureHotspots(
  jobId: string,
  room?: string,
  floor?: string
): Promise<LocationHotspot[]> {
  const where: Prisma.MoistureReadingWhereInput = {
    jobId,
    ...(room && { room }),
    ...(floor !== undefined && { floor })
  };

  const readings = await prisma.moistureReading.findMany({
    where,
    include: {
      dataPoints: true
    }
  });

  // Group readings by location (rounded to nearest 0.5)
  const locationGroups = new Map<string, number[]>();
  
  readings.forEach((reading: MoistureReadingWithDataPoints) => {
    const x = Math.round(reading.locationX * 2) / 2;
    const y = Math.round(reading.locationY * 2) / 2;
    const key = `${x},${y}`;
    
    const values = locationGroups.get(key) || [];
    reading.dataPoints.forEach((point) => {
      values.push(point.value);
    });
    locationGroups.set(key, values);
  });

  // Calculate average for each location
  return Array.from(locationGroups.entries())
    .map(([location, values]) => {
      const [x, y] = location.split(',').map(Number);
      return {
        x,
        y,
        averageValue: values.reduce((a, b) => a + b, 0) / values.length,
        readingCount: values.length
      };
    })
    // Sort by average value descending to identify hotspots
    .sort((a, b) => b.averageValue - a.averageValue);
}

export default withLogging(withValidation(AnalyticsRequestSchema, handler, 'query'));
