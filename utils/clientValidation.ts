import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const clientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().regex(emailRegex, 'Invalid email format'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  address: z.string().min(5).max(200).optional(),
  company: z.string().min(2).max(100).optional(),
  notes: z.string().max(1000).optional()
});

export const validateClientData = (data: unknown) => {
  try {
    const validatedData = clientSchema.parse(data);
    return {
      isValid: true,
      data: validatedData,
      errors: null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    throw error;
  }
};

export const JOB_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD'
] as const;

export const JOB_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
] as const;

export type JobStatus = typeof JOB_STATUSES[number];
export type JobPriority = typeof JOB_PRIORITIES[number];
