import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface HealthCheckConfig {
  endpoints: string[];
  interval: number;
  timeout: number;
  retries: number;
}

interface MaintenanceSchedule {
  backups: string;
  updates: string;
  cleanup: string;
  healthChecks: string;
}

interface MonitoringMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

class PostReleaseMonitor {
  private healthConfig: HealthCheckConfig;
  private schedule: MaintenanceSchedule;
  private metricsLog: MonitoringMetrics[] = [];
  private alertCount: number = 0;

  constructor(
    healthConfig: HealthCheckConfig,
    schedule: MaintenanceSchedule
  ) {
    this.healthConfig = healthConfig;
    this.schedule = schedule;
  }

  async start(): Promise<void> {
    try {
      console.log('Starting post-release monitoring...');

      // Set up maintenance schedule
      await this.setupMaintenanceSchedule();

      // Start health checks
      await this.startHealthChecks();

      // Configure analytics
      await this.setupAnalytics();

      // Generate initial report
      await this.generateReport();

      console.log('Post-release monitoring started successfully!');
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      process.exit(1);
    }
  }

  private async setupMaintenanceSchedule(): Promise<void> {
    console.log('Setting up maintenance schedule...');

    const cronJobs = [
      `${this.schedule.backups} /usr/local/bin/backup.sh`,
      `${this.schedule.updates} /usr/local/bin/update-check.sh`,
      `${this.schedule.cleanup} /usr/local/bin/cleanup.sh`,
      `${this.schedule.healthChecks} /usr/local/bin/health-check.sh`
    ];

    // Create maintenance scripts
    await this.createMaintenanceScripts();

    // Set up cron jobs
    const cronContent = cronJobs.join('\n') + '\n';
    await fs.writeFile('maintenance-cron', cronContent);
    await execAsync('crontab maintenance-cron');

    console.log('Maintenance schedule configured');
  }

  private async createMaintenanceScripts(): Promise<void> {
    // Update check script
    const updateScript = [
      '#!/bin/bash',
      '',
      'echo "Checking for updates..."',
      'npm outdated',
      'npm audit',
      '',
      'if [ $? -eq 0 ]; then',
      '  echo "No security updates required"',
      'else',
      '  echo "Security updates available" | mail -s "Security Update Required" admin@example.com',
      'fi'
    ].join('\n');

    // Cleanup script
    const cleanupScript = [
      '#!/bin/bash',
      '',
      'echo "Running system cleanup..."',
      '',
      '# Cleanup old logs',
      'find /var/log/monitoring -type f -mtime +30 -delete',
      '',
      '# Cleanup temporary files',
      'find /tmp -type f -mtime +7 -delete',
      '',
      '# Cleanup old backups',
      'find /backups -type f -mtime +90 -delete'
    ].join('\n');

    // Health check script
    const healthScript = [
      '#!/bin/bash',
      '',
      'echo "Running health checks..."',
      '',
      'check_endpoint() {',
      '  response=$(curl -s -w "%{http_code}" "$1" -o /dev/null)',
      '  if [ "$response" != "200" ]; then',
      '    echo "Endpoint $1 returned $response" | mail -s "Health Check Failed" admin@example.com',
      '  fi',
      '}',
      '',
      'for endpoint in "${ENDPOINTS[@]}"; do',
      '  check_endpoint "$endpoint"',
      'done'
    ].join('\n');

    await fs.writeFile('/usr/local/bin/update-check.sh', updateScript);
    await fs.writeFile('/usr/local/bin/cleanup.sh', cleanupScript);
    await fs.writeFile('/usr/local/bin/health-check.sh', healthScript);

    await execAsync('chmod +x /usr/local/bin/update-check.sh');
    await execAsync('chmod +x /usr/local/bin/cleanup.sh');
    await execAsync('chmod +x /usr/local/bin/health-check.sh');
  }

  private async startHealthChecks(): Promise<void> {
    console.log('Starting health checks...');

    // Start periodic health checks
    setInterval(async () => {
      const metrics = await this.checkHealth();
      this.metricsLog.push(metrics);

      // Keep only last 24 hours of metrics
      if (this.metricsLog.length > 24 * 60) {
        this.metricsLog.shift();
      }

      // Check for alerts
      this.checkAlerts(metrics);
    }, this.healthConfig.interval);

    console.log('Health checks started');
  }

  private async checkHealth(): Promise<MonitoringMetrics> {
    const metrics: MonitoringMetrics = {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        disk: 0
      }
    };

    // Check endpoints
    for (const endpoint of this.healthConfig.endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint);
        metrics.responseTime += Date.now() - startTime;

