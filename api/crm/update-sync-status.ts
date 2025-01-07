import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { sendWebhookNotification } from '../../lib/webhooks';
import { withSyncStatusValidation } from '../../lib/middleware/validate-sync-status';

type UpdateSyncStatusResponse = {
  success: boolean;
  error?: string;
  details?: Record<string, string>;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSyncStatusResponse>
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed'
      });
    }

    const { clientId, status } = req.body;

    // Get current client status
    const currentClient = await prisma.$queryRaw<{ crm_sync_status: string | null }[]>`
      SELECT crm_sync_status
      FROM clients
      WHERE id = ${clientId}::uuid
    `;

    if (!currentClient[0]) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const oldStatus = currentClient[0].crm_sync_status;

    // Update client sync status
    await prisma.$executeRaw`
      UPDATE clients
      SET 
        crm_sync_status = ${status}::crm_sync_status,
        crm_last_sync = CASE
          WHEN ${status}::crm_sync_status = 'SYNCED' THEN NOW()
          ELSE crm_last_sync
        END,
        updated_at = NOW()
      WHERE id = ${clientId}::uuid
    `;

    // Send webhook notification if status changed
    if (oldStatus !== status) {
      await sendWebhookNotification('sync.status.changed', {
        clientId,
        oldStatus,
        newStatus: status,
        timestamp: new Date().toISOString()
      });

      // Create history record
      await prisma.$executeRaw`
        INSERT INTO client_histories (
          id,
          client_id,
          field,
          old_value,
          new_value,
          changed_by,
          change_type,
          timestamp,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${clientId}::uuid,
          'crmSyncStatus',
          ${oldStatus},
          ${status},
          'system',
          'update',
          NOW(),
          NOW(),
          NOW()
        )
      `;
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Update sync status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export default withSyncStatusValidation(handler);
