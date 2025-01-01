import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { withMiddleware, withErrorHandlingAndTiming } from '../middleware/errorHandler';
import { ErrorCode, ErrorResponse, createErrorResponse } from '../utils/errorCodes';
import { withValidation } from '../middleware/validation';
import { withClaimPrevention } from '../middleware/claim-prevention';
import { withCors } from '../middleware/cors';
import { withRequestLimits } from '../middleware/requestLimits';
import { withSanitization } from '../middleware/sanitization';
import { withRateLimiting } from '../middleware/rateLimiting';
import { withRetryLogic } from '../middleware/retryLogic';
import { withTimeout } from '../middleware/timeout';
import { withAuditTrail } from '../middleware/auditTrail';
import { logger } from '../utils/logger';
import { processTimeSeries, analyzeTrend, detectChangePoints } from './core';
import { MoistureReadingData, DataPointData } from '../types/readings';
import { getPrismaClient } from '../utils/prisma-singleton';
import {
  AnalyticsRequestSchema,
  AnalyticsRequest,
  AnalyticsResponse,
  ExtendedChangePoint,
  ValidatedAnalyticsRequest
} from './schemas';
import {
  getSeverity,
  isNearby,
  calculateStandardDeviation,
  validateDateRange,
  filterValidReadings
} from './utils';

