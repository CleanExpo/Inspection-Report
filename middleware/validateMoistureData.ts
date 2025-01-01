import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationError } from '../utils/errors';
import { MoistureData } from '../types/moisture';

const JOB_NUMBER_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])-\d{3}$/;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const VALID_CATEGORIES = ['WATER_DAMAGE', 'FLOOD', 'LEAK', 'STORM_DAMAGE', 'OTHER'];

export function validateJobNumber(jobNumber: string): void {
  const errors: Record<string, string[]> = {};

  if (!jobNumber) {
    errors.jobNumber = ['Job number is required'];
    throw new ValidationError('Job number validation failed', errors);
  }

  if (!JOB_NUMBER_REGEX.test(jobNumber)) {
    errors.jobNumber = ['Invalid job number format. Expected: YYYY-MMDD-XXX'];
    throw new ValidationError('Job number validation failed', errors);
  }

  const [year, monthDay, sequence] = jobNumber.split('-');
  const month = monthDay.substring(0, 2);
  const day = monthDay.substring(2);

  // Validate year
  const currentYear = new Date().getFullYear();
  const jobYear = parseInt(year);
  if (jobYear < 2000 || jobYear > currentYear + 1) {
    errors.jobNumber = [`Year must be between 2000 and ${currentYear + 1}`];
    throw new ValidationError('Job number validation failed', errors);
  }

  // Validate month
  const monthNum = parseInt(month);
  if (monthNum < 1 || monthNum > 12) {
    errors.jobNumber = ['Month must be between 01 and 12'];
    throw new ValidationError('Job number validation failed', errors);
  }

  // Validate day
  const dayNum = parseInt(day);
  const lastDayOfMonth = new Date(jobYear, monthNum, 0).getDate();
  if (dayNum < 1 || dayNum > lastDayOfMonth) {
    errors.jobNumber = [`Day must be between 01 and ${lastDayOfMonth} for the given month`];
    throw new ValidationError('Job number validation failed', errors);
  }

  // Validate sequence
  const sequenceNum = parseInt(sequence);
  if (sequenceNum < 1 || sequenceNum > 999) {
    errors.jobNumber = ['Sequence number must be between 001 and 999'];
    throw new ValidationError('Job number validation failed', errors);
  }
}

export function validateMoistureData(data: Partial<MoistureData>): void {
  const errors: Record<string, string[]> = {};

  // Validate job number if provided
  if (data.jobNumber) {
    try {
      validateJobNumber(data.jobNumber);
    } catch (error) {
      if (error instanceof ValidationError && Array.isArray(error.details.jobNumber)) {
        errors.jobNumber = error.details.jobNumber;
      } else {
        errors.jobNumber = ['Invalid job number'];
      }
    }
  }

  // Validate clientId if provided
  if (!data.clientId && data.jobNumber) {
    errors.clientId = ['Client ID is required'];
  }

  // Validate priority if provided
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    errors.priority = [`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`];
  }

  // Validate category if provided
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.category = [`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`];
  }

  // Validate client name if provided
  if (data.clientName && (typeof data.clientName !== 'string' || data.clientName.length < 2)) {
    errors.clientName = ['Client name must be at least 2 characters long'];
  }

  // Validate job address if provided
  if (data.jobAddress && (typeof data.jobAddress !== 'string' || data.jobAddress.length < 5)) {
    errors.jobAddress = ['Job address must be at least 5 characters long'];
  }

  // Validate readings if provided
  if (data.readings?.length) {
    const readingErrors: string[] = [];
    data.readings.forEach((reading, index) => {
      if (typeof reading.value !== 'number' || reading.value < 0) {
        readingErrors.push(`Reading ${index + 1}: Invalid value`);
      }
      if (typeof reading.locationX !== 'number' || reading.locationX < 0 || reading.locationX > 1) {
        readingErrors.push(`Reading ${index + 1}: Invalid X coordinate`);
      }
      if (typeof reading.locationY !== 'number' || reading.locationY < 0 || reading.locationY > 1) {
        readingErrors.push(`Reading ${index + 1}: Invalid Y coordinate`);
      }
    });
    if (readingErrors.length) {
      errors.readings = readingErrors;
    }
  }

  // If there are any validation errors, throw them
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

export function withMoistureValidation(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
    try {
      // Only validate POST and PUT requests
      if (['POST', 'PUT'].includes(req.method || '')) {
        validateMoistureData(req.body);
      }
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
