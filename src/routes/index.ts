import { Express } from 'express';
import { jobRoutes } from './jobs';
import { readingRoutes } from './readings';
import { equipmentRoutes } from './equipment';
import { authRoutes } from './auth';
import { createError } from '../middleware/errorHandler';

export const setupRoutes = (app: Express): void => {
  // API version prefix
  const apiPrefix = '/api/v1';

  // Mount routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/jobs`, jobRoutes);
  app.use(`${apiPrefix}/readings`, readingRoutes);
  app.use(`${apiPrefix}/equipment`, equipmentRoutes);

  // API documentation redirect
  app.get(`${apiPrefix}/docs`, (req, res) => {
    res.redirect('/api-docs');
  });

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });

  // Handle 404 errors
  app.use((req, res, next) => {
    next(createError.notFound(`Route ${req.path} not found`));
  });
};

// Export route types for type safety
export type RouteConfig = {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  handler: Function;
  middleware?: Function[];
  description?: string;
};

// Export common route patterns
export const routePatterns = {
  id: ':id([0-9a-fA-F-]{36})',
  page: '?page=:page(&limit=:limit)?',
  search: '?search=:search',
  filter: '?filter[field]=value',
  sort: '?sort=:field(:direction)?',
};
