import { AlertNotifier, Alert } from '../alert-manager';
import * as nodemailer from 'nodemailer';

interface EmailNotifierConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subjectPrefix?: string;
  templateVars?: Record<string, string>;
  severityEmails?: {
    [severity: string]: {
      to?: string[];
      cc?: string[];
      bcc?: string[];
    };
  };
}

class EmailNotifier implements AlertNotifier {
  readonly name = 'email';
  private config: EmailNotifierConfig;
  private transporter: nodemailer.Transporter;

  constructor(config: EmailNotifierConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport(config.smtp);
  }

  async notify(alert: Alert): Promise<void> {
    const { subject, html, text } = this.formatMessage(alert);
    const recipients = this.getRecipients(alert.rule.severity);

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: recipients.to,
        cc: recipients.cc,
        bcc: recipients.bcc,
        subject,
        html,
        text,
      });
    } catch (error) {
      throw new Error(`Failed to send email notification: ${error}`);
    }
  }

  private formatMessage(alert: Alert): { subject: string; html: string; text: string } {
    const status = alert.status === 'firing' ? 'FIRING' : 'RESOLVED';
    const subject = this.formatSubject(alert, status);
    const { html, text } = this.formatBody(alert, status);

    return { subject, html, text };
  }

  private formatSubject(alert: Alert, status: string): string {
    const prefix = this.config.subjectPrefix || '[ALERT]';
    const severity = alert.rule.severity.toUpperCase();
    return `${prefix} ${severity} - ${status} - ${alert.rule.name}`;
  }

  private formatBody(alert: Alert, status: string): { html: string; text: string } {
    const vars = {
      alertName: alert.rule.name,
      status,
      severity: alert.rule.severity.toUpperCase(),
      value: alert.value.toString(),
      threshold: `${alert.rule.condition.operator} ${alert.rule.condition.value}`,
      startTime: new Date(alert.startTime).toLocaleString(),
      endTime: alert.endTime ? new Date(alert.endTime).toLocaleString() : 'N/A',
      duration: alert.endTime 
        ? this.formatDuration(Math.floor((alert.endTime - alert.startTime) / 1000))
        : 'N/A',
      description: alert.rule.description || 'No description provided',
      runbook: alert.rule.runbook || 'No runbook available',
      labels: Object.entries(alert.labels)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
      ...this.config.templateVars,
    };

    return {
      html: this.formatHtmlBody(vars),
      text: this.formatTextBody(vars),
    };
  }

  private formatHtmlBody(vars: Record<string, string>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { margin-bottom: 20px; }
            .alert-status { 
              font-size: 24px; 
              font-weight: bold; 
              color: ${vars.status === 'FIRING' ? '#dc3545' : '#28a745'};
            }
            .alert-severity {
              font-size: 18px;
              font-weight: bold;
              color: ${this.getSeverityColor(vars.severity)};
            }
            .section { margin: 15px 0; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .label { display: inline-block; background: #f8f9fa; padding: 2px 6px; margin: 2px; border-radius: 3px; }
            .runbook { margin-top: 20px; }
            .runbook a { color: #007bff; text-decoration: none; }
            .runbook a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="alert-status">${vars.status}</div>
            <div class="alert-severity">${vars.severity}</div>
          </div>

          <div class="section">
            <div class="section-title">Alert</div>
            <div>${vars.alertName}</div>
          </div>

          <div class="section">
            <div class="section-title">Description</div>
            <div>${vars.description}</div>
          </div>

          <div class="section">
            <div class="section-title">Details</div>
            <div>Value: ${vars.value}</div>
            <div>Threshold: ${vars.threshold}</div>
            <div>Start Time: ${vars.startTime}</div>
            <div>End Time: ${vars.endTime}</div>
            <div>Duration: ${vars.duration}</div>
          </div>

          <div class="section">
            <div class="section-title">Labels</div>
            <div>
              ${vars.labels.split('\n').map(label => 
                `<span class="label">${label}</span>`
              ).join(' ')}
            </div>
          </div>

          <div class="runbook">
            <div class="section-title">Runbook</div>
            <a href="${vars.runbook}">${vars.runbook}</a>
          </div>
        </body>
      </html>
    `;
  }

  private formatTextBody(vars: Record<string, string>): string {
    return `
Alert: ${vars.alertName}
Status: ${vars.status}
Severity: ${vars.severity}

Description:
${vars.description}

Details:
- Value: ${vars.value}
- Threshold: ${vars.threshold}
- Start Time: ${vars.startTime}
- End Time: ${vars.endTime}
- Duration: ${vars.duration}

Labels:
${vars.labels}

Runbook:
${vars.runbook}
    `.trim();
  }

  private getRecipients(severity: string): {
    to: string[];
    cc?: string[];
    bcc?: string[];
  } {
    const severityConfig = this.config.severityEmails?.[severity];

    return {
      to: severityConfig?.to || this.config.to,
      cc: severityConfig?.cc || this.config.cc,
      bcc: severityConfig?.bcc || this.config.bcc,
    };
  }

  private getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#dc3545';  // Red
      case 'error':
        return '#fd7e14';  // Orange
      case 'warning':
        return '#ffc107';  // Yellow
      case 'info':
        return '#28a745';  // Green
      default:
        return '#6c757d';  // Gray
    }
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

export { EmailNotifier };
export type { EmailNotifierConfig };
