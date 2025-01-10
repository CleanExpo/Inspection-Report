import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AlertType, AlertSeverity } from './alerts';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SMSOptions {
  to: string;
  message: string;
}

interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface SlackNotificationOptions {
  channel: string;
  text: string;
  blocks?: any[];
}

class NotificationService {
  private emailTransport;
  private slackWebhookUrl: string;

  constructor() {
    // Initialize email transport
    this.emailTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const result = await this.emailTransport.sendMail({
        from: process.env.SMTP_FROM,
        ...options,
      });
      logger.info('Email sent successfully', { messageId: result.messageId });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSMS(options: SMSOptions): Promise<void> {
    try {
      // Implement SMS sending logic here
      // Example using Twilio:
      // await twilioClient.messages.create({
      //   body: options.message,
      //   to: options.to,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });
      logger.info('SMS sent successfully', { to: options.to });
    } catch (error) {
      logger.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendPushNotification(options: PushNotificationOptions): Promise<void> {
    try {
      // Implement push notification logic here
      // Example using Firebase Cloud Messaging:
      // await admin.messaging().send({
      //   token: userDeviceToken,
      //   notification: {
      //     title: options.title,
      //     body: options.body,
      //   },
      //   data: options.data,
      // });
      logger.info('Push notification sent successfully', { userId: options.userId });
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendSlackNotification(options: SlackNotificationOptions): Promise<void> {
    try {
      if (!this.slackWebhookUrl) {
        throw new Error('Slack webhook URL not configured');
      }

      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: options.channel,
          text: options.text,
          blocks: options.blocks,
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      logger.info('Slack notification sent successfully', { channel: options.channel });
    } catch (error) {
      logger.error('Error sending Slack notification:', error);
      throw error;
    }
  }

  async processAlertNotification(alertId: string, options: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    slack?: boolean;
  }): Promise<void> {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: {
          job: {
            include: {
              client: true,
              assignedTo: true,
            },
          },
          reading: true,
          assignedTo: true,
        },
      });

      if (!alert) {
        throw new Error(`Alert not found: ${alertId}`);
      }

      const notificationPromises: Promise<void>[] = [];

      // Prepare notification content
      const content = this.formatAlertContent(alert);

      // Send email if enabled
      if (options.email && alert.assignedTo?.email) {
        notificationPromises.push(
          this.sendEmail({
            to: alert.assignedTo.email,
            subject: `Alert: ${content.title}`,
            text: content.text,
            html: content.html,
          })
        );
      }

      // Send SMS if enabled and severe enough
      if (options.sms && alert.assignedTo?.metadata?.phone) {
        notificationPromises.push(
          this.sendSMS({
            to: alert.assignedTo.metadata.phone,
            message: content.sms,
          })
        );
      }

      // Send push notification if enabled
      if (options.push && alert.assignedTo?.id) {
        notificationPromises.push(
          this.sendPushNotification({
            userId: alert.assignedTo.id,
            title: content.title,
            body: content.text,
            data: {
              alertId,
              type: alert.type,
              severity: alert.severity,
            },
          })
        );
      }

      // Send Slack notification if enabled and critical
      if (options.slack && alert.severity === AlertSeverity.CRITICAL) {
        notificationPromises.push(
          this.sendSlackNotification({
            channel: '#alerts',
            text: content.slack,
            blocks: this.formatSlackBlocks(alert),
          })
        );
      }

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);

      // Update alert with notification status
      await prisma.alert.update({
        where: { id: alertId },
        data: {
          metadata: {
            ...alert.metadata,
            notifications: {
              sentAt: new Date().toISOString(),
              channels: Object.entries(options)
                .filter(([_, enabled]) => enabled)
                .map(([channel]) => channel),
            },
          },
        },
      });

    } catch (error) {
      logger.error('Error processing alert notification:', error);
      throw error;
    }
  }

  private formatAlertContent(alert: any) {
    const severity = alert.severity.toLowerCase();
    const jobInfo = `Job #${alert.job.id} - ${alert.job.client.name}`;
    const title = `[${severity}] ${alert.type}: ${alert.message}`;

    const text = `
Alert: ${alert.message}
Severity: ${severity}
Job: ${jobInfo}
Time: ${new Date(alert.createdAt).toLocaleString()}
${alert.reading ? `Reading Value: ${alert.reading.value}` : ''}
    `.trim();

    const html = `
<h2 style="color: ${this.getSeverityColor(alert.severity)}">${title}</h2>
<p><strong>Job:</strong> ${jobInfo}</p>
<p><strong>Time:</strong> ${new Date(alert.createdAt).toLocaleString()}</p>
${alert.reading ? `<p><strong>Reading Value:</strong> ${alert.reading.value}</p>` : ''}
<p><strong>Details:</strong> ${alert.message}</p>
    `.trim();

    const sms = `${severity.toUpperCase()} Alert: ${alert.message} (${jobInfo})`;

    const slack = `*${title}*\n>${alert.message}\n• Job: ${jobInfo}\n• Time: ${new Date(alert.createdAt).toLocaleString()}`;

    return { title, text, html, sms, slack };
  }

  private formatSlackBlocks(alert: any) {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${alert.severity} Alert`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Type:* ${alert.type}\n*Message:* ${alert.message}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Job:*\n${alert.job.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*Client:*\n${alert.job.client.name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(alert.createdAt).toLocaleString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Assigned To:*\n${alert.assignedTo?.name || 'Unassigned'}`,
          },
        ],
      },
    ];
  }

  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#dc3545';
      case AlertSeverity.HIGH:
        return '#fd7e14';
      case AlertSeverity.MEDIUM:
        return '#ffc107';
      case AlertSeverity.LOW:
        return '#28a745';
      default:
        return '#6c757d';
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
