import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { validateClientData, validateClientDataWithDetails } from '../../app/utils/clientValidation';
import { requireAuth } from '../../utils/auth';

// Initialize Prisma Client with explicit typing
const prisma: PrismaClient = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

/**
 * GET /api/client
 * List all clients with optional filtering
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
            { phone: { contains: search as string } },
            { address: { contains: search as string, mode: 'insensitive' } },
            { city: { contains: search as string, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.client.count({ where });

    // Get clients with pagination
    const clients = await prisma.client.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        jobs: {
          select: {
            id: true,
            jobNumber: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * POST /api/client
 * Create a new client
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clientData = req.body;

    // Validate client data
    const validationResult = validateClientDataWithDetails(clientData);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationResult.errors
        }
      });
    }

      // Create client within a transaction
      const client = await prisma.$transaction(async (tx) => {
        // Check for existing email if provided
        if (clientData.email) {
          const existingClient = await tx.client.findUnique({
          where: { email: clientData.email }
        });
        
        if (existingClient) {
          throw new Error('EMAIL_EXISTS');
        }
      }

      return await tx.client.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          state: clientData.state.toUpperCase(),
          zipCode: clientData.zipCode,
          contactPerson: clientData.contactPerson,
          notes: clientData.notes,
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: client,
    });

  } catch (error: any) {
    console.error('Error creating client:', error);
    
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A client with this email already exists',
          code: 'EMAIL_EXISTS'
        }
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A client with this email already exists',
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    });
  }
}

// Wrap the handler with requireAuth middleware
export default requireAuth(handler);
