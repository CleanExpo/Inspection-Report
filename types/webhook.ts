export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  isActive: boolean;
  secret: string;
  retryCount: number;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
  deliveries?: WebhookDelivery[];
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  webhook: WebhookConfig;
  event: string;
  payload: any;
  response?: any;
  status: number;
  error?: string;
  retryCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  type: string;
  payload: any;
}

export interface WebhookError extends Error {
  status?: number;
  response?: any;
}
