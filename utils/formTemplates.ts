import { z } from 'zod';

const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'SIGNATURE']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.array(z.object({
    type: z.enum(['REQUIRED', 'MIN_LENGTH', 'MAX_LENGTH', 'MIN_VALUE', 'MAX_VALUE', 'PATTERN', 'CUSTOM']),
    value: z.any().optional(),
    message: z.string()
  })).optional(),
  defaultValue: z.any().optional()
});

const templateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  fields: z.array(fieldSchema),
  version: z.number().int().positive(),
  isActive: z.boolean()
});

export function validateTemplate(data: unknown) {
  try {
    const validatedData = templateSchema.parse(data);
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
}

export function validateField(field: unknown) {
  try {
    const validatedData = fieldSchema.parse(field);
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
}
