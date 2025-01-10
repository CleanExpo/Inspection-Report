import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { APIResponse } from '../api-client';
import { getSession } from 'next-auth/react';

export type ApiHandler<TInput = unknown, TOutput = TInput> = (
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<TOutput>>
) => Promise<void>;

export interface ApiMiddlewareOptions<TInput> {
  schema?: z.ZodSchema<TInput>;
  requireAuth?: boolean;
  allowedMethods?: string[];
}

type HandlerWithValidation<TInput, TOutput> = (
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<TOutput>>,
  validatedData: TInput
) => Promise<void>;

type HandlerWithoutValidation<TOutput> = (
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<TOutput>>
) => Promise<void>;

export function withApiHandler<TInput = unknown, TOutput = TInput>(
  handler: HandlerWithValidation<TInput, TOutput> | HandlerWithoutValidation<TOutput>,
  options: ApiMiddlewareOptions<TInput> = {}
): ApiHandler<TInput, TOutput> {
  return async (req: NextApiRequest, res: NextApiResponse<APIResponse<TOutput>>) => {
    try {
      // Method validation
      if (options.allowedMethods && !options.allowedMethods.includes(req.method!)) {
        res.status(405).json({
          success: false,
          error: {
            message: `Method ${req.method} not allowed`
          }
        });
        return;
      }

      // Authentication check
      if (options.requireAuth) {
        const session = await getSession({ req });
        if (!session) {
          res.status(401).json({
            success: false,
            error: {
              message: 'Unauthorized'
            }
          });
          return;
        }
      }

      // Request validation
      let validatedData: TInput | undefined;
      if (options.schema) {
        try {
          validatedData = options.schema.parse(
            req.method === 'GET' ? req.query : req.body
          );
        } catch (error) {
          if (error instanceof z.ZodError) {
            res.status(400).json({
              success: false,
              error: {
                message: 'Validation failed',
                details: error.errors.reduce((acc, curr) => ({
                  ...acc,
                  [curr.path.join('.')]: curr.message
                }), {})
              }
            });
            return;
          }
          throw error;
        }
      }

      // Rate limiting headers
      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', '99'); // This would be dynamic in production

      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        options.allowedMethods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type, Authorization'
      );

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Call the actual handler
      if (options.schema) {
        await (handler as HandlerWithValidation<TInput, TOutput>)(req, res, validatedData as TInput);
      } else {
        await (handler as HandlerWithoutValidation<TOutput>)(req, res);
      }
    } catch (error) {
      console.error('API Error:', error);

      // Don't override if response has already been sent
      if (res.headersSent) return;

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.errors.reduce((acc, curr) => ({
              ...acc,
              [curr.path.join('.')]: curr.message
            }), {})
          }
        });
        return;
      }

      const statusCode = error instanceof Error && 'statusCode' in error
        ? (error as any).statusCode
        : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  };
}

// Utility to create a validated API handler
export function createApiHandler<TInput, TOutput = TInput>(
  handler: HandlerWithValidation<TInput, TOutput>,
  schema: z.ZodSchema<TInput>,
  options: Omit<ApiMiddlewareOptions<TInput>, 'schema'> = {}
): ApiHandler<TInput, TOutput> {
  return withApiHandler<TInput, TOutput>(handler, { ...options, schema });
}
