import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { PrismaClient } from '@prisma/client';

// Validation interface for API input
interface FloorPlanInput {
  jobId: string;
  name: string;
  level: number;
  imageUrl: string;
  width: number;
  height: number;
  scale: number;
}

// Validation interface for API input
interface AnnotationInput {
  type: 'TEXT' | 'ARROW' | 'RECTANGLE' | 'CIRCLE';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  color: string;
}

// Validate floor plan input
const validateFloorPlan = (data: any): data is FloorPlanInput => {
  return (
    typeof data.jobId === 'string' &&
    typeof data.name === 'string' &&
    typeof data.level === 'number' &&
    typeof data.imageUrl === 'string' &&
    typeof data.width === 'number' &&
    typeof data.height === 'number' &&
    typeof data.scale === 'number' &&
    data.width > 0 &&
    data.height > 0 &&
    data.scale > 0
  );
};

// Validate annotation input
const validateAnnotation = (data: any): data is AnnotationInput => {
  return (
    ['TEXT', 'ARROW', 'RECTANGLE', 'CIRCLE'].includes(data.type) &&
    typeof data.content === 'string' &&
    typeof data.x === 'number' &&
    typeof data.y === 'number' &&
    (data.width === undefined || typeof data.width === 'number') &&
    (data.height === undefined || typeof data.height === 'number') &&
    (data.rotation === undefined || typeof data.rotation === 'number') &&
    typeof data.color === 'string' &&
    /^#[0-9A-F]{6}$/i.test(data.color)
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetFloorPlan(req, res);
      case 'POST':
        return handleCreateFloorPlan(req, res);
      case 'PUT':
        return handleUpdateFloorPlan(req, res);
      case 'DELETE':
        return handleDeleteFloorPlan(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Floor Plan API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/moisture/floorplan
async function handleGetFloorPlan(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { jobId, level } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    if (level) {
      // Get specific floor plan
      const floorPlan = await prisma.floorPlan.findUnique({
        where: {
          jobId_level: {
            jobId: jobId as string,
            level: parseInt(level as string)
          }
        },
        include: {
          annotations: true,
          readings: {
            include: {
              dataPoints: true
            }
          }
        }
      });

      if (!floorPlan) {
        return res.status(404).json({ error: 'Floor plan not found' });
      }

      return res.status(200).json(floorPlan);
    } else {
      // Get all floor plans for job
      const floorPlans = await prisma.floorPlan.findMany({
        where: { jobId: jobId as string },
        include: {
          annotations: true,
          _count: {
            select: { readings: true }
          }
        },
        orderBy: { level: 'asc' }
      });

      return res.status(200).json(floorPlans);
    }
  } catch (error) {
    console.error('Get Floor Plan Error:', error);
    return res.status(500).json({ error: 'Failed to fetch floor plan' });
  }
}

// POST /api/moisture/floorplan
async function handleCreateFloorPlan(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!validateFloorPlan(req.body)) {
    return res.status(400).json({ error: 'Invalid floor plan data' });
  }

  const {
    jobId,
    name,
    level,
    imageUrl,
    width,
    height,
    scale
  } = req.body;

  try {
    // Check for existing floor plan at this level
    const existing = await prisma.floorPlan.findUnique({
      where: {
        jobId_level: {
          jobId,
          level
        }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Floor plan already exists for this level' });
    }

    // Create floor plan
    const floorPlan = await prisma.floorPlan.create({
      data: {
        jobId,
        name,
        level,
        imageUrl,
        width,
        height,
        scale
      }
    });

    return res.status(201).json(floorPlan);
  } catch (error) {
    console.error('Create Floor Plan Error:', error);
    return res.status(500).json({ error: 'Failed to create floor plan' });
  }
}

// PUT /api/moisture/floorplan/[id]
async function handleUpdateFloorPlan(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid floor plan ID' });
  }

  if (!validateFloorPlan(req.body)) {
    return res.status(400).json({ error: 'Invalid floor plan data' });
  }

  const {
    jobId,
    name,
    level,
    imageUrl,
    width,
    height,
    scale
  } = req.body;

  try {
    // Check if floor plan exists
    const existing = await prisma.floorPlan.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }

    // Check for level conflict
    if (level !== existing.level) {
      const conflict = await prisma.floorPlan.findUnique({
        where: {
          jobId_level: {
            jobId,
            level
          }
        }
      });

      if (conflict && conflict.id !== id) {
        return res.status(409).json({ error: 'Floor plan already exists for this level' });
      }
    }

    // Update floor plan
    const floorPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        jobId,
        name,
        level,
        imageUrl,
        width,
        height,
        scale
      }
    });

    return res.status(200).json(floorPlan);
  } catch (error) {
    console.error('Update Floor Plan Error:', error);
    return res.status(500).json({ error: 'Failed to update floor plan' });
  }
}

// DELETE /api/moisture/floorplan/[id]
async function handleDeleteFloorPlan(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid floor plan ID' });
  }

  try {
    // Check if floor plan exists
    const existing = await prisma.floorPlan.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }

    // Delete floor plan (will cascade delete annotations)
    await prisma.floorPlan.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Delete Floor Plan Error:', error);
    return res.status(500).json({ error: 'Failed to delete floor plan' });
  }
}
