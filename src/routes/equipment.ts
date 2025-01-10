import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate, authorize, requirePermissions } from '../middleware/authenticate';
import { UserRole, Permissions } from '../types/auth';
import {
  EquipmentType,
  EquipmentStatus,
  MaintenanceType,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  CreateMaintenanceInput,
  EquipmentWithRelations,
  EquipmentStats
} from '../types/equipment';

const router = Router();

interface GroupByResult {
  type?: EquipmentType;
  status?: EquipmentStatus;
  _count: number;
}

// Validation schemas
const createEquipmentSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(EquipmentType),
  model: z.string(),
  serialNumber: z.string(),
  calibrationDue: z.string().datetime(),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.AVAILABLE),
  metadata: z.object({
    manufacturer: z.string(),
    purchaseDate: z.string().datetime().optional(),
    warrantyExpiry: z.string().datetime().optional(),
    accuracy: z.number().optional(),
    range: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    notes: z.string().optional(),
  }).optional(),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

// Routes
router.get('/', authenticate, requirePermissions(Permissions.MANAGE_EQUIPMENT), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, needsCalibration } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(type && { type: String(type) as EquipmentType }),
      ...(status && { status: String(status) as EquipmentStatus }),
      ...(needsCalibration === 'true' && {
        calibrationDue: {
          lte: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Due within next month
        },
      }),
    };

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          readings: {
            take: 1,
            orderBy: { timestamp: 'desc' },
          },
          maintenanceHistory: {
            take: 1,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.equipment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        equipment,
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

router.get('/stats', authenticate, requirePermissions(Permissions.MANAGE_EQUIPMENT), async (req, res, next) => {
  try {
    const [
      total,
      byType,
      byStatus,
      needingCalibration,
      maintenanceLastMonth,
      maintenanceCosts
    ] = await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.equipment.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.equipment.count({
        where: {
          calibrationDue: {
            lte: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          },
        },
      }),
      prisma.maintenanceRecord.count({
        where: {
          date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      }),
      prisma.maintenanceRecord.aggregate({
        _sum: { cost: true },
        _avg: { cost: true },
      }),
    ]);

    const stats: EquipmentStats = {
      total,
      byType: Object.fromEntries(
        (byType as GroupByResult[]).map(item => [item.type, item._count])
      ) as { [key in EquipmentType]: number },
      byStatus: Object.fromEntries(
        (byStatus as GroupByResult[]).map(item => [item.status, item._count])
      ) as { [key in EquipmentStatus]: number },
      needingCalibration,
      maintenanceStats: {
        lastMonth: maintenanceLastMonth,
        totalCost: maintenanceCosts._sum.cost || 0,
        averageCost: maintenanceCosts._avg.cost || 0,
      },
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest({ body: createEquipmentSchema }),
  async (req, res, next) => {
    try {
      const equipmentData: CreateEquipmentInput = req.body;

      const equipment = await prisma.equipment.create({
        data: equipmentData,
        include: {
          readings: false,
          maintenanceHistory: false,
        },
      });

      res.status(201).json({
        success: true,
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
});

router.get('/:id', authenticate, requirePermissions(Permissions.MANAGE_EQUIPMENT), async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        readings: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
        maintenanceHistory: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!equipment) {
      throw createError.notFound('Equipment not found');
    }

    res.json({
      success: true,
      data: { equipment },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest({ body: updateEquipmentSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData: UpdateEquipmentInput = req.body;

      const equipment = await prisma.equipment.update({
        where: { id },
        data: updateData,
        include: {
          readings: {
            take: 1,
            orderBy: { timestamp: 'desc' },
          },
          maintenanceHistory: {
            take: 1,
            orderBy: { date: 'desc' },
          },
        },
      });

      res.json({
        success: true,
        data: { equipment },
      });
    } catch (error) {
      next(error);
    }
});

router.post('/:id/maintenance',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  validateRequest({
    body: z.object({
      type: z.nativeEnum(MaintenanceType),
      date: z.string().datetime(),
      notes: z.string(),
      performedBy: z.string(),
      cost: z.number().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const maintenanceData: CreateMaintenanceInput = req.body;

      const [maintenance, equipment] = await prisma.$transaction([
        prisma.maintenanceRecord.create({
          data: {
            ...maintenanceData,
            equipmentId: id,
          },
        }),
        prisma.equipment.update({
          where: { id },
          data: {
            status: EquipmentStatus.AVAILABLE,
            ...(maintenanceData.type === MaintenanceType.CALIBRATION && {
              calibrationDue: new Date(
                new Date().setMonth(new Date().getMonth() + 6)
              ).toISOString(),
            }),
          },
        }),
      ]);

      res.status(201).json({
        success: true,
        data: { maintenance, equipment },
      });
    } catch (error) {
      next(error);
    }
});

export const equipmentRoutes = router;
