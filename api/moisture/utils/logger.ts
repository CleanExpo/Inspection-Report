import { NextApiRequest } from 'next';
import { ErrorResponse } from './errorCodes';
import { loggingService, withTiming } from '../../../services/loggingService';

// Re-export the logging service methods with the same interface
export const logger = {
  info: (message: string, data?: any) => loggingService.info(message, data),
  warn: (message: string, data?: any) => loggingService.warn(message, data),
  error: (message: string, data?: any) => loggingService.error(message, data),
  debug: (message: string, data?: any) => loggingService.debug(message, data),
  request: (req: NextApiRequest, message?: string) => loggingService.logRequest(req, message),
  response: (req: NextApiRequest, statusCode: number, responseData?: any) => 
    loggingService.logResponse(req, statusCode, responseData),
  errorResponse: (req: NextApiRequest, error: ErrorResponse) => 
    loggingService.logError(req, error),
  performance: (req: NextApiRequest, duration: number) => 
    loggingService.logPerformance(req, duration)
};

// Re-export the timing middleware
export { withTiming };
