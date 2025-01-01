import { z } from 'zod';
import type { ChangePoint, TimeSeriesPoint, TrendAnalysis } from './types';

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  jobId: z.string().uuid().optional(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional()
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// MoistureUnit enum
export const moistureUnitSchema = z.enum(['WME', 'REL', 'PCT']);
export type MoistureUnit = z.infer<typeof moistureUnitSchema>;

// Basic validation schemas
export const point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const timeSeriesMetadataSchema = z.object({
  room: z.string().min(1),
  floor: z.string().min(1),
  locationX: z.number(),
  locationY: z.number(),
});

export const timeSeriesPointSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.number(),
  metadata: timeSeriesMetadataSchema,
});

// Interval validation
export const intervalSchema = z.enum(['hourly', 'daily', 'weekly']);

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Extended types
export interface ExtendedChangePoint extends ChangePoint {
  affectedArea?: {
    x: number;
    y: number;
    radius: number;
  };
  metadata: {
    room: string;
    floor: string;
    locationX: number;
    locationY: number;
  };
}

// Options schema
export const analyticsOptionsSchema = z.object({
  resolution: intervalSchema,
  includeTrends: z.boolean().optional(),
  includeHotspots: z.boolean().optional()
});

// Analytics request schema
export const AnalyticsRequestSchema = z.object({
  jobId: z.string().uuid(),
  timeRange: dateRangeSchema,
  options: analyticsOptionsSchema
});

// Type definitions
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;
export type ValidatedAnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;

// Response schemas
export const summarySchema = z.object({
  totalReadings: z.number().int().min(0),
  averageValue: z.number(),
  maxValue: z.number(),
  minValue: z.number(),
  standardDeviation: z.number()
});

export const hotspotReadingSchema = z.object({
  value: z.number().min(0).max(100),
  unit: moistureUnitSchema,
  timestamp: z.string().datetime()
});

// Severity levels for hotspots
export const severityLevelSchema = z.enum(['low', 'medium', 'high']);
export type SeverityLevel = z.infer<typeof severityLevelSchema>;

export const hotspotSchema = z.object({
  center: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    room: z.string().min(1),
    floor: z.string().min(1)
  }),
  radius: z.number().positive(),
  severity: severityLevelSchema,
  readings: z.array(hotspotReadingSchema).min(1),
  confidence: z.number().min(0).max(1).optional()
});

export const analyticsResponseSchema = z.object({
  jobId: z.string().uuid(),
  timeRange: dateRangeSchema,
  timeSeriesData: z.array(timeSeriesPointSchema).optional(),
  changePoints: z.array(z.custom<ExtendedChangePoint>()).optional(),
  summary: summarySchema,
  trends: z.custom<TrendAnalysis>().optional(),
  hotspots: z.array(hotspotSchema).optional(),
  metadata: z.object({
    version: z.string(),
    generatedAt: z.string().datetime(),
    processingTimeMs: z.number().int().positive()
  })
});

// Response types
export type Summary = z.infer<typeof summarySchema>;
export type HotspotReading = z.infer<typeof hotspotReadingSchema>;
export type Hotspot = z.infer<typeof hotspotSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;

export type { TimeSeriesPoint } from './types';
