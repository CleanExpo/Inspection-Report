import { config } from 'dotenv';
import path from 'path';
import { MetricsCollector } from '../monitoring/services/metrics/collector';
import { AlertManager } from '../monitoring/services/metrics/alert-manager';

// Load production environment variables
config({ path: path.resolve(process.cwd(), '.env.production') });

async function setupMetrics() {
  console.log('Setting up metrics collection...\n');

  try {
    const metricsCollector = new MetricsCollector();
    const alertManager = new AlertManager();

    // Configure core metrics
    console.log('Configuring core metrics...');
    metricsCollector.registerMetric({
      name: 'inspection_report_creation',
      type: 'counter',
      description: 'Number of inspection reports created'
    });

    metricsCollector.registerMetric({
      name: 'moisture_reading',
      type: 'gauge',
      description: 'Moisture readings with location data',
      labels: ['room', 'material']
    });

    metricsCollector.registerMetric({
      name: 'equipment_runtime',
      type: 'histogram',
      description: 'Equipment runtime duration',
      labels: ['equipment_type', 'location']
    });

    // Configure performance metrics
    console.log('Setting up performance metrics...');
    metricsCollector.registerMetric({
      name: 'api_response_time',
      type: 'histogram',
      description: 'API endpoint response times',
      labels: ['endpoint', 'method']
    });

    metricsCollector.registerMetric({
      name: 'database_query_time',
      type: 'histogram',
      description: 'Database query execution times',
      labels: ['query_type']
    });

    // Configure alert rules
    console.log('Configuring alert rules...');
    
    // High response time alert
    alertManager.addRule({
      name: 'high_response_time',
      metricName: 'api_response_time',
      condition: {
        type: 'threshold',
        operator: '>',
        value: 500, // 500ms
        duration: 300000 // 5 minutes
      },
      severity: 'warning',
      description: 'API response time is higher than 500ms',
      runbook: 'docs/runbooks/high-response-time.md'
    });

    // Error rate alert
    alertManager.addRule({
      name: 'high_error_rate',
      metricName: 'error_rate',
      condition: {
        type: 'threshold',
        operator: '>',
        value: 0.01, // 1%
        duration: 300000 // 5 minutes
      },
      severity: 'critical',
      description: 'Error rate exceeded 1%',
      runbook: 'docs/runbooks/high-error-rate.md'
    });

    // Equipment runtime alert
    alertManager.addRule({
      name: 'equipment_runtime_exceeded',
      metricName: 'equipment_runtime',
      condition: {
        type: 'threshold',
        operator: '>',
        value: 72, // 72 hours
        duration: 0
      },
      severity: 'warning',
      description: 'Equipment has been running for more than 72 hours',
      runbook: 'docs/runbooks/equipment-runtime.md'
    });

    // Configure resource monitoring
    console.log('Setting up resource monitoring...');
    metricsCollector.registerMetric({
      name: 'memory_usage',
      type: 'gauge',
      description: 'Memory usage percentage'
    });

    metricsCollector.registerMetric({
      name: 'cpu_usage',
      type: 'gauge',
      description: 'CPU usage percentage'
    });

    // Configure business metrics
    console.log('Setting up business metrics...');
    metricsCollector.registerMetric({
      name: 'report_completion_time',
      type: 'histogram',
      description: 'Time taken to complete inspection reports',
      labels: ['report_type']
    });

    metricsCollector.registerMetric({
      name: 'equipment_utilization',
      type: 'gauge',
      description: 'Equipment utilization rate',
      labels: ['equipment_type']
    });

    // Verify setup
    console.log('\nVerifying metrics setup...');
    const registeredMetrics = await metricsCollector.listMetrics();
    console.log(`Registered ${registeredMetrics.length} metrics`);

    const alertRules = await alertManager.listRules();
    console.log(`Configured ${alertRules.length} alert rules`);

    console.log('\n✅ Metrics setup completed successfully!');
    
    // Return setup summary
    return {
      metricsCount: registeredMetrics.length,
      alertRulesCount: alertRules.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error setting up metrics:', error);
    process.exit(1);
  }
}

// Run setup
setupMetrics().then(summary => {
  console.log('\nSetup Summary:', summary);
}).catch(error => {
  console.error('Failed to setup metrics:', error);
  process.exit(1);
});
