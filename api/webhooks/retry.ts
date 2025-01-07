import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import crypto from 'crypto';

type WebhookRetryResponse = {
  success: boolean;
  retriedCount?: number;
  error?: string;
};

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: unknown;
  retry_count: number;
}

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  headers: Record<string, string> | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookRetryResponse>
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed'
      });
    }

    // Get failed deliveries that are due for retry
    const failedDeliveries = await prisma.$queryRaw<WebhookDelivery[]>`
      SELECT d.id, d.webhook_id, d.event, d.payload, d.retry_count
      FROM webhook_deliveries d
      WHERE d.status >= 400
      AND d.retry_count < 3
      AND (d.next_retry_at IS NULL OR d.next_retry_at <= NOW())
      LIMIT 10
    `;

    if (failedDeliveries.length === 0) {
      return res.status(200).json({
        success: true,
        retriedCount: 0
      });
    }

    // Get webhook configs for the failed deliveries
    const webhookIds = Array.from(new Set(failedDeliveries.map(d => d.webhook_id)));
    const webhooks = await prisma.$queryRaw<WebhookConfig[]>`
      SELECT id, url, secret, headers
      FROM webhook_configs
      WHERE id = ANY(${webhookIds}::uuid[])
      AND is_active = true
    `;

    const webhookMap = new Map(webhooks.map(w => [w.id, w]));

    // Retry each failed delivery
    const retryPromises = failedDeliveries.map(async (delivery) => {
      const webhook = webhookMap.get(delivery.webhook_id);
      if (!webhook) return; // Skip if webhook was deleted or deactivated

      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(delivery.payload))
        .digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Retry': (delivery.retry_count + 1).toString(),
            ...(webhook.headers || {})
          },
          body: JSON.stringify(delivery.payload)
        });

        const responseData = await response.json();

        await prisma.$executeRaw`
          UPDATE webhook_deliveries
          SET 
            response = ${responseData}::jsonb,
            status = ${response.status},
            retry_count = retry_count + 1,
            next_retry_at = CASE
              WHEN ${response.status} >= 400 THEN NOW() + interval '10 minutes'
              ELSE NULL
            END,
            updated_at = NOW()
          WHERE id = ${delivery.id}
        `;

        return response.status < 400;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await prisma.$executeRaw`
          UPDATE webhook_deliveries
          SET 
            error = ${errorMessage},
            status = 500,
            retry_count = retry_count + 1,
            next_retry_at = NOW() + interval '10 minutes',
            updated_at = NOW()
          WHERE id = ${delivery.id}
        `;

        return false;
      }
    });

    const results = await Promise.all(retryPromises);
    const successCount = results.filter(Boolean).length;

    return res.status(200).json({
      success: true,
      retriedCount: failedDeliveries.length
    });
  } catch (error) {
    console.error('Webhook retry error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
