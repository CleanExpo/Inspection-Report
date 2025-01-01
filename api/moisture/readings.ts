import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { RateLimiter, RateLimitConfig } from '../../utils/rateLimiter';

// Rate limit configurations
const readConfig: RateLimitConfig = {
  tokensPerInterval: 100,  // 100 reads per interval
  interval: 1000,         // 1 second
  burstLimit: 120         // Allow burst up to 120 requests
};

const writeConfig: RateLimitConfig = {
  tokensPerInterval: 20,   // 20 writes per interval
  interval: 1000,         // 1 second
  burstLimit: 30          // Allow burst up to 30 requests
};

// Initialize rate limiters
const readLimiter = new RateLimiter(readConfig);
const writeLimiter = new RateLimiter(writeConfig);

// Import compression types only, we'll initialize middleware conditionally
import type { RequestHandler } from 'express';
let compression: () => RequestHandler;

// Initialize compression only on server side
if (typeof window === 'undefined') {
  compression = require('compression').default;
}

type MoistureUnit = 'WME' | 'REL' | 'PCT';

// Define the include type for consistent usage
const readingInclude = {
  dataPoints: true,
  equipment: true
} as const;

type MoistureReadingWithRelations = Prisma.MoistureReadingGetPayload<{
  include: typeof readingInclude;
}>;

// Type validation for request body
interface ReadingDataPointInput {
  value: number;
  unit: MoistureUnit;
  timestamp: string;
  depth?: number;
}

interface MoistureReadingInput {
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string;
  dataPoints: ReadingDataPointInput[];
  equipmentId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

// Validate reading input data
const validateReadingInput = (data: any): data is MoistureReadingInput => {
  return (
    typeof data.jobId === 'string' &&
    typeof data.locationX === 'number' &&
    typeof data.locationY === 'number' &&
    typeof data.room === 'string' &&
    typeof data.floor === 'number' &&
    (!data.notes || typeof data.notes === 'string') &&
    typeof data.equipmentId === 'string' &&
    Array.isArray(data.dataPoints) &&
    data.dataPoints.every((point: any) =>
      validateDataPoint(point)
    ) &&
    (!data.temperature || typeof data.temperature === 'number') &&
    (!data.humidity || typeof data.humidity === 'number') &&
    (!data.pressure || typeof data.pressure === 'number')
  );
};

const validateDataPoint = (data: any): data is ReadingDataPointInput => {
  return (
    typeof data.value === 'number' &&
    ['WME', 'REL', 'PCT'].includes(data.unit) &&
    !isNaN(Date.parse(data.timestamp)) &&
    (!data.depth || typeof data.depth === 'number')
  );
};

// Initialize compression middleware
const initializeCompression = () => {
  if (typeof window === 'undefined') {
    const compress = require('compression').default;
    const middleware = compress();
    return promisify(middleware);
  }
  return null;
};

const compressResponse = initializeCompression();

// Cache configuration
const CACHE_DURATION = 60; // 60 seconds
const cache = new Map<string, { data: any; etag: string; timestamp: number }>();

// Generate ETag for response data
function generateETag(data: any): string {
  return createHash('md5').update(JSON.stringify(data)).digest('hex');
}

// Check if cached response is still valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION * 1000;
}

