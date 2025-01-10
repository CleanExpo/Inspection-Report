import { AlertNotifier, Alert } from '../alert-manager';

interface SlackNotifierConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  iconUrl?: string;
  mentionUsers?: string[];  // Usernames to @mention for specific severities
  mentionGroups?: string[]; // Groups to @mention for specific severities
  customFields?: {          // Additional fields to include in message
    name: string;
    value: string;
    short?: boolean;
  }[];
}

class SlackNotifier implements AlertNotifier {
  readonly name = 'slack';
  private config: SlackNotifierConfig;

  constructor(config: SlackNotifierConfig) {
    this.config = config;
  }

  async notify(alert: Alert): Promise<void> {
    const message = this.formatMessage(alert);

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to send Slack notification: ${error}`);
    }
  }

  private formatMessage(alert: Alert): any {
    const color = this.getSeverityColor(alert.rule.severity);
    const mentions = this.getMentions(alert.rule.severity);
    const title = this.formatTitle(alert);
    const fields = this.formatFields(alert);

    return {
      channel: this.config.channel,
      username: this.config.username || 'Monitoring Alert',
      icon_emoji: this.config.iconEmoji,
      icon_url: this.config.iconUrl,
      attachments: [
        {
          color,
          title,
          text: this.formatText(alert, mentions),
          fields: [
            ...fields,
            ...this.formatCustomFields(),
          ],
          footer: this.formatFooter(alert),
          ts: Math.floor(alert.startTime / 1000),
        },
      ],
    };
  }

  private formatTitle(alert: Alert): string {
    const emoji = this.getSeverityEmoji(alert.rule.severity);
    const status = alert.status === 'firing' ? 'FIRING' : 'RESOLVED';
    return `${emoji} [${status}] ${alert.rule.name}`;
  }

  private formatText(alert: Alert, mentions: string): string {
    let text = '';

    // Add mentions if any
    if (mentions) {
      text += `${mentions}\n\n`;
    }

    // Add description
    if (alert.rule.description) {
      text += `${alert.rule.description}\n\n`;
    }

    // Add current value
    text += `Current value: ${alert.value}\n`;
    text += `Threshold: ${alert.rule.condition.operator} ${alert.rule.condition.value}\n`;

    // Add labels if any
    if (Object.keys(alert.labels).length > 0) {
      text += '\nLabels:\n';
      for (const [key, value] of Object.entries(alert.labels)) {
        text += `• ${key}: ${value}\n`;
      }
    }

    // Add runbook link if available
    if (alert.rule.runbook) {
      text += `\n📚 <${alert.rule.runbook}|Runbook>\n`;
    }

    return text;
  }

  private formatFields(alert: Alert): Array<{ title: string; value: string; short: boolean }> {
    const fields = [
      {
        title: 'Status',
        value: alert.status.toUpperCase(),
        short: true,
      },
      {
        title: 'Severity',
        value: alert.rule.severity.toUpperCase(),
        short: true,
      },
    ];

    if (alert.status === 'resolved' && alert.endTime) {
      const duration = Math.floor((alert.endTime - alert.startTime) / 1000);
      fields.push({
        title: 'Duration',
        value: this.formatDuration(duration),
        short: true,
      });
    }

    return fields;
  }

  private formatCustomFields(): Array<{ title: string; value: string; short: boolean }> {
    return this.config.customFields?.map(field => ({
      title: field.name,
      value: field.value,
      short: field.short ?? true,
    })) ?? [];
  }

  private formatFooter(alert: Alert): string {
    return `Alert ID: ${alert.id}`;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#FF0000';  // Red
      case 'error':
        return '#FFA500';  // Orange
      case 'warning':
        return '#FFFF00';  // Yellow
      case 'info':
        return '#00FF00';  // Green
      default:
        return '#808080';  // Gray
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'error':
        return '🟠';
      case 'warning':
        return '🟡';
      case 'info':
        return '🟢';
      default:
        return '⚪';
    }
  }

  private getMentions(severity: string): string {
    const mentions: string[] = [];

    if (this.config.mentionUsers) {
      mentions.push(...this.config.mentionUsers.map(user => `@${user}`));
    }

    if (this.config.mentionGroups) {
      mentions.push(...this.config.mentionGroups.map(group => `@${group}`));
    }

    return mentions.length > 0 ? mentions.join(' ') : '';
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  }
}

export { SlackNotifier };
export type { SlackNotifierConfig };
