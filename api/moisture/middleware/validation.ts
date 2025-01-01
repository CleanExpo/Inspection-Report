import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ErrorResponse } from '../types/responses';
import { logger } from '../utils/logger';

export function validateRequest<T>(schema: z.Schema<T>, source: 'body' | 'query' = 'body') {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<T | null> => {
    try {
      let data = source === 'body' ? req.body : req.query;
      
      // Log incoming request data for debugging
      logger.debug('Validating request data', {
        method: req.method,
        url: req.url,
        source,
        data
      });
      
      // For query parameters, convert numeric strings to numbers
      if (source === 'query') {
        data = Object.entries(data).reduce((acc, [key, value]) => {
          // Handle arrays
          if (Array.isArray(value)) {
            acc[key] = value.map(v => parseQueryValue(v));
          } else {
            acc[key] = parseQueryValue(value as string);
          }
          return acc;
        }, {} as Record<string, unknown>);
      }

      // Perform strict validation
      const validatedData = await schema.parseAsync(data);
      
      // Log successful validation
      logger.debug('Request validation successful', {
        method: req.method,
        url: req.url
      });

      return validatedData;
    } catch (error) {
      // Enhanced error logging
      logger.error('Request validation failed', {
        method: req.method,
        url: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof z.ZodError) {
        const response: ErrorResponse = {
          error: {
            code: 400,
            message: 'Validation failed',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        };
        res.status(400).json(response);
        return null;
      }
      
      const response: ErrorResponse = {
        error: {
          code: 500,
          message: 'Internal server error during validation',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      res.status(500).json(response);
      return null;
    }
  };
}

export function createErrorResponse(
  code: number,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    error: {
      code,
      message,
      details
    }
  };
}

function parseQueryValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}

// Helper to wrap API handlers with validation
export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextApiRequest & { validatedData: z.infer<T> },
    res: NextApiResponse
  ) => Promise<void>,
  source: 'body' | 'query' = 'body'
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Log start of request processing
    logger.info('Processing request', {
      method: req.method,
      url: req.url,
      source
    });

    const validatedData = await validateRequest(schema, source)(req, res);
    if (validatedData === null) {
      logger.warn('Request validation failed, aborting handler execution', {
        method: req.method,
        url: req.url
      });
      return;
    }

    try {
      // Add validated data to extended request object
      const extendedReq = req as NextApiRequest & { validatedData: T };
      extendedReq.validatedData = validatedData;

      // Log successful validation
      logger.debug('Request validated successfully, executing handler', {
        method: req.method,
        url: req.url
      });

      await handler(extendedReq, res);

      // Log successful request completion
      logger.info('Request processed successfully', {
        method: req.method,
        url: req.url
      });
    } catch (error) {
      // Enhanced error logging with full context
      logger.error('Error processing request', {
        method: req.method,
        url: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          validatedData,
          headers: req.headers
        }
      });

      const response = createErrorResponse(
        500,
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      res.status(500).json(response);
    }
  };
}
