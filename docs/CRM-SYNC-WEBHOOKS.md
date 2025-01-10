# CRM Sync Status and Webhooks

This document describes the CRM synchronization status tracking system and webhook notification functionality.

## CRM Sync Status

The system tracks the synchronization status of clients with external CRM systems. Each client can have one of the following sync statuses:

- `SYNCED`: Client data is synchronized with the CRM
- `PENDING`: Synchronization is in progress
- `FAILED`: Last synchronization attempt failed
- `NEEDS_UPDATE`: Client data needs to be synchronized

### API Endpoints

#### GET `/api/crm/sync-status`

Returns the current sync status statistics.

```typescript
interface SyncStatusResponse {
  totalClients: number;
  syncedClients: number;
  pendingClients: number;
  failedClients: number;
  needsUpdateClients: number;
  lastSyncTime?: Date | null;
}
```

#### POST `/api/crm/update-sync-status`

Updates a client's sync status.

```typescript
interface UpdateSyncStatusRequest {
  clientId: string;  // UUID
  status: 'SYNCED' | 'PENDING' | 'FAILED' | 'NEEDS_UPDATE';
}

interface UpdateSyncStatusResponse {
  success: boolean;
  error?: string;
  details?: Record<string, string>;
}
```

## Webhooks

The system supports webhook notifications for various events. Webhooks are delivered with retry support and signature verification.

### Events

- `client.created`: Triggered when a new client is created
- `client.updated`: Triggered when client information is updated
- `client.deleted`: Triggered when a client is deleted
- `sync.status.changed`: Triggered when a client's sync status changes

### API Endpoints

#### POST `/api/webhooks/notify`

Sends notifications to registered webhooks.

```typescript
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: unknown;
}

interface WebhookNotifyResponse {
  success: boolean;
  deliveryIds?: string[];
  error?: string;
}
```

#### POST `/api/webhooks/retry`

Retries failed webhook deliveries.

```typescript
interface WebhookRetryResponse {
  success: boolean;
  retriedCount?: number;
  error?: string;
}
```

### Webhook Security

Webhooks are secured using HMAC signatures. Each webhook request includes:

- `X-Webhook-Signature`: HMAC SHA-256 signature of the payload
- `X-Webhook-Retry`: (Optional) Retry attempt number

### Example Usage

```typescript
import { sendWebhookNotification } from '../lib/webhooks';

// Send a webhook notification
await sendWebhookNotification('sync.status.changed', {
  clientId: 'client-uuid',
  oldStatus: 'PENDING',
  newStatus: 'SYNCED',
  timestamp: new Date().toISOString()
});

// Retry failed deliveries
import { retryFailedWebhooks } from '../lib/webhooks';
const retriedCount = await retryFailedWebhooks();
```

### Webhook Configuration

Webhooks are configured in the database with the following information:

- URL: The endpoint to send notifications to
- Secret: Used for signing payloads
- Events: Array of events to subscribe to
- Headers: Optional custom headers to include
- Active status: Whether the webhook is active
- Retry configuration: Maximum retry attempts and timeout

### Error Handling

Failed webhook deliveries are automatically retried with exponential backoff:
- First retry: 5 minutes
- Second retry: 10 minutes
- Third retry: 15 minutes

After 3 failed attempts, the webhook delivery is marked as permanently failed.

### Monitoring

Use the webhook utilities to monitor delivery status:

```typescript
import { getWebhookStats, getWebhookDeliveryStatus } from '../lib/webhooks';

// Get overall webhook statistics
const stats = await getWebhookStats();

// Check specific delivery status
const status = await getWebhookDeliveryStatus('delivery-uuid');
```

## Development

### Testing

Run the test suite:

```bash
npm test -- --testPathPattern=webhooks
```

### Adding New Events

1. Add the event type to `WebhookEvent` in `lib/webhooks.ts`
2. Update the validation middleware if needed
3. Add test cases for the new event
4. Document the new event in this README

### Best Practices

1. Always validate webhook URLs and secrets
2. Use TypeScript for type safety
3. Handle webhook delivery failures gracefully
4. Monitor webhook delivery success rates
5. Implement proper error handling and logging
6. Use the validation middleware for input validation
7. Keep webhook payloads concise and well-structured
