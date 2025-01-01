import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { 
  Prisma, 
  EquipmentType, 
  EquipmentStatus, 
  Equipment 
} from '@prisma/client';


// Define the response type
interface EquipmentResponse extends Omit<Equipment, 'calibrationDate' | 'nextCalibrationDue'> {
  calibrationDate: string;
  nextCalibrationDue: string;
  readingsCount: number;
}

// Type validation for request body
interface EquipmentInput {
  serialNumber: string;
  model: string;
  type: EquipmentType;
  calibrationDate: string;
  nextCalibrationDue: string;
  status?: EquipmentStatus;
}

// Validate equipment input data
const validateEquipmentInput = (data: any): data is EquipmentInput => {
  return (
    typeof data.serialNumber === 'string' &&
    typeof data.model === 'string' &&
    Object.values(EquipmentType).includes(data.type) &&
    !isNaN(Date.parse(data.calibrationDate)) &&
    !isNaN(Date.parse(data.nextCalibrationDue)) &&
    (!data.status || Object.values(EquipmentStatus).includes(data.status))
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetEquipment(req, res);
      case 'POST':
        return handleCreateEquipment(req, res);
      case 'PUT':
        return handleUpdateEquipment(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Equipment API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/moisture/equipment
async function handleGetEquipment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { 
    status, 
    type,
    page = '1',
    limit = '10',
    sortField = 'lastUsed',
    sortDirection = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    ...(status && { status: status as EquipmentStatus }),
    ...(type && { type: type as EquipmentType })
  };

  try {
    // Get total count for pagination
    const total = await prisma.equipment.count({ where });

    // Get paginated equipment
    const equipment = await prisma.equipment.findMany({
      skip,
      take: limitNum,
      where,
      orderBy: {
        [sortField as string]: sortDirection as 'asc' | 'desc'
      }
    });

    // Get reading counts for each equipment
    const readingCounts = await Promise.all(
      equipment.map(eq => 
        prisma.moistureReading.count({
          where: {
            equipmentId: eq.id
          } as Prisma.MoistureReadingWhereInput
        })
      )
    );

    // Transform the response to include reading count and format dates
    const equipmentWithCount: EquipmentResponse[] = equipment.map((eq, index) => ({
      ...eq,
      calibrationDate: eq.calibrationDate.toISOString(),
      nextCalibrationDue: eq.nextCalibrationDue.toISOString(),
      readingsCount: readingCounts[index]
    }));

    return res.status(200).json({
      equipment: equipmentWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      }
    });
  } catch (error) {
    console.error('Get Equipment Error:', error);
    return res.status(500).json({ error: 'Failed to fetch equipment' });
  }
}

// POST /api/moisture/equipment
async function handleCreateEquipment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!validateEquipmentInput(req.body)) {
    return res.status(400).json({ error: 'Invalid equipment data' });
  }

  const {
    serialNumber,
    model,
    type,
    calibrationDate,
    nextCalibrationDue,
    status = EquipmentStatus.ACTIVE
  } = req.body;

  try {
    // Check for duplicate serial number
    const existing = await prisma.equipment.findUnique({
      where: { serialNumber }
    });

    if (existing) {
      return res.status(409).json({ error: 'Serial number already exists' });
    }

    // Create equipment
    const equipment = await prisma.equipment.create({
      data: {
        serialNumber,
        model,
        type,
        calibrationDate: new Date(calibrationDate),
        nextCalibrationDue: new Date(nextCalibrationDue),
        status
      }
    });

    return res.status(201).json(equipment);
  } catch (error) {
    console.error('Create Equipment Error:', error);
    return res.status(500).json({ error: 'Failed to create equipment' });
  }
}

// PUT /api/moisture/equipment/[id]
async function handleUpdateEquipment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid equipment ID' });
  }

  if (!validateEquipmentInput(req.body)) {
    return res.status(400).json({ error: 'Invalid equipment data' });
  }

  const {
    serialNumber,
    model,
    type,
    calibrationDate,
    nextCalibrationDue,
    status
  } = req.body;

  try {
    // Check if equipment exists
    const existing = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check for duplicate serial number (excluding current equipment)
    const duplicate = await prisma.equipment.findFirst({
      where: {
        serialNumber,
        NOT: { id }
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'Serial number already exists' });
    }

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        serialNumber,
        model,
        type,
        calibrationDate: new Date(calibrationDate),
        nextCalibrationDue: new Date(nextCalibrationDue),
        status
      }
    });

    return res.status(200).json(equipment);
  } catch (error) {
    console.error('Update Equipment Error:', error);
    return res.status(500).json({ error: 'Failed to update equipment' });
  }
}
