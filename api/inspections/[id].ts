import { createApiHandler } from '../../lib/middleware/api-handler';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { InspectionType, InspectionStatus } from '../../types/inspection';
import { InspectionListResponse } from '../../types/api';
import { APISuccessResponse } from '../../lib/api-client';
import { Prisma } from '@prisma/client';

// Schema for updating inspections
const updateInspectionSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(InspectionType).optional(),
  status: z.nativeEnum(InspectionStatus).optional(),
  notes: z.string().nullable().optional(),
  findings: z.any().optional()
});

// GET /api/inspections/[id]
export const getInspection = createApiHandler<{ id: string }, InspectionListResponse>(
  async (req, res) => {
    const { id } = req.query;

    const inspection = await prisma.inspection.findUnique({
      where: { id: String(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Inspection not found'
        }
      });
    }

    const typedInspection = {
      ...inspection,
      type: inspection.type as InspectionType,
      status: inspection.status as InspectionStatus
    } as InspectionListResponse;

    res.json({
      success: true,
      data: typedInspection
    });
  },
  z.object({ id: z.string() }),
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);

// PUT /api/inspections/[id]
export const updateInspection = createApiHandler<z.infer<typeof updateInspectionSchema>, InspectionListResponse>(
  async (req, res, data) => {
    const { id } = data;

    try {
      const updateData: Prisma.InspectionUpdateInput = {
        type: data.type,
        status: data.status,
        notes: data.notes,
        findings: data.findings
      };

      const inspection = await prisma.inspection.update({
        where: { id },
        data: updateData,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          job: {
            select: {
              id: true,
              jobNumber: true,
              title: true,
              status: true
            }
          }
        }
      });

      const typedInspection = {
        ...inspection,
        type: inspection.type as InspectionType,
        status: inspection.status as InspectionStatus
      } as InspectionListResponse;

      res.json({
        success: true,
        data: typedInspection
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Inspection not found'
          }
        });
      }
      throw error;
    }
  },
  updateInspectionSchema,
  {
    requireAuth: true,
    allowedMethods: ['PUT']
  }
);

// DELETE /api/inspections/[id]
export const deleteInspection = createApiHandler<{ id: string }, { id: string }>(
  async (req, res) => {
    const { id } = req.query;

    try {
      await prisma.inspection.delete({
        where: { id: String(id) }
      });

      res.json({
        success: true,
        data: { id: String(id) }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Inspection not found'
          }
        });
      }
      throw error;
    }
  },
  z.object({ id: z.string() }),
  {
    requireAuth: true,
    allowedMethods: ['DELETE']
  }
);

// Default export for API route
export default createApiHandler<unknown, InspectionListResponse | { id: string }>(
  async (req, res) => {
    switch (req.method) {
      case 'GET':
        return getInspection(req, res);
      case 'PUT':
        return updateInspection(req, res);
      case 'DELETE':
        return deleteInspection(req, res);
      default:
        res.status(405).json({
          success: false,
          error: {
            message: `Method ${req.method} not allowed`
          }
        });
    }
  },
  z.object({}).optional(),
  {
    requireAuth: true,
    allowedMethods: ['GET', 'PUT', 'DELETE']
  }
);
