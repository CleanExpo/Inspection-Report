import { NextApiRequest, NextApiResponse } from 'next';
import { ClientValidator } from '../utils/clientValidation';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from './auth';

export function validateClientData(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    if (['POST', 'PUT'].includes(req.method || '')) {
      const validation = ClientValidator.validateClient(req.body);
      if (!validation.isValid) {
        throw new ValidationError('Invalid client data', validation.errors);
      }
    }
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
        details: error.details,
      });
    }
    throw error; // Let other errors be handled by the main error handler
  }
}

export function withClientValidation(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
    try {
      await new Promise<void>((resolve, reject) => {
        validateClientData(req, res, () => resolve());
      });
      return handler(req, res);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'ValidationError',
          message: error.message,
          details: error.details,
        });
      }
      throw error; // Let other errors be handled by the main error handler
    }
  };
}
