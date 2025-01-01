import { NextApiRequest, NextApiResponse } from 'next';
import { validateClientData } from '../../utils/clientValidation';
import { requireAuth } from '../../utils/auth';
import { ClientFormData } from '../../app/types/client';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const clientData = req.body as ClientFormData;

    // Validate the client data
    try {
      validateClientData(clientData);
      
      // If validation passes, return success
      return res.status(200).json({
        success: true,
        message: 'Client data is valid',
        data: clientData
      });
    } catch (error: any) {
      // If validation fails, return the error message
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Client validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Wrap the handler with requireAuth middleware
export default requireAuth(handler);
