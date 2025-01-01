import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

// Validation for annotation input
interface AnnotationInput {
  floorPlanId: string;
  type: 'TEXT' | 'ARROW' | 'RECTANGLE' | 'CIRCLE';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  color: string;
}

// Validate annotation input
const validateAnnotation = (data: any): data is AnnotationInput => {
  return (
    typeof data.floorPlanId === 'string' &&
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
      case 'POST':
        return handleCreateAnnotation(req, res);
      case 'PUT':
        return handleUpdateAnnotation(req, res);
      case 'DELETE':
        return handleDeleteAnnotation(req, res);
      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Annotation API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/moisture/annotation
async function handleCreateAnnotation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!validateAnnotation(req.body)) {
    return res.status(400).json({ error: 'Invalid annotation data' });
  }

  const {
    floorPlanId,
    type,
    content,
    x,
    y,
    width,
    height,
    rotation,
    color
  } = req.body;

  try {
    // Check if floor plan exists
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: floorPlanId }
    });

    if (!floorPlan) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }

    // Create annotation
    const annotation = await prisma.annotation.create({
      data: {
        floorPlanId,
        type,
        content,
        x,
        y,
        width,
        height,
        rotation,
        color
      }
    });

    return res.status(201).json(annotation);
  } catch (error) {
    console.error('Create Annotation Error:', error);
    return res.status(500).json({ error: 'Failed to create annotation' });
  }
}

// PUT /api/moisture/annotation/[id]
async function handleUpdateAnnotation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid annotation ID' });
  }

  const updateData = req.body;
  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({ error: 'Invalid update data' });
  }

  // Only allow updating specific fields
  const allowedFields = ['content', 'x', 'y', 'width', 'height', 'rotation', 'color'];
  const invalidFields = Object.keys(updateData).filter(
    field => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Invalid fields: ${invalidFields.join(', ')}`
    });
  }

  try {
    // Check if annotation exists
    const existing = await prisma.annotation.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    // Update annotation
    const annotation = await prisma.annotation.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json(annotation);
  } catch (error) {
    console.error('Update Annotation Error:', error);
    return res.status(500).json({ error: 'Failed to update annotation' });
  }
}

// DELETE /api/moisture/annotation/[id]
async function handleDeleteAnnotation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid annotation ID' });
  }

  try {
    // Check if annotation exists
    const existing = await prisma.annotation.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    // Delete annotation
    await prisma.annotation.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Delete Annotation Error:', error);
    return res.status(500).json({ error: 'Failed to delete annotation' });
  }
}
