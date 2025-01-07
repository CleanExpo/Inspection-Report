import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { createHmac } from 'crypto';
import { WebhookConfig, WebhookDelivery, WebhookError } from '../../types/webhook';

type WebhookResponse = {
  webhook?: WebhookConfig;
  webhooks?: WebhookConfig[];
  error?: string;
};

type WebhookRequest = {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  secret: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  try {
    if (req.method === 'POST') {
      const { name, url, events, headers, secret } = req.body as WebhookRequest;

      const webhook = await prisma.webhookConfig.create({
        data: {
          name,
          url,
          events,
          headers: headers || {},
          secret,
          isActive: true,
          retryCount: 3,
          timeout: 5000,
        },
      });

      return res.status(201).json({ webhook });
    }

    if (req.method === 'GET') {
      const webhooks = await prisma.webhookConfig.findMany({
        include: {
          deliveries: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return res.status(200).json({ webhooks });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function sendWebhookEvent(event: string, payload: unknown) {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      where: {
        isActive: true,
        events: {
          has: event,
        },
      },
    });

    const deliveryPromises = webhooks.map(async (webhook: WebhookConfig) => {
      const signature = createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            ...(webhook.headers || {}),
          },
          body: JSON.stringify(payload),
        });

        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as Record<string, unknown>,
            response: await response.json(),
            status: response.status,
            retryCount: 0,
          },
        });

        return response.ok;
      } catch (error: unknown) {
        const webhookError = error as WebhookError;
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as Record<string, unknown>,
            error: webhookError.message,
            status: webhookError.status || 500,
            retryCount: 0,
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
          },
        });

        return false;
      }
    });

    await Promise.all(deliveryPromises);
  } catch (error) {
    console.error('Webhook delivery error:', error);
  }
}