        if (!response.ok) {
          metrics.errorRate++;
        }
      } catch (error) {
        metrics.errorRate++;
      }
    }

    // Calculate averages
    metrics.responseTime /= this.healthConfig.endpoints.length;
    metrics.errorRate /= this.healthConfig.endpoints.length;

    // Get resource usage
    const { stdout: cpuUsage } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\'');
    const { stdout: memUsage } = await execAsync('free | grep Mem | awk \'{print $3/$2 * 100}\'');
    const { stdout: diskUsage } = await execAsync('df / | tail -1 | awk \'{print $5}\' | cut -d\'%\' -f1');

    metrics.resourceUsage = {
      cpu: parseFloat(cpuUsage),
      memory: parseFloat(memUsage),
      disk: parseFloat(diskUsage)
    };

    return metrics;
  }

  private checkAlerts(metrics: MonitoringMetrics): void {
    const alerts: string[] = [];

    // Check response time
    if (metrics.responseTime > 1000) {
      alerts.push(`High response time: ${metrics.responseTime}ms`);
    }

    // Check error rate
    if (metrics.errorRate > 0.1) {
      alerts.push(`High error rate: ${metrics.errorRate * 100}%`);
    }

    // Check resource usage
    if (metrics.resourceUsage.cpu > 80) {
      alerts.push(`High CPU usage: ${metrics.resourceUsage.cpu}%`);
    }
    if (metrics.resourceUsage.memory > 80) {
      alerts.push(`High memory usage: ${metrics.resourceUsage.memory}%`);
    }
    if (metrics.resourceUsage.disk > 80) {
      alerts.push(`High disk usage: ${metrics.resourceUsage.disk}%`);
    }

    // Send alerts if any
    if (alerts.length > 0) {
      this.sendAlerts(alerts);
    }
  }

  private async sendAlerts(alerts: string[]): Promise<void> {
    this.alertCount++;
    const alertMessage = alerts.join('\n');
    
    // Log alert
    await fs.appendFile(
      'alerts.log',
      `[${new Date().toISOString()}]\n${alertMessage}\n\n`
    );

    // TODO: Implement actual alert sending (email, Slack, etc.)
    console.log('ALERT:', alertMessage);
  }

  private async setupAnalytics(): Promise<void> {
    console.log('Setting up analytics...');

    // Create analytics directory
    await fs.mkdir('analytics', { recursive: true });

    // Set up daily analytics job
    setInterval(async () => {
      await this.generateAnalytics();
    }, 24 * 60 * 60 * 1000);

    console.log('Analytics configured');
  }

  private async generateAnalytics(): Promise<void> {
    const analytics = {
      date: new Date().toISOString(),
      metrics: {
        averageResponseTime: this.calculateAverageMetric('responseTime'),
        averageErrorRate: this.calculateAverageMetric('errorRate'),
        resourceUsage: {
          averageCpu: this.calculateAverageResourceMetric('cpu'),
          averageMemory: this.calculateAverageResourceMetric('memory'),
          averageDisk: this.calculateAverageResourceMetric('disk')
        }
      },
      alerts: this.alertCount,
      uptime: process.uptime()
    };

    await fs.writeFile(
      `analytics/daily-${new Date().toISOString().split('T')[0]}.json`,
      JSON.stringify(analytics, null, 2)
    );

    // Reset alert count
    this.alertCount = 0;
  }

  private calculateAverageMetric(metric: 'responseTime' | 'errorRate' | 'uptime'): number {
    return this.metricsLog.reduce((sum, m) => sum + (m[metric] as number), 0) / this.metricsLog.length;
  }

  private calculateAverageResourceMetric(metric: keyof MonitoringMetrics['resourceUsage']): number {
    return this.metricsLog.reduce((sum, m) => sum + m.resourceUsage[metric], 0) / this.metricsLog.length;
  }

  private async generateReport(): Promise<void> {
    const report = [
      '# Post-Release Monitoring Report',
      '',
      '## System Status',
      '- Uptime: ' + process.uptime() + ' seconds',
      '- Alert Count: ' + this.alertCount,
      '',
      '## Maintenance Schedule',
      '- Backups: ' + this.schedule.backups,
      '- Updates: ' + this.schedule.updates,
      '- Cleanup: ' + this.schedule.cleanup,
      '- Health Checks: ' + this.schedule.healthChecks,
      '',
      '## Monitored Endpoints',
      ...this.healthConfig.endpoints.map(e => `- ${e}`),
      '',
      '## Next Steps',
      '1. Monitor system metrics',
      '2. Review daily analytics',
      '3. Adjust alert thresholds if needed',
      '4. Update maintenance schedule if required'
    ].join('\n');

    await fs.writeFile('POST_RELEASE_REPORT.md', report);
  }
}

// Run if executed directly
if (require.main === module) {
  const healthConfig: HealthCheckConfig = {
    endpoints: [
      'http://localhost:3001/health',
      'http://localhost:3001/metrics'
    ],
    interval: 60000, // 1 minute
    timeout: 5000,   // 5 seconds
    retries: 3
  };

  const schedule: MaintenanceSchedule = {
    backups: '0 0 * * *',     // Daily at midnight
    updates: '0 1 * * 0',     // Weekly on Sunday at 1 AM
    cleanup: '0 2 * * 0',     // Weekly on Sunday at 2 AM
    healthChecks: '*/5 * * * *' // Every 5 minutes
  };

  const monitor = new PostReleaseMonitor(healthConfig, schedule);
  monitor.start();
}

export { PostReleaseMonitor };
export type { HealthCheckConfig, MaintenanceSchedule, MonitoringMetrics };
