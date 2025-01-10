import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

interface ValidationSchema {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
}

export const validateRequest = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Track validation start time for performance logging
      const startTime = process.hrtime();

      // Validate request parameters if schema provided
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      // Validate query parameters if schema provided
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      // Validate request body if schema provided
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Log validation performance
      const endTime = process.hrtime(startTime);
      const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6; // Convert to milliseconds

      logger.debug('Request validation completed', {
        path: req.path,
        duration: `${duration.toFixed(2)}ms`,
        validated: {
          params: !!schema.params,
          query: !!schema.query,
          body: !!schema.body,
        },
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        // Log validation failure
        logger.warn('Request validation failed', {
          path: req.path,
          errors,
        });

        // Throw formatted validation error
        next(new ValidationError(errors));
      } else {
        // Log unexpected error
        logger.error('Unexpected validation error', {
          path: req.path,
          error,
        });

        next(error);
      }
    }
  };
};

// Helper function to validate request body only
export const validateBody = (schema: AnyZodObject) => {
  return validateRequest({ body: schema });
};

// Helper function to validate query parameters only
export const validateQuery = (schema: AnyZodObject) => {
  return validateRequest({ query: schema });
};

// Helper function to validate route parameters only
export const validateParams = (schema: AnyZodObject) => {
  return validateRequest({ params: schema });
};

// Common validation schemas
import { z } from 'zod';

export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid(),

  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),

  // Date range parameters
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),

  // Search parameters
  search: z.object({
    query: z.string().min(1).max(100),
    fields: z.array(z.string()).optional(),
  }),

  // Sort parameters
  sort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),

  // Filter parameters
  filter: z.record(z.string(), z.union([z.string(), z.array(z.string())])),

  // Email validation
  email: z.string().email(),

  // Password validation with requirements
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Phone number validation
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // URL validation
  url: z.string().url(),

  // JSON validation
  json: z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid JSON string',
      });
      return z.NEVER;
    }
  }),

  // Enum validation helper
  enumValue: <T extends string>(enumObj: { [key: string]: T }) =>
    z.enum(Object.values(enumObj) as [T, ...T[]]),
};

// Example usage:
/*
const createUserSchema = z.object({
  params: commonSchemas.uuid,
  query: commonSchemas.pagination,
  body: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone.optional(),
  }),
});

router.post('/users', validateRequest(createUserSchema), async (req, res) => {
  // Request is validated, types are inferred
  const { email, password, phone } = req.body;
  // ...
});
*/
