import { NextApiRequest, NextApiResponse } from 'next';
import { validateJobNumber, validateMoistureData } from '../../middleware/validateMoistureData';
import { ValidationError } from '../../utils/errors';
import { withRole } from '../../middleware/auth';
import { withRateLimit } from '../../middleware/rateLimit';
import { withCors } from '../../middleware/cors';
import { AuthenticatedRequest } from '../../middleware/auth';

async function validationHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'job-number':
        try {
          validateJobNumber(data.jobNumber);
          return res.status(200).json({ valid: true });
        } catch (error) {
          if (error instanceof ValidationError) {
            return res.status(400).json({
              valid: false,
              errors: error.details
            });
          }
          throw error;
        }

      case 'job-fields':
        try {
          validateMoistureData(data);
          return res.status(200).json({ valid: true });
        } catch (error) {
          if (error instanceof ValidationError) {
            return res.status(400).json({
              valid: false,
              errors: error.details
            });
          }
          throw error;
        }

      default:
        return res.status(400).json({
          error: 'Invalid validation type',
          message: 'Validation type must be either "job-number" or "job-fields"'
        });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process validation request'
    });
  }
}

// Compose middleware
const handler = withCors(
  withRateLimit(
    withRole('VIEWER')(validationHandler),
    '/api/validate'
  ),
  '/api/validate'
);

export default handler;
