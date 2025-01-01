import { NextApiRequest, NextApiResponse } from 'next';
import { prisma, type MoistureReading } from '../../lib/prisma';
import { AnalyticsService } from './analytics/analyticsService';
import { z } from 'zod';

// Input validation schema
const requestSchema = z.object({
  jobId: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});

type AnalyticsRequest = z.infer<typeof requestSchema>;

const analyticsService = new AnalyticsService();

export default async function moistureAnalyticsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: result.error.issues
      });
    }

    const { jobId, startDate, endDate } = result.data;

    // Validate date range
    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'Invalid date range: startDate must be before endDate'
      });
    }

    // Fetch moisture readings from database
    const readings = await prisma.moistureReading.findMany({
      where: {
        jobId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Map database readings to analytics format
    const analyticsReadings = readings.map(reading => ({
      value: reading.temperature || 0, // Use temperature as value, default to 0 if null
      timestamp: reading.createdAt,
      location: `${reading.room}-${reading.floor}`,
      x: reading.locationX,
      y: reading.locationY,
      z: 0 // Default height since not in schema
    }));

    // Process analytics
    const analysis = await analyticsService.analyzeReadings(analyticsReadings);

    return res.status(200).json({
      ...analysis,
      metadata: {
        jobId,
        startDate,
        endDate,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Moisture analytics error:', error);
    return res.status(500).json({
      error: 'Failed to process moisture analytics'
    });
  }
}
