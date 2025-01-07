import { z } from 'zod';

export const sectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  order: z.number().int().min(0),
  inspectionId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createSectionSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  order: z.number().int().min(0),
  inspectionId: z.string().uuid(),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export type Section = z.infer<typeof sectionSchema>;
export type CreateSection = z.infer<typeof createSectionSchema>;
export type UpdateSection = z.infer<typeof updateSectionSchema>;

export const validateSection = (data: unknown): Section => {
  return sectionSchema.parse(data);
};

export const validateCreateSection = (data: unknown): CreateSection => {
  return createSectionSchema.parse(data);
};

export const validateUpdateSection = (data: unknown): UpdateSection => {
  return updateSectionSchema.parse(data);
};