const handler = async (
  req: NextApiRequest & { validatedData: ValidatedAnalyticsRequest },
  res: NextApiResponse<AnalyticsResponse | ErrorResponse>
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { jobId, timeRange, options } = req.validatedData;
  
  logger.info('Starting analytics processing', { jobId, timeRange, options });

  // Get Prisma client instance
  const prisma = await getPrismaClient();

  // Fetch moisture readings for the specified time range
  logger.debug('Fetching moisture readings', { jobId, timeRange });
  // Validate time range
  const startDate = new Date(timeRange.startDate);
  const endDate = new Date(timeRange.endDate);
  validateDateRange(startDate, endDate);

  // Define the Prisma query type
  type MoistureReadingWithDataPoints = Prisma.MoistureReadingGetPayload<{
    include: { 
      dataPoints: true 
    }
  }> & {
    dataPoints: Array<DataPointData & { value: number }>;
  };

  // Execute the query with proper type handling
  const readings = await prisma.moistureReading.findMany({
    where: {
      jobId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      AND: [
        { locationX: { gte: 0 } },
        { locationY: { gte: 0 } },
        {
          dataPoints: {
            some: {
              value: { gte: 0 }
            }
          }
        }
      ]
    },
    include: {
      dataPoints: {
        where: {
          value: { gte: 0 }
        }
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  }) as MoistureReadingWithDataPoints[];

  // Filter and validate readings
  const validReadings = filterValidReadings(readings);

  // Additional validation of retrieved data
  validReadings.forEach(reading => {
    if (!reading.dataPoints.length) {
      logger.warn('Reading found with no valid data points', { readingId: reading.id });
    }
    if (reading.locationX < 0 || reading.locationY < 0) {
      logger.warn('Reading found with invalid coordinates', { 
        readingId: reading.id,
        coordinates: { x: reading.locationX, y: reading.locationY }
      });
    }
  });

  if (!validReadings.length) {
    logger.warn('No valid readings found for analysis', { jobId, timeRange });
    throw createErrorResponse(
      ErrorCode.NO_DATA,
      'No valid moisture readings found for the specified time range',
      {
        jobId,
        timeRange,
        totalReadingsAttempted: readings.length
      }
    );
  }

  logger.info('Retrieved moisture readings', { count: validReadings.length });

  // Process time series data
  logger.debug('Processing time series data', { resolution: options.resolution });
  
  if (validReadings.length < 2) {
    logger.warn('Insufficient data points for analysis', { jobId, count: validReadings.length });
    throw createErrorResponse(
      ErrorCode.INSUFFICIENT_DATA,
      'At least 2 valid readings are required for analysis',
      {
        jobId,
        readingsFound: validReadings.length
      }
    );
  }

  const timeSeriesData = {
    points: validReadings.flatMap((reading) => 
      reading.dataPoints.map(dp => ({
        timestamp: reading.createdAt.toISOString(),
        value: dp.value,
        metadata: {
          room: reading.room,
          floor: reading.floor,
          locationX: reading.locationX,
          locationY: reading.locationY,
        },
      }))
    ),
    interval: options.resolution,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate,
  };

  const processedData = processTimeSeries(timeSeriesData);
  logger.debug('Time series processing complete', { 
    dataPoints: processedData.normalizedData.length 
  });
  
  // Analyze trends if requested
  let trends;
  if (options.includeTrends) {
    try {
      trends = analyzeTrend(processedData.normalizedData);
      if (!trends) {
        logger.warn('Trend analysis produced no results', { jobId });
        throw createErrorResponse(
          ErrorCode.ANALYSIS_ERROR,
          'Unable to analyze trends with the provided data',
          {
            jobId,
            dataPoints: processedData.normalizedData.length
          }
        );
      }
    } catch (error) {
      logger.error('Error during trend analysis', { jobId, error });
      throw createErrorResponse(
        ErrorCode.ANALYSIS_ERROR,
        'Failed to analyze moisture trends',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Detect hotspots if requested
  let hotspots;
  if (options.includeHotspots) {
    try {
      const rawChangePoints = detectChangePoints(processedData.normalizedData, 0.05);
      if (!rawChangePoints || rawChangePoints.length === 0) {
        logger.info('No significant change points detected', { jobId });
      } else {
        const changePoints = rawChangePoints.map(cp => {
          const point = timeSeriesData.points[0];
          return {
            ...cp,
            metadata: {
              locationX: point.metadata.locationX,
              locationY: point.metadata.locationY,
              room: point.metadata.room,
              floor: point.metadata.floor,
            }
          };
        }) as ExtendedChangePoint[];

        hotspots = changePoints.map(cp => ({
          center: {
            x: cp.metadata.locationX,
            y: cp.metadata.locationY,
            room: cp.metadata.room,
            floor: cp.metadata.floor,
          },
          radius: 1.0, // Default radius, could be calculated based on nearby readings
          severity: getSeverity(cp.magnitude),
          readings: readings
            .filter((r: MoistureReadingData) => 
              isNearby(r.locationX, r.locationY, cp.metadata.locationX, cp.metadata.locationY)
            )
            .flatMap((r: MoistureReadingData & { dataPoints: DataPointData[] }) => 
              r.dataPoints.map((dp: DataPointData) => ({
                value: dp.value,
                unit: dp.unit,
                timestamp: r.createdAt.toISOString(),
              })))
        }));
      }
    } catch (error) {
      logger.error('Error during hotspot detection', { jobId, error });
      throw createErrorResponse(
        ErrorCode.ANALYSIS_ERROR,
        'Failed to detect moisture hotspots',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  try {
    // Calculate summary statistics
    const values = readings.flatMap((r: MoistureReadingData & { dataPoints: DataPointData[] }) => 
      r.dataPoints.map((dp: DataPointData) => dp.value));
    
    const summary = {
      totalReadings: values.length,
      averageValue: values.reduce((a: number, b: number) => a + b, 0) / values.length,
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
      standardDeviation: calculateStandardDeviation(values),
    };

    // Send successful response
    return res.status(200).json({
      jobId,
      timeRange,
      timeSeriesData: processedData.normalizedData,
      trends,
      hotspots,
      summary,
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startDate.getTime()
      }
    });
  } catch (error) {
    logger.error('Error calculating summary statistics', { jobId, error });
    throw createErrorResponse(
      ErrorCode.ANALYSIS_ERROR,
      'Failed to calculate moisture statistics',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Apply middleware chain
const withAnalyticsMiddleware = withMiddleware(
  withErrorHandlingAndTiming,
  withRetryLogic,
  withTimeout(60000), // 60 second timeout for analytics
  withRateLimiting,
  withRequestLimits,
  withSanitization,
  withClaimPrevention,
  withCors,
  withAuditTrail
);

// Export handler with validation and middleware
export default withAnalyticsMiddleware(
  withValidation(AnalyticsRequestSchema, handler)
);
