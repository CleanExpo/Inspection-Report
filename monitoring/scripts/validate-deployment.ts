import { 
  MonitoringSystem,
  metricsCollector,
  performanceOptimizer,
  resourceManager,
  cacheManager,
  loadBalancer
} from '../services/index';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  passed: boolean;
  stage: string;
  details?: string;
  error?: Error;
}

class DeploymentValidator {
  private results: ValidationResult[] = [];
  private monitoring: MonitoringSystem;

  constructor() {
    this.monitoring = new MonitoringSystem({
      port: 3001,
      enableDashboard: true,
      logLevel: 'info'
    });
  }

  async validateAll(): Promise<ValidationResult[]> {
    try {
      await this.validateEnvironment();
      await this.validateSecurity();
      await this.validateConfiguration();
      await this.validateComponents();
      await this.validatePerformance();
      await this.validateMonitoring();
    } catch (error) {
      console.error('Validation failed:', error);
    }

    return this.results;
  }

  private async validateEnvironment(): Promise<void> {
    try {
      // Check Node.js version
      const { stdout: nodeVersion } = await execAsync('node -v');
      const version = parseFloat(nodeVersion.slice(1));
      if (version < 14) {
        throw new Error('Node.js version must be >= 14.x');
      }

      // Check required environment variables
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'LOG_LEVEL',
        'MONITORING_TOKEN'
      ];

      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Missing required environment variable: ${varName}`);
        }
      }

      // Check port availability
      try {
        await execAsync('lsof -i:3001');
        throw new Error('Port 3001 is already in use');
      } catch (error) {
        // Port is available if lsof fails
      }

      this.results.push({
        passed: true,
        stage: 'Environment',
        details: 'All environment checks passed'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Environment',
        error: error as Error
      });
    }
  }

  private async validateSecurity(): Promise<void> {
    try {
      // Check SSL certificates
      const sslPath = path.join(process.cwd(), 'ssl');
      await Promise.all([
        fs.access(path.join(sslPath, 'cert.pem')),
        fs.access(path.join(sslPath, 'key.pem'))
      ]);

      // Check file permissions
      const { mode } = await fs.stat(path.join(sslPath, 'key.pem'));
      if ((mode & 0o777) !== 0o600) {
        throw new Error('Invalid SSL key permissions');
      }

      // Verify .env file
      await fs.access('.env');

      this.results.push({
        passed: true,
        stage: 'Security',
        details: 'All security checks passed'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Security',
        error: error as Error
      });
    }
  }

  private async validateConfiguration(): Promise<void> {
    try {
      // Check performance profiles
      const optimizerState = performanceOptimizer.getState();
      if (!optimizerState.currentProfile) {
        throw new Error('Performance profiles not configured');
      }

      // Check resource limits
      const resourceState = resourceManager.getState();
      if (!resourceState.limits) {
        throw new Error('Resource limits not configured');
      }

      // Check cache configuration
      const cacheStats = cacheManager.getStats();
      if (cacheStats.size === 0) {
        throw new Error('Cache not configured');
      }

      // Check load balancer configuration
      const lbStatus = loadBalancer.getStatus();
      if (lbStatus.activeNodes === 0) {
        throw new Error('No active load balancer nodes');
      }

      this.results.push({
        passed: true,
        stage: 'Configuration',
        details: 'All configuration checks passed'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Configuration',
        error: error as Error
      });
    }
  }

  private async validateComponents(): Promise<void> {
    try {
      const components = [
        'metrics-collector',
        'performance-optimizer',
        'resource-manager',
        'cache-manager',
        'load-balancer'
      ];

      for (const component of components) {
        const status = await this.monitoring.getComponentStatus(component);
        if (!status.operational) {
          throw new Error(`Component ${component} not operational`);
        }
      }

      this.results.push({
        passed: true,
        stage: 'Components',
        details: 'All components operational'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Components',
        error: error as Error
      });
    }
  }

  private async validatePerformance(): Promise<void> {
    try {
      // Run optimization cycle
      await performanceOptimizer.optimize();
      
      // Check performance scores
      const state = performanceOptimizer.getState();
      if (state.performanceScore < 0.8) {
        throw new Error('Performance below threshold');
      }

      if (state.stabilityScore < 0.8) {
        throw new Error('Stability below threshold');
      }

      // Test metrics collection
      metricsCollector.recordMetric('test', 1);
      const stats = metricsCollector.getCurrentStats();
      if (!stats.test) {
        throw new Error('Metrics collection failed');
      }

      this.results.push({
        passed: true,
        stage: 'Performance',
        details: 'Performance validation passed'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Performance',
        error: error as Error
      });
    }
  }

  private async validateMonitoring(): Promise<void> {
    try {
      // Check WebSocket server
      const wsCheck = await new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onopen = () => {
          ws.close();
          resolve(true);
        };
        ws.onerror = reject;
      });

      if (!wsCheck) {
        throw new Error('WebSocket server not responding');
      }

      // Check metrics endpoint
      const response = await fetch('http://localhost:3001/metrics');
      if (!response.ok) {
        throw new Error('Metrics endpoint not responding');
      }

      this.results.push({
        passed: true,
        stage: 'Monitoring',
        details: 'Monitoring validation passed'
      });
    } catch (error) {
      this.results.push({
        passed: false,
        stage: 'Monitoring',
        error: error as Error
      });
    }
  }

  printResults(): void {
    console.log('\nDeployment Validation Results:');
    console.log('==============================\n');

    for (const result of this.results) {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} - ${result.stage}`);
      
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error.message}`);
      }
      
      console.log('');
    }

    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log(`❌ Validation failed with ${failed.length} errors`);
      process.exit(1);
    } else {
      console.log('✅ All validations passed successfully');
    }
  }
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.validateAll().then(() => {
    validator.printResults();
  });
}

export { DeploymentValidator };
export type { ValidationResult };
