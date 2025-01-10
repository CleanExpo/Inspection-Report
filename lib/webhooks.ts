import { prisma } from './prisma';

export type WebhookEvent = 'client.created' | 'client.updated' | 'client.deleted' | 'sync.status.changed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: unknown;
}

export async function sendWebhookNotification(event: WebhookEvent, data: unknown): Promise<string[]> {
  try {
    const response = await fetch('/api/webhooks/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        payload: {
          event,
          timestamp: new Date().toISOString(),
          data,
        } satisfies WebhookPayload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.deliveryIds || [];
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
    return [];
  }
}

export async function retryFailedWebhooks(): Promise<number> {
  try {
    const response = await fetch('/api/webhooks/retry', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Webhook retry failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.retriedCount || 0;
  } catch (error) {
    console.error('Failed to retry webhooks:', error);
    return 0;
  }
}

interface WebhookDeliveryStatus {
  status: number;
  error: string | null;
}

export async function getWebhookDeliveryStatus(deliveryId: string) {
  try {
    const [delivery] = await prisma.$queryRaw<WebhookDeliveryStatus[]>`
      SELECT status, error
      FROM webhook_deliveries
      WHERE id = ${deliveryId}::uuid
    `;

    return delivery || null;
  } catch (error) {
    console.error('Failed to get webhook delivery status:', error);
    return null;
  }
}

interface WebhookStats {
  total: string;
  success: string;
  failed: string;
  pending_retry: string;
}

export async function getWebhookStats() {
  try {
    const [stats] = await prisma.$queryRaw<WebhookStats[]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status < 400) as success,
        COUNT(*) FILTER (WHERE status >= 400) as failed,
        COUNT(*) FILTER (
          WHERE status >= 400 
          AND retry_count < 3 
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        ) as pending_retry
      FROM webhook_deliveries
    `;

    if (!stats) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        pendingRetry: 0,
      };
    }

    return {
      total: parseInt(stats.total),
      success: parseInt(stats.success),
      failed: parseInt(stats.failed),
      pendingRetry: parseInt(stats.pending_retry),
    };
  } catch (error) {
    console.error('Failed to get webhook stats:', error);
    return {
      total: 0,
      success: 0,
      failed: 0,
      pendingRetry: 0,
    };
  }
}
