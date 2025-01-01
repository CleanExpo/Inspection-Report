import { z } from 'zod';
import { DataPointSchema, LocationSchema, ClaimSchema } from './schemas';

// Base response type for consistent error handling
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
    details: z.unknown().optional()
  })
});

// Analytics response types
export const AnalyticsSummarySchema = z.object({
  average: z.number(),
  max: z.number(),
  min: z.number(),
  readings: z.number(),
  unit: z.string()
});

export const AnalyticsResponseSchema = z.object({
  timeframe: z.enum(['1h', '12h', '24h', '7d', '30d']),
  summary: AnalyticsSummarySchema,
  trends: z.array(z.object({
    timestamp: z.string(),
    value: z.number()
  })),
  hotspots: z.array(z.object({
    location: LocationSchema,
    intensity: z.number()
  }))
});

// Batch operations response types
export const BatchOperationResultSchema = z.object({
  success: z.boolean(),
  operation: z.enum(['create', 'update', 'delete']),
  id: z.string().optional(),
  error: z.string().optional()
});

export const BatchResponseSchema = z.object({
  results: z.array(BatchOperationResultSchema),
  summary: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number()
  })
});

// Export response types
export const ExportResponseSchema = z.object({
  format: z.enum(['json', 'csv']),
  url: z.string().url(),
  metadata: z.object({
    timestamp: z.string(),
    filters: z.record(z.string()).optional(),
    recordCount: z.number()
  }).optional()
});

// Claims response types
export const ClaimResponseSchema = ClaimSchema.extend({
  id: z.string()
});

export const ClaimListResponseSchema = z.object({
  claims: z.array(ClaimResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number()
  })
});

// Type exports
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type BatchResponse = z.infer<typeof BatchResponseSchema>;
export type ExportResponse = z.infer<typeof ExportResponseSchema>;
export type ClaimResponse = z.infer<typeof ClaimResponseSchema>;
export type ClaimListResponse = z.infer<typeof ClaimListResponseSchema>;
