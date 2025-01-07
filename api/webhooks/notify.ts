import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import crypto from 'crypto';

type WebhookNotifyResponse = {
  success: boolean;
  deliveryIds?: string[];
  error?: string;
};

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  headers: Record<string, string> | null;
}

interface WebhookDelivery {
  id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookNotifyResponse>
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed'
      });
    }

    const { event, payload } = req.body;

    if (!event || !payload) {
      return res.status(400).json({
        success: false,
        error: 'Missing event or payload'
      });
    }

    // Get active webhooks for this event
    const webhooks = await prisma.$queryRaw<WebhookConfig[]>`
      SELECT id, url, secret, headers
      FROM webhook_configs
      WHERE is_active = true
      AND ${event} = ANY(events)
    `;

    if (webhooks.length === 0) {
      return res.status(200).json({
        success: true,
        deliveryIds: []
      });
    }

    // Send notifications to all webhooks
    const deliveryPromises = webhooks.map(async (webhook) => {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            ...(webhook.headers || {})
          },
          body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        const [delivery] = await prisma.$queryRaw<[WebhookDelivery]>`
          INSERT INTO webhook_deliveries (
            webhook_id,
            event,
            payload,
            response,
            status,
            retry_count,
            created_at,
            updated_at
          )
          VALUES (
            ${webhook.id},
            ${event},
            ${payload}::jsonb,
            ${responseData}::jsonb,
            ${response.status},
            0,
            NOW(),
            NOW()
          )
          RETURNING id
        `;

        return delivery.id;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        const [delivery] = await prisma.$queryRaw<[WebhookDelivery]>`
          INSERT INTO webhook_deliveries (
            webhook_id,
            event,
            payload,
            error,
            status,
            retry_count,
            next_retry_at,
            created_at,
            updated_at
          )
          VALUES (
            ${webhook.id},
            ${event},
            ${payload}::jsonb,
            ${errorMessage},
            500,
            0,
            NOW() + interval '5 minutes',
            NOW(),
            NOW()
          )
          RETURNING id
        `;

        return delivery.id;
      }
    });

    const deliveryIds = await Promise.all(deliveryPromises);

    return res.status(200).json({
      success: true,
      deliveryIds
    });
  } catch (error) {
    console.error('Webhook notification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
