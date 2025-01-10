import { validateConfig, ValidationResult } from '../scripts/validate-config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

describe('Configuration Validation', () => {
  const testEnvPath = resolve(process.cwd(), '.env.test');
  
  beforeEach(() => {
    // Set up minimal required process.env
    process.env = {
      NODE_ENV: 'test',
      PATH: process.env.PATH
    };
  });

  afterEach(() => {
    // Clean up test env file if it exists
    if (existsSync(testEnvPath)) {
      unlinkSync(testEnvPath);
    }
  });

  const createTestEnv = (content: string) => {
    writeFileSync(testEnvPath, content);
    config({ path: testEnvPath });
  };

  describe('Required Variables', () => {
    test('should fail when WebSocket URL is missing', () => {
      createTestEnv(`
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
      `);

      const result = validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        variable: 'NEXT_PUBLIC_WS_URL',
        severity: 'error'
      }));
    });

    test('should fail when monitoring port is invalid', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=invalid
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
      `);

      const result = validateConfig();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        variable: 'MONITORING_PORT',
        severity: 'error'
      }));
    });
  });

  describe('Security Variables', () => {
    test('should warn when JWT secret is too short', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=short
        API_KEY=very-secure-api-key-that-is-long-enough
      `);

      const result = validateConfig();
      expect(result.warnings).toContainEqual(expect.objectContaining({
        variable: 'JWT_SECRET',
        severity: 'warning'
      }));
    });

    test('should warn when API key is too short', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=short
      `);

      const result = validateConfig();
      expect(result.warnings).toContainEqual(expect.objectContaining({
        variable: 'API_KEY',
        severity: 'warning'
      }));
    });
  });

  describe('Notification Configuration', () => {
    test('should validate email configuration when enabled', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
        EMAIL_NOTIFICATIONS_ENABLED=true
      `);

      const result = validateConfig();
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ variable: 'SMTP_HOST' }),
          expect.objectContaining({ variable: 'SMTP_PORT' }),
          expect.objectContaining({ variable: 'SMTP_USER' }),
          expect.objectContaining({ variable: 'SMTP_PASS' }),
          expect.objectContaining({ variable: 'NOTIFICATION_EMAIL_FROM' }),
          expect.objectContaining({ variable: 'NOTIFICATION_EMAIL_TO' })
        ])
      );
    });

    test('should validate Slack configuration when enabled', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
        SLACK_NOTIFICATIONS_ENABLED=true
      `);

      const result = validateConfig();
      expect(result.errors).toContainEqual(expect.objectContaining({
        variable: 'SLACK_WEBHOOK_URL',
        severity: 'error'
      }));
    });

    test('should warn about webhook secret when webhook notifications enabled', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
        WEBHOOK_NOTIFICATIONS_ENABLED=true
        WEBHOOK_URL=https://example.com/webhook
      `);

      const result = validateConfig();
      expect(result.warnings).toContainEqual(expect.objectContaining({
        variable: 'WEBHOOK_SECRET',
        severity: 'warning'
      }));
    });
  });

  describe('Valid Configuration', () => {
    test('should pass with minimal valid configuration', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
      `);

      const result = validateConfig();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass with full valid configuration', () => {
      createTestEnv(`
        NEXT_PUBLIC_WS_URL=ws://localhost:3002
        MONITORING_PORT=3002
        JWT_SECRET=very-secure-secret-key-that-is-long-enough
        API_KEY=very-secure-api-key-that-is-long-enough
        METRICS_RETENTION_DAYS=30
        METRICS_COLLECTION_INTERVAL=60
        MEMORY_THRESHOLD=80
        CPU_THRESHOLD=70
        DISK_THRESHOLD=85
        EMAIL_NOTIFICATIONS_ENABLED=true
        SMTP_HOST=smtp.example.com
        SMTP_PORT=587
        SMTP_USER=user@example.com
        SMTP_PASS=password
        NOTIFICATION_EMAIL_FROM=monitoring@example.com
        NOTIFICATION_EMAIL_TO=admin@example.com
        SLACK_NOTIFICATIONS_ENABLED=true
        SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
        WEBHOOK_NOTIFICATIONS_ENABLED=true
        WEBHOOK_URL=https://example.com/webhook
        WEBHOOK_SECRET=secure-webhook-secret
      `);

      const result = validateConfig();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
