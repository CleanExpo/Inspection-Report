import { NextApiRequest, NextApiResponse } from 'next';

const VALID_SYNC_STATUSES = ['SYNCED', 'PENDING', 'FAILED', 'NEEDS_UPDATE'] as const;
type SyncStatus = typeof VALID_SYNC_STATUSES[number];

interface ValidationError {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export function validateSyncStatusUpdate(
  req: NextApiRequest,
  res: NextApiResponse<ValidationError>,
  next: () => Promise<void>
) {
  const { clientId, status } = req.body;

  const errors: Record<string, string> = {};

  // Validate clientId
  if (!clientId) {
    errors.clientId = 'Client ID is required';
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId)) {
    errors.clientId = 'Invalid UUID format';
  }

  // Validate status
  if (!status) {
    errors.status = 'Status is required';
  } else if (!VALID_SYNC_STATUSES.includes(status as SyncStatus)) {
    errors.status = `Status must be one of: ${VALID_SYNC_STATUSES.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  return next();
}

export function withSyncStatusValidation(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await validateSyncStatusUpdate(req, res, async () => {
        await handler(req, res);
      });
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      });
    }
  };
}
