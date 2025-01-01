import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateClientData } from '../../utils/clientValidation';
import { requireAuth } from '../../utils/auth';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID',
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(id, res);
    case 'PUT':
      return handlePut(id, req, res);
    case 'DELETE':
      return handleDelete(id, res);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
}

/**
 * GET /api/client/[id]
 * Get a single client by ID
 */
async function handleGet(id: string, res: NextApiResponse) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        jobs: {
          select: {
            id: true,
            jobNumber: true,
            status: true,
            priority: true,
            category: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * PUT /api/client/[id]
 * Update a client
 */
async function handlePut(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const clientData = req.body;

    // Validate updated data
    try {
      validateClientData(clientData);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
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

    return res.status(200).json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * DELETE /api/client/[id]
 * Delete a client
 */
async function handleDelete(id: string, res: NextApiResponse) {
  try {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        jobs: true,
      },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Check if client has any jobs
    if (existingClient.jobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with existing jobs',
      });
    }

    // Delete client
    await prisma.client.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

// Wrap the handler with requireAuth middleware
export default requireAuth(handler);