// Enhanced API response type with compression support
interface EnhancedResponse extends NextApiResponse {
  compress?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: EnhancedResponse
) {
  // Apply compression if available
  if (compressResponse) {
    await compressResponse(req, res);
  }

  // Apply rate limiting based on request method
  const clientId = req.headers['x-client-id']?.toString() || req.socket.remoteAddress || 'default';
  const limiter = ['GET'].includes(req.method || '') ? readLimiter : writeLimiter;
  
  if (!limiter.tryConsume(clientId)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  // Add rate limit headers
  limiter.addRateLimitHeaders(res, clientId);
  
  try {
    switch (req.method) {
      case 'GET':
        return handleGetReadings(req, res);
      case 'POST':
        return handleCreateReading(req, res);
      case 'PUT':
        return handleUpdateReading(req, res);
      case 'DELETE':
        return handleDeleteReading(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Moisture Reading API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/moisture/readings
async function handleGetReadings(
  req: NextApiRequest,
  res: EnhancedResponse
) {
  const { 
    jobId, 
    room, 
    floor, 
    page = '1', 
    limit = '10',
    sortField = 'createdAt',
    sortDirection = 'desc'
  } = req.query;

  // Generate cache key from query parameters
  const cacheKey = JSON.stringify({ jobId, room, floor, page, limit, sortField, sortDirection });
  
  // Check for If-None-Match header
  const clientETag = req.headers['if-none-match'];

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    if (clientETag === cachedData.etag) {
      return res.status(304).end();
    }
    res.setHeader('ETag', cachedData.etag);
    res.setHeader('Cache-Control', `private, max-age=${CACHE_DURATION}`);
    return res.status(200).json(cachedData.data);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    ...(jobId && { jobId: jobId as string }),
    ...(room && { room: room as string }),
    ...(floor && { floor: parseInt(floor as string) })
  };

  try {
    // Get total count for pagination
    const total = await prisma.moistureReading.count({ where });

    // Get paginated readings with optimized query
    const readings = await prisma.moistureReading.findMany({
      skip,
      take: limitNum,
      where,
      include: readingInclude,
      orderBy: { 
        [sortField as string]: sortDirection as 'asc' | 'desc'
      }
    });

    // Ensure consistent data structure
    const response = {
      readings: readings.map((reading: MoistureReadingWithRelations) => ({
        ...reading,
        dataPoints: reading.dataPoints || [],
        equipment: reading.equipment || { id: '', model: '', serialNumber: '' }
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      }
    };

    // Generate ETag for response
    const etag = generateETag(response);
    
    // Cache the response
    cache.set(cacheKey, {
      data: response,
      etag,
      timestamp: Date.now()
    });

    // Set cache headers
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', `private, max-age=${CACHE_DURATION}`);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Get Readings Error:', error);
    return res.status(500).json({ error: 'Failed to fetch readings' });
  }
}

// POST /api/moisture/readings
async function handleCreateReading(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!validateReadingInput(req.body)) {
    return res.status(400).json({ error: 'Invalid reading data' });
  }

  const {
    jobId,
    locationX,
    locationY,
    room,
    floor,
    notes,
    dataPoints,
    equipmentId
  } = req.body;

  try {
    // Create reading with explicit type casting
    const createData = {
      jobId,
      locationX,
      locationY,
      room,
      floor,
      notes,
      equipmentId,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      pressure: req.body.pressure,
      dataPoints: {
        create: dataPoints.map(point => ({
          value: point.value,
          unit: point.unit,
          timestamp: new Date(point.timestamp),
          depth: point.depth
        }))
      }
    } as const;

    const reading = await prisma.moistureReading.create({
      data: createData as unknown as Prisma.MoistureReadingUncheckedCreateInput,
      include: readingInclude
    });

    return res.status(201).json(reading);
  } catch (error) {
    console.error('Create Reading Error:', error);
    return res.status(500).json({ error: 'Failed to create reading' });
  }
}

// PUT /api/moisture/readings/[id]
async function handleUpdateReading(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid reading ID' });
  }

  if (!validateReadingInput(req.body)) {
    return res.status(400).json({ error: 'Invalid reading data' });
  }

  const {
    jobId,
    locationX,
    locationY,
    room,
    floor,
    notes,
    dataPoints,
    equipmentId
  } = req.body;

  try {
    // Check if reading exists
    const existing = await prisma.moistureReading.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    // Update reading and data points in a transaction
    const reading = await prisma.$transaction(async (tx) => {
      // Delete existing data points
      await tx.readingDataPoint.deleteMany({
        where: { moistureReadingId: id }
      });

      const updateData = {
        jobId,
        locationX,
        locationY,
        room,
        floor,
        notes,
        equipmentId,
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        pressure: req.body.pressure,
        dataPoints: {
          create: dataPoints.map(point => ({
            value: point.value,
            unit: point.unit,
            timestamp: new Date(point.timestamp),
            depth: point.depth
          }))
        }
      } as const;

      // Update reading and create new data points
      return tx.moistureReading.update({
        where: { id },
        data: updateData as unknown as Prisma.MoistureReadingUncheckedUpdateInput,
        include: readingInclude
      });
    });

    return res.status(200).json(reading);
  } catch (error) {
    console.error('Update Reading Error:', error);
    return res.status(500).json({ error: 'Failed to update reading' });
  }
}

// DELETE /api/moisture/readings/[id]
async function handleDeleteReading(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid reading ID' });
  }

  try {
    // Check if reading exists
    const existing = await prisma.moistureReading.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    // Delete reading (will cascade delete data points)
    await prisma.moistureReading.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Delete Reading Error:', error);
    return res.status(500).json({ error: 'Failed to delete reading' });
  }
}
