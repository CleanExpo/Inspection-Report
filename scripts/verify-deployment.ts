import { config } from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { MetricsCollector } from '../monitoring/services/metrics/collector';
import { AlertManager } from '../monitoring/services/metrics/alert-manager';

// Load production environment variables
config({ path: path.resolve(process.cwd(), '.env.production') });

interface VerificationResult {
  component: string;
  status: 'success' | 'failed';
  message: string;
  metrics?: Record<string, any>;
}

async function verifySystemHealth(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const metricsCollector = new MetricsCollector();

  // Check Error Rates
  const errorMetrics = metricsCollector.getMetric('error_rate', {
    start: Date.now() - 3600000 // Last hour
  });

  results.push({
    component: 'Error Rates',
    status: errorMetrics.length > 0 && errorMetrics[0].value < 0.01 ? 'success' : 'failed',
    message: 'Error rate check completed',
    metrics: {
      errorRate: errorMetrics[0]?.value || 0,
      timeframe: '1 hour'
    }
  });

  // Check Response Times
  const responseMetrics = metricsCollector.getMetric('response_time', {
    start: Date.now() - 3600000
  });

  const avgResponseTime = responseMetrics.reduce((acc, curr) => acc + curr.value, 0) / responseMetrics.length;
  results.push({
    component: 'Response Times',
    status: avgResponseTime < 500 ? 'success' : 'failed', // Less than 500ms
    message: 'Response time check completed',
    metrics: {
      averageResponseTime: avgResponseTime,
      timeframe: '1 hour'
    }
  });

  // Check Database Performance
  const dbMetrics = metricsCollector.getMetric('db_query_time', {
    start: Date.now() - 3600000
  });

  const avgQueryTime = dbMetrics.reduce((acc, curr) => acc + curr.value, 0) / dbMetrics.length;
  results.push({
    component: 'Database Performance',
    status: avgQueryTime < 100 ? 'success' : 'failed', // Less than 100ms
    message: 'Database performance check completed',
    metrics: {
      averageQueryTime: avgQueryTime,
      timeframe: '1 hour'
    }
  });

  return results;
}

async function verifySecuritySettings(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // Check Security Headers
  const response = await fetch(process.env.NEXT_PUBLIC_APP_URL!);
  const headers = response.headers;
  const requiredHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy'
  ];

  const missingHeaders = requiredHeaders.filter(header => !headers.get(header));
  results.push({
    component: 'Security Headers',
    status: missingHeaders.length === 0 ? 'success' : 'failed',
    message: missingHeaders.length === 0 ? 'All security headers present' : `Missing headers: ${missingHeaders.join(', ')}`,
    metrics: {
      presentHeaders: requiredHeaders.length - missingHeaders.length,
      totalRequired: requiredHeaders.length
    }
  });

  // Check Rate Limiting
  const rateLimitHeader = headers.get('x-ratelimit-remaining');
  results.push({
    component: 'Rate Limiting',
    status: rateLimitHeader ? 'success' : 'failed',
    message: rateLimitHeader ? 'Rate limiting is active' : 'Rate limiting not detected',
    metrics: {
      remaining: rateLimitHeader ? parseInt(rateLimitHeader) : 'N/A'
    }
  });

  // Check SSL/TLS Configuration
  const sslResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL!}/.well-known/security.txt`);
  results.push({
    component: 'SSL/TLS',
    status: sslResponse.url.startsWith('https') ? 'success' : 'failed',
    message: sslResponse.url.startsWith('https') ? 'HTTPS enforced' : 'HTTPS not enforced',
    metrics: {
      protocol: sslResponse.url.split(':')[0]
    }
  });

  return results;
}

async function verifyFeatures(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // Check PWA
  const manifestResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL!}/manifest.json`);
  results.push({
    component: 'PWA',
    status: manifestResponse.ok ? 'success' : 'failed',
    message: manifestResponse.ok ? 'PWA manifest accessible' : 'PWA manifest not found',
    metrics: {
      statusCode: manifestResponse.status
    }
  });

  // Check API Endpoints
  const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL!}/api/health`);
  results.push({
    component: 'API',
    status: apiResponse.ok ? 'success' : 'failed',
    message: apiResponse.ok ? 'API endpoints responding' : 'API health check failed',
    metrics: {
      statusCode: apiResponse.status,
      responseTime: apiResponse.headers.get('x-response-time')
    }
  });

  // Check CDN
  const cdnResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL!}/static/test.txt`);
  const cfRay = cdnResponse.headers.get('cf-ray');
  results.push({
    component: 'CDN',
    status: cfRay ? 'success' : 'failed',
    message: cfRay ? 'CDN working properly' : 'CDN not detected',
    metrics: {
      cfRay,
      cacheStatus: cdnResponse.headers.get('cf-cache-status')
    }
  });

  return results;
}

async function verifyDeployment() {
  console.log('Starting post-deployment verification...\n');

  try {
    // Run all verifications
    const [healthResults, securityResults, featureResults] = await Promise.all([
      verifySystemHealth(),
      verifySecuritySettings(),
      verifyFeatures()
    ]);

    // Process and display results
    const allResults = [...healthResults, ...securityResults, ...featureResults];
    let hasFailures = false;

    console.log('System Health:');
    healthResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.metrics) {
        console.log('  Metrics:', JSON.stringify(result.metrics, null, 2));
      }
      if (result.status === 'failed') hasFailures = true;
    });

    console.log('\nSecurity Settings:');
    securityResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.metrics) {
        console.log('  Metrics:', JSON.stringify(result.metrics, null, 2));
      }
      if (result.status === 'failed') hasFailures = true;
    });

    console.log('\nFeature Verification:');
    featureResults.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.metrics) {
        console.log('  Metrics:', JSON.stringify(result.metrics, null, 2));
      }
      if (result.status === 'failed') hasFailures = true;
    });

    console.log('\nVerification complete!');
    
    if (hasFailures) {
      console.log('\n❌ Some verifications failed. Please check the output above.');
      process.exit(1);
    } else {
      console.log('\n✅ All post-deployment verifications passed successfully!');
    }
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

// Run verification
verifyDeployment();
