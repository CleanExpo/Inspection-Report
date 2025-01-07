import { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '../../../../lib/middleware/api-handler';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { APISuccessResponse } from '../../../../lib/api-client';
import { Prisma } from '@prisma/client';

interface InspectionSection {
  id: string;
  inspectionId: string;
  title: string;
  order: number;
  content: Prisma.JsonValue;
  isCompleted: boolean;
  completedBy: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Query params schema
const querySchema = z.object({
  id: z.string().uuid()
});

// Schema for creating sections
const createSectionSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().min(0),
  content: z.record(z.any()),
  isCompleted: z.boolean(),
  completedBy: z.string().uuid().nullable().optional(),
  completedAt: z.date().nullable().optional()
}).transform(data => ({
  ...data,
  isCompleted: data.isCompleted ?? false
}));

// GET /api/inspections/[id]/sections
export const getSections = createApiHandler<{ id: string }, InspectionSection[]>(
  async (req, res) => {
    const { id: inspectionId } = req.query;

    const sections = await prisma.$queryRawUnsafe<InspectionSection[]>(
      `SELECT * FROM "inspection_sections" WHERE "inspectionId" = $1 ORDER BY "order" ASC`,
      String(inspectionId)
    );

    res.json({
      success: true,
      data: sections
    });
  },
  querySchema,
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);

// POST /api/inspections/[id]/sections
export const createSection = createApiHandler<z.infer<typeof createSectionSchema>, InspectionSection>(
  async (req, res, data) => {
    const { id: inspectionId } = req.query;

    const [section] = await prisma.$queryRawUnsafe<[InspectionSection]>(
      `
      INSERT INTO "inspection_sections" (
        "id",
        "inspectionId",
        "title",
        "order",
        "content",
        "isCompleted",
        "completedBy",
        "completedAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      String(inspectionId),
      data.title,
      data.order,
      JSON.stringify(data.content),
      data.isCompleted,
      data.completedBy,
      data.completedAt
    );

    res.status(201).json({
      success: true,
      data: section
    });
  },
  createSectionSchema,
  {
    requireAuth: true,
    allowedMethods: ['POST']
  }
);

// Reorder sections schema
const reorderSectionsSchema = z.object({
  sections: z.array(z.object({
    id: z.string().uuid(),
    order: z.number().int().min(0)
  }))
});

// PUT /api/inspections/[id]/sections/reorder
export const reorderSections = createApiHandler<z.infer<typeof reorderSectionsSchema>, InspectionSection[]>(
  async (req, res, data) => {
    const updatedSections = await prisma.$transaction(async (tx) => {
      // Update each section's order
      for (const { id, order } of data.sections) {
        await tx.$executeRawUnsafe(
          `UPDATE "inspection_sections" SET "order" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
          order,
          id
        );
      }

      // Fetch all updated sections
      return await tx.$queryRawUnsafe<InspectionSection[]>(
        `SELECT * FROM "inspection_sections" WHERE "id" = ANY($1) ORDER BY "order" ASC`,
        data.sections.map(s => s.id)
      );
    });

    res.json({
      success: true,
      data: updatedSections
    });
  },
  reorderSectionsSchema,
  {
    requireAuth: true,
    allowedMethods: ['PUT']
  }
);

// Default export for API route
export default createApiHandler<unknown, InspectionSection | InspectionSection[]>(
  async (req, res) => {
    switch (req.method) {
      case 'GET':
        return getSections(req, res);
      case 'POST':
        return createSection(req, res);
      case 'PUT':
        return reorderSections(req, res);
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
    allowedMethods: ['GET', 'POST', 'PUT']
  }
);
