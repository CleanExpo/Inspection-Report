import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Validation schemas
const createJobSchema = z.object({
  type: z.enum(['MOISTURE_INSPECTION', 'MOLD_ASSESSMENT', 'WATER_DAMAGE', 'THERMAL_IMAGING']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  clientId: z.string().uuid(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  schedule: z.object({
    startDate: z.string().datetime(),
    estimatedDuration: z.number().min(1),
  }),
  metadata: z.object({
    propertyType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']),
    squareFootage: z.number().min(1),
    floors: z.number().min(1),
    notes: z.string().optional(),
  }),
});

const updateJobSchema = createJobSchema.partial();

// Routes
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, priority } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status: String(status) }),
      ...(type && { type: String(type) }),
      ...(priority && { priority: String(priority) }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          client: true,
          assignedTo: true,
          equipment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
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

router.post('/', authenticate, validateRequest({ body: createJobSchema }), async (req, res, next) => {
  try {
    const jobData = req.body;

    const job = await prisma.job.create({
      data: {
        ...jobData,
        status: 'PENDING',
        createdBy: { connect: { id: req.user!.id } },
      },
      include: {
        client: true,
        assignedTo: true,
        equipment: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: true,
        equipment: true,
        readings: true,
      },
    });

    if (!job) {
      throw createError.notFound('Job not found');
    }

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, validateRequest({ body: updateJobSchema }), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        assignedTo: true,
        equipment: true,
      },
    });

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: {
        message: 'Job successfully deleted',
      },
    });
  } catch (error) {
    next(error);
  }
});

export const jobRoutes = router;
