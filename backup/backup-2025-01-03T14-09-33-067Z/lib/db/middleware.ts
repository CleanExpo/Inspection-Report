import { Prisma } from '@prisma/client';

/**
 * Middleware for logging database operations
 */
export const loggingMiddleware: Prisma.Middleware = async (params, next) => {
  const startTime = Date.now();
  const modelName = params.model;
  const action = params.action;
  const args = params.args;

  try {
    const result = await next(params);
    const duration = Date.now() - startTime;

    // Log successful operations
    console.log({
      timestamp: new Date().toISOString(),
      model: modelName,
      action: action,
      duration: `${duration}ms`,
      success: true
    });

    return result;
  } catch (error: any) {
    // Log failed operations
    console.error({
      timestamp: new Date().toISOString(),
      model: modelName,
      action: action,
      args: args,
      error: error.message,
      success: false
    });

    throw error;
  }
};

/**
 * Middleware for query performance monitoring
 */
export const performanceMiddleware: Prisma.Middleware = async (params, next) => {
  const startTime = Date.now();
  const result = await next(params);
  const duration = Date.now() - startTime;

  // Alert on slow queries (over 100ms)
  if (duration > 100) {
    console.warn({
      timestamp: new Date().toISOString(),
      alert: 'Slow Query Detected',
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
      args: params.args
    });
  }

  return result;
};
