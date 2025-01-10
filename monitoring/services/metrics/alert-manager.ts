import { EventEmitter } from 'events';
import { MetricsCollector, MetricPoint } from './collector';

interface AlertRule {
  name: string;
  metricName: string;
  condition: {
    type: 'threshold' | 'change' | 'anomaly';
    operator: '>' | '<' | '==' | '>=' | '<=';
    value: number;
    duration?: number;  // Duration in ms that condition must be true
    changePercent?: number;  // For change-based alerts
  };
  labels?: Record<string, string>;  // For filtering specific metric series
  severity: 'info' | 'warning' | 'error' | 'critical';
  description?: string;
  runbook?: string;  // URL or description of remediation steps
}

interface Alert {
  id: string;
  rule: AlertRule;
  status: 'firing' | 'resolved';
  value: number;
  startTime: number;
  endTime?: number;
  labels: Record<string, string>;
}

interface AlertManagerConfig {
  checkInterval?: number;  // How often to evaluate rules (ms)
  retentionPeriod?: number;  // How long to keep resolved alerts (ms)
  notifiers?: AlertNotifier[];
}

interface AlertNotifier {
  name: string;
  notify(alert: Alert): Promise<void>;
}

class AlertManager extends EventEmitter {
  private rules: Map<string, AlertRule>;
  private activeAlerts: Map<string, Alert>;
  private historicalAlerts: Alert[];
  private metricsCollector: MetricsCollector;
  private checkInterval: NodeJS.Timeout | null;
  private notifiers: AlertNotifier[];
  private config: Required<AlertManagerConfig>;

  constructor(
    metricsCollector: MetricsCollector,
    config: AlertManagerConfig = {}
  ) {
    super();
    this.rules = new Map();
    this.activeAlerts = new Map();
    this.historicalAlerts = [];
    this.metricsCollector = metricsCollector;
    this.notifiers = config.notifiers || [];
    this.checkInterval = null;
    this.config = {
      checkInterval: config.checkInterval || 60000,  // 1 minute
      retentionPeriod: config.retentionPeriod || 7 * 24 * 60 * 60 * 1000,  // 7 days
      notifiers: config.notifiers || []
    };
  }

  addRule(rule: AlertRule): void {
    if (this.rules.has(rule.name)) {
      throw new Error(`Alert rule ${rule.name} already exists`);
    }
    this.rules.set(rule.name, rule);
    this.emit('ruleAdded', rule);
  }

  removeRule(name: string): void {
    const rule = this.rules.get(name);
    if (rule) {
      this.rules.delete(name);
      this.emit('ruleRemoved', rule);
    }
  }

  addNotifier(notifier: AlertNotifier): void {
    this.notifiers.push(notifier);
  }

  start(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(
      () => this.evaluateRules(),
      this.config.checkInterval
    );
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getHistoricalAlerts(options: {
    start?: number;
    end?: number;
    severity?: AlertRule['severity'];
    ruleName?: string;
  } = {}): Alert[] {
    let alerts = this.historicalAlerts;

    if (options.start) {
      alerts = alerts.filter(a => a.startTime >= options.start!);
    }
    if (options.end) {
      alerts = alerts.filter(a => a.startTime <= options.end!);
    }
    if (options.severity) {
      alerts = alerts.filter(a => a.rule.severity === options.severity);
    }
    if (options.ruleName) {
      alerts = alerts.filter(a => a.rule.name === options.ruleName);
    }

    return alerts;
  }

  private async evaluateRules(): Promise<void> {
    for (const rule of Array.from(this.rules.values())) {
      try {
        await this.evaluateRule(rule);
      } catch (error) {
        this.emit('error', {
          operation: 'evaluateRule',
          rule: rule.name,
          error
        });
      }
    }

    // Cleanup old historical alerts
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.historicalAlerts = this.historicalAlerts.filter(
      alert => alert.startTime >= cutoff
    );
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    // Get recent metric points
    const points = this.metricsCollector.getMetric(rule.metricName, {
      start: Date.now() - (rule.condition.duration || 0),
      tags: rule.labels
    });

    if (points.length === 0) return;

    const isViolating = this.checkCondition(points, rule.condition);
    const alertId = this.generateAlertId(rule, points[0].tags);

    if (isViolating) {
      if (!this.activeAlerts.has(alertId)) {
        // New alert
        const alert: Alert = {
          id: alertId,
          rule,
          status: 'firing',
          value: points[points.length - 1].value,
          startTime: Date.now(),
          labels: points[0].tags
        };

        this.activeAlerts.set(alertId, alert);
        this.emit('alertFiring', alert);
        await this.notifyAlert(alert);
      }
    } else {
      const existingAlert = this.activeAlerts.get(alertId);
      if (existingAlert) {
        // Resolve alert
        existingAlert.status = 'resolved';
        existingAlert.endTime = Date.now();
        this.activeAlerts.delete(alertId);
        this.historicalAlerts.push(existingAlert);
        this.emit('alertResolved', existingAlert);
        await this.notifyAlert(existingAlert);
      }
    }
  }

  private checkCondition(points: MetricPoint[], condition: AlertRule['condition']): boolean {
    switch (condition.type) {
      case 'threshold':
        return this.checkThresholdCondition(points, condition);
      case 'change':
        return this.checkChangeCondition(points, condition);
      case 'anomaly':
        return this.checkAnomalyCondition(points, condition);
      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }
  }

  private checkThresholdCondition(
    points: MetricPoint[],
    condition: AlertRule['condition']
  ): boolean {
    const value = points[points.length - 1].value;
    switch (condition.operator) {
      case '>': return value > condition.value;
      case '<': return value < condition.value;
      case '==': return value === condition.value;
      case '>=': return value >= condition.value;
      case '<=': return value <= condition.value;
      default:
        throw new Error(`Unknown operator: ${condition.operator}`);
    }
  }

  private checkChangeCondition(
    points: MetricPoint[],
    condition: AlertRule['condition']
  ): boolean {
    if (points.length < 2) return false;
    
    const oldValue = points[0].value;
    const newValue = points[points.length - 1].value;
    const changePercent = ((newValue - oldValue) / oldValue) * 100;

    return Math.abs(changePercent) >= (condition.changePercent || 0);
  }

  private checkAnomalyCondition(
    points: MetricPoint[],
    condition: AlertRule['condition']
  ): boolean {
    // Simple anomaly detection using z-score
    const values = points.map(p => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    );

    const currentValue = values[values.length - 1];
    const zScore = Math.abs((currentValue - mean) / stdDev);

    return zScore >= condition.value;
  }

  private generateAlertId(rule: AlertRule, labels: Record<string, string>): string {
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');

    return `${rule.name}:${labelString}`;
  }

  private async notifyAlert(alert: Alert): Promise<void> {
    for (const notifier of this.notifiers) {
      try {
        await notifier.notify(alert);
      } catch (error) {
        this.emit('error', {
          operation: 'notify',
          notifier: notifier.name,
          alert: alert.id,
          error
        });
      }
    }
  }
}

export { AlertManager };
export type { AlertRule, Alert, AlertNotifier, AlertManagerConfig };
