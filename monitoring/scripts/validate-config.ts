#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

export interface ValidationError {
  variable: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

function validatePort(port: string | undefined): boolean {
  if (!port) return false;
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

function validateUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateThreshold(value: string | undefined): boolean {
  if (!value) return false;
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 100;
}

function validateInterval(value: string | undefined): boolean {
  if (!value) return false;
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0;
}

export function validateConfig(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Load environment variables
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    errors.push({
      variable: '.env',
      message: 'Environment file not found. Please copy .env.example to .env and configure it.',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  config({ path: envPath });

  // Required Variables
  if (!process.env.NEXT_PUBLIC_WS_URL) {
    errors.push({
      variable: 'NEXT_PUBLIC_WS_URL',
      message: 'WebSocket URL is required',
      severity: 'error'
    });
  } else if (!validateUrl(process.env.NEXT_PUBLIC_WS_URL)) {
    errors.push({
      variable: 'NEXT_PUBLIC_WS_URL',
      message: 'Invalid WebSocket URL format',
      severity: 'error'
    });
  }

  if (!validatePort(process.env.MONITORING_PORT)) {
    errors.push({
      variable: 'MONITORING_PORT',
      message: 'Invalid monitoring port number',
      severity: 'error'
    });
  }

  // Metrics Configuration
  if (!validateInterval(process.env.METRICS_RETENTION_DAYS)) {
    warnings.push({
      variable: 'METRICS_RETENTION_DAYS',
      message: 'Invalid metrics retention days, using default: 30',
      severity: 'warning'
    });
  }

  if (!validateInterval(process.env.METRICS_COLLECTION_INTERVAL)) {
    warnings.push({
      variable: 'METRICS_COLLECTION_INTERVAL',
      message: 'Invalid metrics collection interval, using default: 60',
      severity: 'warning'
    });
  }

  // Resource Thresholds
  if (!validateThreshold(process.env.MEMORY_THRESHOLD)) {
    warnings.push({
      variable: 'MEMORY_THRESHOLD',
      message: 'Invalid memory threshold, using default: 80',
      severity: 'warning'
    });
  }

  if (!validateThreshold(process.env.CPU_THRESHOLD)) {
    warnings.push({
      variable: 'CPU_THRESHOLD',
      message: 'Invalid CPU threshold, using default: 70',
      severity: 'warning'
    });
  }

  if (!validateThreshold(process.env.DISK_THRESHOLD)) {
    warnings.push({
      variable: 'DISK_THRESHOLD',
      message: 'Invalid disk threshold, using default: 85',
      severity: 'warning'
    });
  }

  // Notification Configuration
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
    const requiredEmailVars = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'NOTIFICATION_EMAIL_FROM',
      'NOTIFICATION_EMAIL_TO'
    ];

    requiredEmailVars.forEach(variable => {
      if (!process.env[variable]) {
        errors.push({
          variable,
          message: `${variable} is required when email notifications are enabled`,
          severity: 'error'
        });
      }
    });

    if (!validatePort(process.env.SMTP_PORT)) {
      errors.push({
        variable: 'SMTP_PORT',
        message: 'Invalid SMTP port number',
        severity: 'error'
      });
    }
  }

  if (process.env.SLACK_NOTIFICATIONS_ENABLED === 'true') {
    if (!process.env.SLACK_WEBHOOK_URL) {
      errors.push({
        variable: 'SLACK_WEBHOOK_URL',
        message: 'Slack webhook URL is required when Slack notifications are enabled',
        severity: 'error'
      });
    } else if (!validateUrl(process.env.SLACK_WEBHOOK_URL)) {
      errors.push({
        variable: 'SLACK_WEBHOOK_URL',
        message: 'Invalid Slack webhook URL format',
        severity: 'error'
      });
    }
  }

  if (process.env.WEBHOOK_NOTIFICATIONS_ENABLED === 'true') {
    if (!process.env.WEBHOOK_URL) {
      errors.push({
        variable: 'WEBHOOK_URL',
        message: 'Webhook URL is required when webhook notifications are enabled',
        severity: 'error'
      });
    } else if (!validateUrl(process.env.WEBHOOK_URL)) {
      errors.push({
        variable: 'WEBHOOK_URL',
        message: 'Invalid webhook URL format',
        severity: 'error'
      });
    }

    if (!process.env.WEBHOOK_SECRET) {
      warnings.push({
        variable: 'WEBHOOK_SECRET',
        message: 'Webhook secret is recommended for security',
        severity: 'warning'
      });
    }
  }

  // Security
  if (!process.env.JWT_SECRET) {
    errors.push({
      variable: 'JWT_SECRET',
      message: 'JWT secret is required for authentication',
      severity: 'error'
    });
  } else if (process.env.JWT_SECRET.length < 32) {
    warnings.push({
      variable: 'JWT_SECRET',
      message: 'JWT secret should be at least 32 characters long',
      severity: 'warning'
    });
  }

  if (!process.env.API_KEY) {
    errors.push({
      variable: 'API_KEY',
      message: 'API key is required for authentication',
      severity: 'error'
    });
  } else if (process.env.API_KEY.length < 32) {
    warnings.push({
      variable: 'API_KEY',
      message: 'API key should be at least 32 characters long',
      severity: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function printValidationResult(result: ValidationResult): void {
  console.log('\nValidating monitoring configuration...\n');

  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach(error => {
      console.log(`  • ${error.variable}: ${error.message}`);
    });
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => {
      console.log(`  • ${warning.variable}: ${warning.message}`);
    });
    console.log();
  }

  if (result.isValid) {
    console.log('✅ Configuration is valid!\n');
    if (result.warnings.length > 0) {
      console.log('Note: There are some warnings that you may want to address.\n');
    }
  } else {
    console.log('❌ Configuration is invalid. Please fix the errors above.\n');
    process.exit(1);
  }
}

// Run validation if executed directly
if (require.main === module) {
  const result = validateConfig();
  printValidationResult(result);
}
