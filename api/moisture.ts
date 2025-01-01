import { NextApiRequest, NextApiResponse } from 'next';
import { MoistureService } from '../services/moistureService';
import { withMoistureValidation } from '../middleware/validateMoistureData';
import { withRole } from '../middleware/auth';
import { withRateLimit } from '../middleware/rateLimit';
import { withCors } from '../middleware/cors';
import { handleError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';

async function moistureHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        // Only ADMIN and TECHNICIAN can create
        const moistureData = await MoistureService.createMoistureData(req.body);
        return res.status(201).json(moistureData);

      case 'GET':
        // All authenticated users can read
        if (req.query.jobNumber) {
          const data = await MoistureService.getMoistureData(req.query.jobNumber as string);
          return res.status(200).json(data);
        }
        return res.status(400).json({ error: 'Job number is required' });

      case 'PUT':
        // Only ADMIN and TECHNICIAN can update
        if (!req.query.jobNumber) {
          return res.status(400).json({ error: 'Job number is required' });
        }
        const updatedData = await MoistureService.updateMoistureData(
          req.query.jobNumber as string,
          req.body
        );
        return res.status(200).json(updatedData);

      case 'DELETE':
        // Only ADMIN can delete
        if (!req.query.jobNumber) {
          return res.status(400).json({ error: 'Job number is required' });
        }
        await MoistureService.deleteMoistureData(req.query.jobNumber as string);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

// Apply middleware in order: role-based auth -> validation -> handler
// GET: Any authenticated user (VIEWER and up)
// POST/PUT: TECHNICIAN and up
// DELETE: ADMIN only
const methodRoles = {
  GET: withRole('VIEWER')(moistureHandler),
  POST: withRole('TECHNICIAN')(moistureHandler),
  PUT: withRole('TECHNICIAN')(moistureHandler),
  DELETE: withRole('ADMIN')(moistureHandler),
};

// Compose all middleware
function composeMiddleware(baseHandler: any, method: string) {
  // Start with the base handler
  let composed = methodRoles[method as keyof typeof methodRoles] || baseHandler;

  // Add validation for POST and PUT
  if (['POST', 'PUT'].includes(method)) {
    composed = withMoistureValidation(composed);
  }

  // Add rate limiting
  composed = withRateLimit(composed, '/api/moisture');

  // Add CORS (must be last to handle preflight)
  composed = withCors(composed, '/api/moisture');

  return composed;
}

export default async function routeHandler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method || 'GET';
  const handler = composeMiddleware(moistureHandler, method);
  
  if (!handler) {
    res.setHeader('Allow', Object.keys(methodRoles));
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  return handler(req, res);
}
