import type { Prisma } from '@prisma/client';
import { prisma } from './client';

export interface TimeRangeQuery {
  startDate: Date;
  endDate: Date;
  jobId: string;
  room?: string;
  floor?: string;
}

export interface LocationQuery {
  jobId: string;
  room?: string;
  floor?: string;
}

/**
 * Get moisture readings within a specific time range
 */
export async function getMoistureReadingsInTimeRange({
  startDate,
  endDate,
  jobId,
  room,
  floor
}: TimeRangeQuery) {
  const where: Prisma.MoistureReadingWhereInput = {
    jobId,
    ...(room && { room }),
    ...(floor !== undefined && { floor }),
    dataPoints: {
      some: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }
  };

  return prisma.moistureReading.findMany({
    where,
    include: {
      dataPoints: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}

/**
 * Get moisture readings by location
 */
export async function getMoistureReadingsByLocation({
  jobId,
  room,
  floor
}: LocationQuery) {
  const where: Prisma.MoistureReadingWhereInput = {
    jobId,
    ...(room && { room }),
    ...(floor !== undefined && { floor })
  };

  return prisma.moistureReading.findMany({
    where,
    include: {
      dataPoints: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1 // Get only the most recent reading
      }
    }
  });
}

/**
 * Get average moisture values by location
 */
export async function getAverageMoistureByLocation({
  jobId,
  room,
  floor
}: LocationQuery) {
  const readings = await prisma.moistureReading.findMany({
    where: {
      jobId,
      ...(room && { room }),
      ...(floor !== undefined && { floor })
    },
    include: {
      dataPoints: true
    }
  });

  // Group readings by location and calculate averages
  const locationAverages = new Map<string, {
    x: number;
    y: number;
    average: number;
    count: number;
  }>();

  readings.forEach(reading => {
    const key = `${reading.locationX},${reading.locationY}`;
    const values = reading.dataPoints.map(dp => dp.value);
    const existing = locationAverages.get(key);

    if (existing) {
      const allValues = values.concat(Array(existing.count).fill(existing.average));
      existing.average = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      existing.count += values.length;
    } else {
      locationAverages.set(key, {
        x: reading.locationX,
        y: reading.locationY,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length
      });
    }
  });

  return Array.from(locationAverages.values());
}
