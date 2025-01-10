import { AlertNotifier, Alert } from '../../../types';

class EmailNotifier implements AlertNotifier {
  async send(alert: Alert): Promise<void> {
    // Implementation for sending email notifications
    console.log('Sending email notification:', alert);
  }
}

class SlackNotifier implements AlertNotifier {
  async send(alert: Alert): Promise<void> {
    // Implementation for sending Slack notifications
    console.log('Sending Slack notification:', alert);
  }
}

class WebhookNotifier implements AlertNotifier {
  async send(alert: Alert): Promise<void> {
    // Implementation for sending webhook notifications
    console.log('Sending webhook notification:', alert);
  }
}

export async function setupNotifiers(): Promise<AlertNotifier[]> {
  const notifiers: AlertNotifier[] = [];

  // Add email notifier if configured
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
    notifiers.push(new EmailNotifier());
  }

  // Add Slack notifier if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    notifiers.push(new SlackNotifier());
  }

  // Add webhook notifier if configured
  if (process.env.WEBHOOK_URL) {
    notifiers.push(new WebhookNotifier());
  }

  return notifiers;
}

export { EmailNotifier, SlackNotifier, WebhookNotifier };
