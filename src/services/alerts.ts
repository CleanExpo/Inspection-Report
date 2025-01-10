import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { jobQueue, JobType } from './queue';

const prisma = new PrismaClient();

// Enums matching Prisma schema
export enum AlertType {
  HIGH_MOISTURE = 'HIGH_MOISTURE',
  EQUIPMENT_MAINTENANCE = 'EQUIPMENT_MAINTENANCE',
  CALIBRATION_DUE = 'CALIBRATION_DUE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

interface CreateAlertOptions {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  jobId: string;
  readingId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

interface NotificationOptions {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  slack?: boolean;
}

interface AlertGroupResult {
  severity: AlertSeverity;
  type: AlertType;
  _count: number;
}

class AlertService {
  async createAlert(options: CreateAlertOptions) {
    try {
      const alert = await prisma.alert.create({
        data: {
          type: options.type,
          severity: options.severity,
          message: options.message,
          jobId: options.jobId,
          readingId: options.readingId,
          assignedToId: options.assignedToId,
          metadata: options.metadata,
        },
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

      // Queue notification job
      await this.queueNotifications(alert);

      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  private async queueNotifications(alert: any) {
    try {
      const notificationOptions = await this.determineNotificationOptions(alert);

      if (Object.values(notificationOptions).some(Boolean)) {
        await jobQueue.addJob({
          type: JobType.PROCESS_NOTIFICATIONS,
          data: {
            alertId: alert.id,
            options: notificationOptions,
          },
          priority: this.getNotificationPriority(alert.severity),
        });
      }
    } catch (error) {
      logger.error('Error queueing notifications:', error);
    }
  }

  private async determineNotificationOptions(alert: any): Promise<NotificationOptions> {
    // Default notification settings based on severity
    const options: NotificationOptions = {
      email: true, // Always send email
      sms: alert.severity === AlertSeverity.HIGH || alert.severity === AlertSeverity.CRITICAL,
      push: alert.severity !== AlertSeverity.LOW,
      slack: alert.severity === AlertSeverity.CRITICAL,
    };

    // Check user preferences if assigned
    if (alert.assignedToId) {
      const userPreferences = await prisma.user.findUnique({
        where: { id: alert.assignedToId },
        select: { metadata: true },
      });

      if (userPreferences?.metadata?.notificationPreferences) {
        return {
          ...options,
          ...userPreferences.metadata.notificationPreferences,
        };
      }
    }

    return options;
  }

  private getNotificationPriority(severity: AlertSeverity): number {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 1; // Highest priority
      case AlertSeverity.HIGH:
        return 2;
      case AlertSeverity.MEDIUM:
        return 3;
      case AlertSeverity.LOW:
        return 4;
      default:
        return 3;
    }
  }

  async updateAlertStatus(alertId: string, status: AlertStatus, userId: string) {
    try {
      const alert = await prisma.alert.update({
        where: { id: alertId },
        data: {
          status,
          metadata: {
            lastUpdatedBy: userId,
            statusUpdatedAt: new Date().toISOString(),
          },
        },
      });

      // Log status change
      logger.info(`Alert ${alertId} status updated to ${status} by user ${userId}`);

      return alert;
    } catch (error) {
      logger.error('Error updating alert status:', error);
      throw error;
    }
  }

  async getActiveAlerts(options?: {
    jobId?: string;
    severity?: AlertSeverity;
    type?: AlertType;
    assignedToId?: string;
  }) {
    try {
      return await prisma.alert.findMany({
        where: {
          status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
          ...options,
        },
        include: {
          job: {
            include: {
              client: true,
            },
          },
          reading: true,
          assignedTo: true,
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    } catch (error) {
      logger.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  async assignAlert(alertId: string, userId: string) {
    try {
      const alert = await prisma.alert.update({
        where: { id: alertId },
        data: {
          assignedToId: userId,
          status: AlertStatus.ACKNOWLEDGED,
        },
      });

      // Queue notification for assignment
      await jobQueue.addJob({
        type: JobType.PROCESS_NOTIFICATIONS,
        data: {
          type: 'ALERT_ASSIGNMENT',
          alertId: alert.id,
          userId,
        },
      });

      return alert;
    } catch (error) {
      logger.error('Error assigning alert:', error);
      throw error;
    }
  }

  async getAlertStats() {
    try {
      const [total, bySeverity, byType, unassigned] = await Promise.all([
        prisma.alert.count({
          where: { status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] } },
        }),
        prisma.alert.groupBy({
          by: ['severity'],
          where: { status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] } },
          _count: true,
        }) as Promise<AlertGroupResult[]>,
        prisma.alert.groupBy({
          by: ['type'],
          where: { status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] } },
          _count: true,
        }) as Promise<AlertGroupResult[]>,
        prisma.alert.count({
          where: {
            status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
            assignedToId: null,
          },
        }),
      ]);

      return {
        total,
        bySeverity: Object.fromEntries(
          bySeverity.map(item => [item.severity, item._count])
        ),
        byType: Object.fromEntries(
          byType.map(item => [item.type, item._count])
        ),
        unassigned,
      };
    } catch (error) {
      logger.error('Error getting alert stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const alertService = new AlertService();
