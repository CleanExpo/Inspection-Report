import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

interface ProductionConfig {
  environment: 'production' | 'staging';
  domain: string;
  sslEnabled: boolean;
  monitoring: {
    retentionDays: number;
    alertEmail: string;
  };
}

class ProductionSetup {
  private config: ProductionConfig;
  private setupLog: string[] = [];

  constructor(config: ProductionConfig) {
    this.config = config;
  }

  async setup(): Promise<void> {
    try {
      console.log('Starting production setup...');

      // Environment setup
      await this.setupEnvironment();

      // Security configuration
      await this.setupSecurity();

      // Monitoring configuration
      await this.setupMonitoring();

      // Backup configuration
      await this.setupBackups();

      // Generate setup report
      await this.generateReport();

      console.log('Production setup completed successfully!');
    } catch (error) {
      console.error('Production setup failed:', error);
      process.exit(1);
    }
  }

  private async setupEnvironment(): Promise<void> {
    this.log('Setting up environment...');

    // Generate production environment file
    const envContent = [
      'NODE_ENV=production',
      `PORT=${this.config.environment === 'production' ? 443 : 8443}`,
      'LOG_LEVEL=info',
      `DOMAIN=${this.config.domain}`,
      `SSL_ENABLED=${this.config.sslEnabled}`,
      `MONITORING_TOKEN=${this.generateToken()}`,
      'MAX_MEMORY=4096',
      'MAX_CPU_PERCENT=80',
      'ENABLE_COMPRESSION=true',
      'RATE_LIMIT_WINDOW=15',
      'RATE_LIMIT_MAX=100',
      'CORS_ORIGIN=*',
      'ENABLE_HTTPS_REDIRECT=true'
    ].join('\n');

    await fs.writeFile('.env.production', envContent);

    // Create necessary directories
    await fs.mkdir('logs', { recursive: true });
    await fs.mkdir('ssl', { recursive: true });
    await fs.mkdir('backups', { recursive: true });

    // Set up log rotation
    const logrotateConfig = [
      '/var/log/monitoring/*.log {',
      '  daily',
      '  rotate 7',
      '  compress',
      '  delaycompress',
      '  missingok',
      '  notifempty',
      '  create 0640 node node',
      '}'
    ].join('\n');

    await fs.writeFile('/etc/logrotate.d/monitoring', logrotateConfig);

    this.log('Environment setup completed');
  }

  private async setupSecurity(): Promise<void> {
    this.log('Configuring security...');

    // Generate SSL certificates if enabled
    if (this.config.sslEnabled) {
      await execAsync(`openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/private.key -out ssl/certificate.crt \
        -subj "/CN=${this.config.domain}"`);

      // Set proper permissions
      await execAsync('chmod 600 ssl/private.key');
      await execAsync('chmod 644 ssl/certificate.crt');
    }

    // Configure security headers
    const securityConfig = {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    await fs.writeFile(
      'security-headers.json',
      JSON.stringify(securityConfig, null, 2)
    );

    // Set up firewall rules
    const firewallRules = [
      'sudo ufw default deny incoming',
      'sudo ufw default allow outgoing',
      'sudo ufw allow ssh',
      `sudo ufw allow ${this.config.environment === 'production' ? 443 : 8443}/tcp`,
      'sudo ufw enable'
    ];

    for (const rule of firewallRules) {
      await execAsync(rule);
    }

    this.log('Security configuration completed');
  }

  private async setupMonitoring(): Promise<void> {
    this.log('Setting up monitoring...');

    // Configure log aggregation
    const logConfig = {
      appenders: {
        app: { type: 'file', filename: 'logs/app.log' },
        error: { type: 'file', filename: 'logs/error.log' },
        performance: { type: 'file', filename: 'logs/performance.log' }
      },
      categories: {
        default: { appenders: ['app'], level: 'info' },
        error: { appenders: ['error'], level: 'error' },
        performance: { appenders: ['performance'], level: 'info' }
      }
    };

    await fs.writeFile(
      'log4js.json',
      JSON.stringify(logConfig, null, 2)
    );

    // Configure alerts
    const alertConfig = {
      email: this.config.monitoring.alertEmail,
      thresholds: {
        cpu: { warning: 70, critical: 85 },
        memory: { warning: 75, critical: 90 },
        disk: { warning: 80, critical: 90 },
        responseTime: { warning: 500, critical: 1000 }
      },
      retentionDays: this.config.monitoring.retentionDays
    };

    await fs.writeFile(
      'alert-config.json',
      JSON.stringify(alertConfig, null, 2)
    );

    this.log('Monitoring setup completed');
  }

  private async setupBackups(): Promise<void> {
    this.log('Configuring backup system...');

    // Create backup script
    const backupScript = [
      '#!/bin/bash',
      '',
      'BACKUP_DIR="/backups"',
      'DATE=$(date +%Y%m%d_%H%M%S)',
      '',
      '# Create backup directory',
      'mkdir -p $BACKUP_DIR',
      '',
      '# Backup configuration files',
      'tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env* *.json ssl/',
      '',
      '# Backup logs',
      'tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/',
      '',
      '# Cleanup old backups (keep last 7 days)',
      'find $BACKUP_DIR -type f -mtime +7 -delete'
    ].join('\n');

    await fs.writeFile('backup.sh', backupScript);
    await execAsync('chmod +x backup.sh');

    // Set up daily cron job
    await execAsync(
      'echo "0 0 * * * $(pwd)/backup.sh" | crontab -'
    );

    this.log('Backup system configured');
  }

  private async generateReport(): Promise<void> {
    const report = [
      '# Production Setup Report',
      '',
      '## Environment',
      `- Type: ${this.config.environment}`,
      `- Domain: ${this.config.domain}`,
      `- SSL Enabled: ${this.config.sslEnabled}`,
      '',
      '## Configuration Files',
      '- .env.production',
      '- security-headers.json',
      '- log4js.json',
      '- alert-config.json',
      '',
      '## Security',
      '- SSL certificates generated',
      '- Security headers configured',
      '- Firewall rules established',
      '',
      '## Monitoring',
      '- Log rotation configured',
      '- Alert system set up',
      '- Performance monitoring enabled',
      '',
      '## Backup System',
      '- Daily backups configured',
      '- 7-day retention policy',
      '',
      '## Setup Log',
      '',
      ...this.setupLog,
      '',
      '## Next Steps',
      '',
      '1. Review all configuration files',
      '2. Test SSL certificate (if enabled)',
      '3. Verify monitoring alerts',
      '4. Test backup system',
      '5. Perform security scan',
      ''
    ].join('\n');

    await fs.writeFile('SETUP_REPORT.md', report);
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.setupLog.push(logMessage);
    console.log(logMessage);
  }
}

// Run if executed directly
if (require.main === module) {
  const config: ProductionConfig = {
    environment: (process.env.ENV || 'staging') as 'production' | 'staging',
    domain: process.env.DOMAIN || 'monitoring.example.com',
    sslEnabled: process.env.SSL_ENABLED === 'true',
    monitoring: {
      retentionDays: parseInt(process.env.RETENTION_DAYS || '30', 10),
      alertEmail: process.env.ALERT_EMAIL || 'alerts@example.com'
    }
  };

  const setup = new ProductionSetup(config);
  setup.setup();
}

export { ProductionSetup };
export type { ProductionConfig };
