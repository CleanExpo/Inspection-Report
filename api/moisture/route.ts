import { NextApiRequest, NextApiResponse } from 'next';
import { moistureService } from '../../app/services/moistureService';
import { withMoistureValidation } from '../../middleware/validateMoisture';
import { withRole, Role } from '../../middleware/auth';
import { withRateLimit } from '../../middleware/rateLimit';
import { withCors } from '../../middleware/cors';
import { handleError } from '../../utils/errors';
import { AuthenticatedRequest } from '../../middleware/auth';

async function moistureHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { method, query, body } = req;

    switch (method) {
      case 'POST':
        if (body.value !== undefined) {
          // Adding a reading to a map
          if (!query.mapId) {
            return res.status(400).json({ error: 'Map ID is required' });
          }
          const newReading = await moistureService.addReading(
            query.mapId as string,
            body
          );
          return res.status(201).json(newReading);
        } else {
          // Creating a new map
          const newMap = await moistureService.createMap(body);
          return res.status(201).json(newMap);
        }

      case 'GET':
        if (query.mapId) {
          // Get specific map
          const map = await moistureService.getMapById(query.mapId as string);
          if (!map) {
            return res.status(404).json({ error: 'Map not found' });
          }
          return res.status(200).json(map);
        } else if (query.jobId) {
          // Get all maps for a job
          const maps = await moistureService.getMaps(query.jobId as string);
          return res.status(200).json(maps);
        } else {
          return res.status(400).json({ error: 'Job ID or Map ID is required' });
        }

      case 'PUT':
        if (!query.mapId) {
          return res.status(400).json({ error: 'Map ID is required' });
        }
        if (query.readingId) {
          // Update reading
          const updatedReading = await moistureService.updateReading(
            query.readingId as string,
            body
          );
          return res.status(200).json(updatedReading);
        } else {
          // Update map
          const updatedMap = await moistureService.updateMap(
            query.mapId as string,
            body
          );
          return res.status(200).json(updatedMap);
        }

      case 'DELETE':
        if (!query.mapId) {
          return res.status(400).json({ error: 'Map ID is required' });
        }
        if (query.readingId) {
          // Delete reading
          const deletedReading = await moistureService.deleteReading(
            query.readingId as string
          );
          return res.status(200).json(deletedReading);
        } else {
          return res.status(400).json({ error: 'Reading ID is required for deletion' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    const { status, body } = handleError(error);
    return res.status(status).json(body);
  }
}

// Apply middleware in order: role-based auth -> validation -> handler
// GET: Any authenticated user (VIEWER and up)
// POST/PUT/DELETE: TECHNICIAN and up
const methodRoles = {
  GET: withRole(Role.VIEWER)(moistureHandler),
  POST: withRole(Role.TECHNICIAN)(moistureHandler),
  PUT: withRole(Role.TECHNICIAN)(moistureHandler),
  DELETE: withRole(Role.TECHNICIAN)(moistureHandler),
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
