import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Validation schemas
const validationRuleSchema = z.object({
  type: z.string(),
  value: z.string(),
  message: z.string(),
});

const fieldSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.any().optional(),
  order: z.number().int().min(0),
  isRequired: z.boolean(),
  validationRules: z.array(validationRuleSchema).optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().int().min(0),
  isRequired: z.boolean(),
  fields: z.array(fieldSchema),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['Commercial', 'Residential']),
  sections: z.array(sectionSchema),
});

// Validation middleware
export function withTemplateValidation(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (['POST', 'PUT'].includes(req.method || '')) {
        // For PUT requests, make all fields optional except ID
        const schema = req.method === 'PUT'
          ? templateSchema.partial()
          : templateSchema;

        const validatedBody = await schema.parseAsync(req.body);
        req.body = validatedBody;
      }

      return handler(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      throw error;
    }
  };
}
