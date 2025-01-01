import { z } from 'zod';

// Common types
export const MoistureUnitSchema = z.enum(['WME', 'REL', 'PCT']);

// Input transformation utilities
const transformString = (str: string) => str.trim();
const transformRoom = (str: string) => str.trim().toLowerCase();
const transformNumber = (num: number) => Number(num.toFixed(2));

export const DataPointSchema = z.object({
  value: z.number().min(0).transform(transformNumber),
  unit: MoistureUnitSchema,
  depth: z.number().min(0).optional().transform((val) => 
    val ? transformNumber(val) : val
  )
});

export const LocationSchema = z.object({
  room: z.string().min(1).transform(transformRoom),
  floor: z.string().transform(transformString),
  x: z.number().transform(transformNumber),
  y: z.number().transform(transformNumber)
});

// Analytics schemas
export const TimeframeSchema = z.enum(['1h', '12h', '24h', '7d', '30d']);

export const AnalyticsRequestSchema = z.object({
  jobId: z.string().min(1).transform(transformString),
  room: z.string().optional().transform((val) => 
    val ? transformRoom(val) : val
  ),
  floor: z.string().optional().transform((val) => 
    val ? transformString(val) : val
  ),
  timeframe: z.union([TimeframeSchema, z.undefined()]).transform(val => val || '24h') as z.ZodType<typeof TimeframeSchema['_type']>
});

// Batch operation schemas
export const BatchCreateSchema = z.object({
  operation: z.literal('create'),
  data: z.object({
    jobId: z.string().min(1).transform(transformString),
    locationX: z.number().transform(transformNumber),
    locationY: z.number().transform(transformNumber),
    room: z.string().min(1).transform(transformRoom),
    floor: z.string().transform(transformString),
    notes: z.string().optional().transform((val) => 
      val ? transformString(val) : val
    ),
    dataPoints: z.array(DataPointSchema).min(1),
    equipmentId: z.string().min(1),
    floorPlanId: z.string(),
    temperature: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    humidity: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    pressure: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    )
  })
});

export const BatchUpdateSchema = z.object({
  operation: z.literal('update'),
  id: z.string().min(1),
  data: z.object({
    locationX: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    locationY: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    room: z.string().optional().transform((val) => 
      val ? transformRoom(val) : val
    ),
    floor: z.string().optional().transform((val) => 
      val ? transformString(val) : val
    ),
    notes: z.string().optional().transform((val) => 
      val ? transformString(val) : val
    ),
    dataPoints: z.array(DataPointSchema).optional(),
    equipmentId: z.string().optional().transform((val) => 
      val ? transformString(val) : val
    ),
    floorPlanId: z.string().optional().transform((val) => 
      val ? transformString(val) : val
    ),
    temperature: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    humidity: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    ),
    pressure: z.number().optional().transform((val) => 
      val ? transformNumber(val) : val
    )
  })
});

export const BatchDeleteSchema = z.object({
  operation: z.literal('delete'),
  id: z.string().min(1)
});

export const BatchOperationSchema = z.discriminatedUnion('operation', [
  BatchCreateSchema,
  BatchUpdateSchema,
  BatchDeleteSchema
]);

export const BatchRequestSchema = z.array(BatchOperationSchema);

// Export schemas
export const ExportFormatSchema = z.enum(['json', 'csv']);

export const DateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime()
});

export const ExportOptionsSchema = z.object({
  format: ExportFormatSchema,
  includeMetadata: z.boolean().default(false),
  dateRange: DateRangeSchema.optional()
});

export const ExportFiltersSchema = z.object({
  jobId: z.string().optional().transform((val) => 
    val ? transformString(val) : val
  ),
  room: z.string().optional().transform((val) => 
    val ? transformRoom(val) : val
  ),
  floor: z.string().optional().transform((val) => 
    val ? transformString(val) : val
  ),
  equipmentId: z.string().optional().transform((val) => 
    val ? transformString(val) : val
  )
}).optional();

export const ExportRequestSchema = z.object({
  options: ExportOptionsSchema,
  filters: ExportFiltersSchema
});

// Claims schemas
export const ClaimSchema = z.object({
  reportId: z.string().min(1).transform(transformString),
  claimedBy: z.string().min(1).transform(transformString), // User or organization ID
  claimedAt: z.string().datetime(),
  claimType: z.enum(['insurance', 'warranty', 'assessment']),
  claimReference: z.string().min(1).transform(transformString), // External reference number
  status: z.enum(['active', 'expired', 'revoked']).default('active'),
  metadata: z.record(z.unknown()).optional()
});

export const ClaimRequestSchema = z.object({
  reportId: z.string().min(1).transform(transformString),
  claimType: z.enum(['insurance', 'warranty', 'assessment']),
  claimReference: z.string().min(1).transform(transformString)
});
