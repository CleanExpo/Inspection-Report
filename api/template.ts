import { NextApiRequest, NextApiResponse } from 'next';
import { templateService } from '../app/services/templateService';
import { withTemplateValidation } from '../middleware/validateTemplate';
import { withRole } from '../middleware/auth';
import { withRateLimit } from '../middleware/rateLimit';
import { withCors } from '../middleware/cors';
import { handleError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';

async function templateHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { method, query, body } = req;

    switch (method) {
      case 'POST':
        const newTemplate = await templateService.createTemplate(body);
        return res.status(201).json(newTemplate);

      case 'GET':
        if (query.id) {
          const template = await templateService.getTemplateById(query.id as string);
          if (!template) {
            return res.status(404).json({ error: 'Template not found' });
          }
          return res.status(200).json(template);
        } else if (query.category) {
          const templates = await templateService.getTemplatesByCategory(
            query.category as 'Commercial' | 'Residential'
          );
          return res.status(200).json(templates);
        } else {
          const templates = await templateService.getTemplates();
          return res.status(200).json(templates);
        }

      case 'PUT':
        if (!query.id) {
          return res.status(400).json({ error: 'Template ID is required' });
        }
        const updatedTemplate = await templateService.updateTemplate(
          query.id as string,
          body
        );
        return res.status(200).json(updatedTemplate);

      case 'DELETE':
        if (!query.id) {
          return res.status(400).json({ error: 'Template ID is required' });
        }
        const deletedTemplate = await templateService.deleteTemplate(query.id as string);
        return res.status(200).json(deletedTemplate);

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
// POST/PUT: ADMIN only
// DELETE: ADMIN only
const methodRoles = {
  GET: withRole('VIEWER')(templateHandler),
  POST: withRole('ADMIN')(templateHandler),
  PUT: withRole('ADMIN')(templateHandler),
  DELETE: withRole('ADMIN')(templateHandler),
};

// Compose all middleware
function composeMiddleware(baseHandler: any, method: string) {
  // Start with the base handler
  let composed = methodRoles[method as keyof typeof methodRoles] || baseHandler;

  // Add validation for POST and PUT
  if (['POST', 'PUT'].includes(method)) {
    composed = withTemplateValidation(composed);
  }

  // Add rate limiting
  composed = withRateLimit(composed, '/api/template');

  // Add CORS (must be last to handle preflight)
  composed = withCors(composed, '/api/template');

  return composed;
}

export default async function routeHandler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method || 'GET';
  const handler = composeMiddleware(templateHandler, method);
  
  if (!handler) {
    res.setHeader('Allow', Object.keys(methodRoles));
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  return handler(req, res);
}
