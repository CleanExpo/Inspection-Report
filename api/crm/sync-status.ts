import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

type SyncStatusResponse = {
  totalClients: number;
  syncedClients: number;
  pendingClients: number;
  failedClients: number;
  needsUpdateClients: number;
  lastSyncTime?: Date | null;
  error?: string;
};

const SyncStatus = {
  SYNCED: 'SYNCED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  NEEDS_UPDATE: 'NEEDS_UPDATE',
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncStatusResponse>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        totalClients: 0,
        syncedClients: 0,
        pendingClients: 0,
        failedClients: 0,
        needsUpdateClients: 0
      });
    }

    // Get total count and counts by status
    const [
      totalClients,
      syncedClients,
      pendingClients,
      failedClients,
      needsUpdateClients,
      lastSync
    ] = await Promise.all([
      prisma.client.count(),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM clients
        WHERE crm_sync_status = ${SyncStatus.SYNCED}
      `.then(result => Number(result[0].count)),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM clients
        WHERE crm_sync_status = ${SyncStatus.PENDING}
      `.then(result => Number(result[0].count)),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM clients
        WHERE crm_sync_status = ${SyncStatus.FAILED}
      `.then(result => Number(result[0].count)),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM clients
        WHERE crm_sync_status = ${SyncStatus.NEEDS_UPDATE}
      `.then(result => Number(result[0].count)),
      prisma.$queryRaw<[{ crm_last_sync: Date | null }]>`
        SELECT crm_last_sync
        FROM clients
        WHERE crm_sync_status = ${SyncStatus.SYNCED}
        ORDER BY crm_last_sync DESC
        LIMIT 1
      `.then(result => result[0]?.crm_last_sync ?? null)
    ]);

    return res.status(200).json({
      totalClients,
      syncedClients,
      pendingClients,
      failedClients,
      needsUpdateClients,
      lastSyncTime: lastSync
    });
  } catch (error) {
    console.error('CRM sync status error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      totalClients: 0,
      syncedClients: 0,
      pendingClients: 0,
      failedClients: 0,
      needsUpdateClients: 0
    });
  }
}
