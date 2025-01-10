import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate, authorize, requirePermissions } from '../middleware/authenticate';
import { UserRole, Permissions } from '../types/auth';
import { 
  MaterialType, 
  CreateReadingInput, 
  UpdateReadingInput,
  BatchCreateReadingsInput,
  BatchCreateReadingsResponse 
} from '../types/readings';

const router = Router();

// Validation schemas
const createReadingSchema = z.object({
  jobId: z.string().uuid(),
  value: z.number().min(0).max(100),
  materialType: z.nativeEnum(MaterialType),
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    floor: z.number().int().min(0),
    room: z.string(),
    notes: z.string().optional(),
  }),
  metadata: z.object({
    temperature: z.number(),
    humidity: z.number(),
    pressure: z.number(),
    depth: z.number().optional(),
    surfaceType: z.string().optional(),
  }),
  equipmentId: z.string().uuid().optional(),
});

const updateReadingSchema = createReadingSchema.partial();

// Routes
router.get('/', authenticate, requirePermissions(Permissions.READ_READINGS), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, jobId, materialType, minValue, maxValue } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(jobId && { jobId: String(jobId) }),
      ...(materialType && { materialType: String(materialType) }),
      ...(minValue && { value: { gte: Number(minValue) } }),
      ...(maxValue && { value: { lte: Number(maxValue) } }),
    };

    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          job: true,
          equipment: true,
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.reading.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        readings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', 
  authenticate, 
  authorize(UserRole.INSPECTOR, UserRole.ADMIN),
  validateRequest({ body: createReadingSchema }), 
  async (req, res, next) => {
    try {
      const readingData: CreateReadingInput = req.body;

      // Verify job exists and is active
      const job = await prisma.job.findUnique({
        where: { id: readingData.jobId },
      });

      if (!job) {
        throw createError.notFound('Job not found');
      }

      if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
        throw createError.badRequest('Cannot add readings to a completed or cancelled job');
      }

      const reading = await prisma.reading.create({
        data: {
          ...readingData,
          timestamp: new Date(),
          inspectorId: req.user!.id,
        },
        include: {
          job: true,
          equipment: true,
        },
      });

      res.status(201).json({
        success: true,
        data: { reading },
      });
    } catch (error) {
      next(error);
    }
});

router.get('/:id', authenticate, requirePermissions(Permissions.READ_READINGS), async (req, res, next) => {
  try {
    const { id } = req.params;

    const reading = await prisma.reading.findUnique({
      where: { id },
      include: {
        job: true,
        equipment: true,
      },
    });

    if (!reading) {
      throw createError.notFound('Reading not found');
    }

    res.json({
      success: true,
      data: { reading },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id',
  authenticate,
  authorize(UserRole.INSPECTOR, UserRole.ADMIN),
  validateRequest({ body: updateReadingSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData: UpdateReadingInput = req.body;

      const reading = await prisma.reading.update({
        where: { id },
        data: updateData,
        include: {
          job: true,
          equipment: true,
        },
      });

      res.json({
        success: true,
        data: { reading },
      });
    } catch (error) {
      next(error);
    }
});

router.delete('/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      await prisma.reading.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: {
          message: 'Reading successfully deleted',
        },
      });
    } catch (error) {
      next(error);
    }
});

// Batch operations
router.post('/batch',
  authenticate,
  authorize(UserRole.INSPECTOR, UserRole.ADMIN),
  validateRequest({
    body: z.object({
      readings: z.array(createReadingSchema),
    }),
  }),
  async (req, res, next) => {
    try {
      const { readings }: BatchCreateReadingsInput = req.body;

      const createdReadings = await prisma.$transaction(
        readings.map((reading: CreateReadingInput) =>
          prisma.reading.create({
            data: {
              ...reading,
              timestamp: new Date(),
              inspectorId: req.user!.id,
            },
          })
        )
      );

      const response: BatchCreateReadingsResponse = {
        readings: createdReadings,
        count: createdReadings.length,
      };

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
});

export const readingRoutes = router;
