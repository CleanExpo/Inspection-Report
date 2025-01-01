import { NextApiRequest, NextApiResponse } from 'next';
import { validateClientData, sanitizeClientData } from '../../utils/clientValidation';
import { saveToCRM, updateInCRM, CRMError } from '../../utils/crm';
import { requireAuth } from '../../utils/auth';
import type { ClientData } from '../../types/client';
import type { CRMClientData } from '../../types/crm';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'PUT'].includes(req.method || '')) {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const clientData: ClientData = req.body;

    // First sanitize the input data
    const sanitizedData = sanitizeClientData(clientData);

    // Then validate the sanitized data
    const validationResult = validateClientData(sanitizedData);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.errors
      });
    }

    // Handle create or update based on method
    if (req.method === 'POST') {
      const crmData: ClientData & { createdAt: string; updatedAt: string } = {
        ...sanitizedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveToCRM(crmData);
    } else {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required for updates'
        });
      }

      const updateData: Partial<CRMClientData> = {
        ...sanitizedData,
        updatedAt: new Date().toISOString()
      };
      await updateInCRM(id, updateData);
    }

    return res.status(200).json({
      success: true,
      message: req.method === 'POST' ? 'Client created successfully' : 'Client updated successfully',
      data: sanitizedData
    });
  } catch (error) {
    console.error('Client operation error:', error);

    if (error instanceof CRMError) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        details: error.response
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Wrap the handler with requireAuth middleware
export default requireAuth(handler);
