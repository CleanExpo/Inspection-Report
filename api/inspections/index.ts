import { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '../../lib/middleware/api-handler';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { InspectionType, InspectionStatus } from '../../types/inspection';
import { GetInspectionsQuery, CreateInspectionBody, InspectionListResponse } from '../../types/api';
import { APIResponse, APISuccessResponseWithPagination, APISuccessResponse } from '../../lib/api-client';
import { Prisma } from '@prisma/client';

// Schema for creating/updating inspections
const createInspectionSchema = z.object({
  jobId: z.string().uuid(),
  clientId: z.string().uuid(),
  type: z.nativeEnum(InspectionType),
  status: z.nativeEnum(InspectionStatus).optional().default(InspectionStatus.DRAFT),
  notes: z.string().nullable().optional(),
  findings: z.any().optional()
});

// Query params schema
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(InspectionStatus).optional(),
  clientId: z.string().uuid().optional()
});

// GET /api/inspections
export const getInspections = createApiHandler<GetInspectionsQuery, InspectionListResponse[]>(
  async (req, res, query) => {
    const { page = '1', limit = '10', status, clientId } = query;

    const where: Prisma.InspectionWhereInput = {
      ...(status && { status }),
      ...(clientId && { clientId })
    };

    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.inspection.count({ where })
    ]);

    const typedInspections = inspections.map(inspection => ({
      ...inspection,
      type: inspection.type as InspectionType,
      status: inspection.status as InspectionStatus
    })) as InspectionListResponse[];

    const response: APISuccessResponseWithPagination<InspectionListResponse[]> = {
      success: true,
      data: typedInspections,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };

    res.json(response);
  },
  querySchema,
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);

// POST /api/inspections
export const createInspection = createApiHandler<CreateInspectionBody, InspectionListResponse>(
  async (req, res, data) => {
    const inspection = await prisma.inspection.create({
      data: {
        job: { connect: { id: data.jobId } },
        client: { connect: { id: data.clientId } },
        type: data.type,
        status: data.status ?? InspectionStatus.DRAFT,
        notes: data.notes ?? null,
        findings: data.findings ?? {}
      },
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

    const response: APISuccessResponse<InspectionListResponse> = {
      success: true,
      data: typedInspection
    };

    res.status(201).json(response);
  },
  createInspectionSchema,
  {
    requireAuth: true,
    allowedMethods: ['POST']
  }
);

// Default export for API route
export default createApiHandler<unknown, InspectionListResponse | InspectionListResponse[]>(
  async (req, res) => {
    switch (req.method) {
      case 'GET':
        return getInspections(req, res);
      case 'POST':
        return createInspection(req, res);
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
    allowedMethods: ['GET', 'POST']
  }
);
