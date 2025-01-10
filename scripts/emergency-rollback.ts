import { config } from 'dotenv';
import path from 'path';
import { CloudflareClient } from '../lib/cloudflare';
import { S3Client } from '../lib/s3';
import { MetricsCollector } from '../monitoring/services/metrics/collector';
import { AlertManager } from '../monitoring/services/metrics/alert-manager';

// Load production environment variables
config({ path: path.resolve(process.cwd(), '.env.production') });

interface RollbackResult {
  step: string;
  status: 'success' | 'failed';
  message: string;
  details?: Record<string, any>;
}

async function stopIncomingTraffic(): Promise<RollbackResult> {
  try {
    // Update Cloudflare DNS to maintenance page
    const cloudflare = new CloudflareClient({
      token: process.env.CLOUDFLARE_API_TOKEN!,
      zoneId: process.env.CLOUDFLARE_ZONE_ID!
    });

    await cloudflare.updateDNS({
      type: 'A',
      name: '@',
      content: process.env.MAINTENANCE_PAGE_IP!,
      proxied: true
    });

    return {
      step: 'Stop Traffic',
      status: 'success',
      message: 'Successfully redirected traffic to maintenance page',
      details: {
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      step: 'Stop Traffic',
      status: 'failed',
      message: `Failed to stop traffic: ${error}`
    };
  }
}

async function restoreFromBackup(): Promise<RollbackResult> {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    });

    // Get latest backup
    const backups = await s3.listObjects({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: 'backups/',
      MaxKeys: 10
    });

    if (!backups.Contents || backups.Contents.length === 0) {
      throw new Error('No backups found');
    }

    const latestBackup = backups.Contents[backups.Contents.length - 1];
    
    // Restore backup
    await s3.restoreObject({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: latestBackup.Key!
    });

    return {
      step: 'Restore Backup',
      status: 'success',
      message: 'Successfully restored from backup',
      details: {
        backupDate: latestBackup.LastModified,
        backupSize: latestBackup.Size
      }
    };
  } catch (error) {
    return {
      step: 'Restore Backup',
      status: 'failed',
      message: `Failed to restore backup: ${error}`
    };
  }
}

async function verifyDataIntegrity(): Promise<RollbackResult> {
  try {
    const metricsCollector = new MetricsCollector();
    
    // Check database integrity
    const dbMetrics = metricsCollector.getMetric('database_integrity', {
      start: Date.now() - 3600000 // Last hour
    });

    // Check data consistency
    const dataMetrics = metricsCollector.getMetric('data_consistency', {
      start: Date.now() - 3600000
    });

    const hasIntegrityIssues = dbMetrics.some(m => m.value < 1);
    const hasConsistencyIssues = dataMetrics.some(m => m.value < 1);

    if (hasIntegrityIssues || hasConsistencyIssues) {
      throw new Error('Data integrity check failed');
    }

    return {
      step: 'Verify Data',
      status: 'success',
      message: 'Data integrity verified successfully',
      details: {
        dbIntegrity: dbMetrics[dbMetrics.length - 1]?.value,
        dataConsistency: dataMetrics[dataMetrics.length - 1]?.value
      }
    };
  } catch (error) {
    return {
      step: 'Verify Data',
      status: 'failed',
      message: `Failed to verify data integrity: ${error}`
    };
  }
}

async function updateDNS(): Promise<RollbackResult> {
  try {
    // Restore original DNS settings
    const cloudflare = new CloudflareClient({
      token: process.env.CLOUDFLARE_API_TOKEN!,
      zoneId: process.env.CLOUDFLARE_ZONE_ID!
    });

    await cloudflare.updateDNS({
      type: 'A',
      name: '@',
      content: process.env.PRODUCTION_IP!,
      proxied: true
    });

    return {
      step: 'Update DNS',
      status: 'success',
      message: 'Successfully restored DNS settings',
      details: {
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      step: 'Update DNS',
      status: 'failed',
      message: `Failed to update DNS: ${error}`
    };
  }
}

async function resumeTraffic(): Promise<RollbackResult> {
  try {
    // Verify system health before resuming
    const metricsCollector = new MetricsCollector();
    
    const healthMetrics = metricsCollector.getMetric('system_health', {
      start: Date.now() - 300000 // Last 5 minutes
    });

    const isHealthy = healthMetrics.every(m => m.value > 0.9);
    if (!isHealthy) {
      throw new Error('System health check failed');
    }

    // Clear CDN cache
    const cloudflare = new CloudflareClient({
      token: process.env.CLOUDFLARE_API_TOKEN!,
      zoneId: process.env.CLOUDFLARE_ZONE_ID!
    });

    await cloudflare.purgeCache();

    return {
      step: 'Resume Traffic',
      status: 'success',
      message: 'Successfully resumed traffic',
      details: {
        healthScore: healthMetrics[healthMetrics.length - 1]?.value,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      step: 'Resume Traffic',
      status: 'failed',
      message: `Failed to resume traffic: ${error}`
    };
  }
}

async function performEmergencyRollback() {
  console.log('Starting emergency rollback procedure...\n');

  try {
    // Execute rollback steps
    const results = [
      await stopIncomingTraffic(),
      await restoreFromBackup(),
      await verifyDataIntegrity(),
      await updateDNS(),
      await resumeTraffic()
    ];

    let hasFailures = false;

    // Process results
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.step}: ${result.message}`);
      if (result.details) {
        console.log('  Details:', JSON.stringify(result.details, null, 2));
      }
      if (result.status === 'failed') hasFailures = true;
    });

    console.log('\nRollback procedure complete!');
    
    if (hasFailures) {
      console.log('\n❌ Some rollback steps failed. Please check the output above.');
      process.exit(1);
    } else {
      console.log('\n✅ Emergency rollback completed successfully!');
    }

    // Notify team
    const alertManager = new AlertManager();
    await alertManager.notify({
      title: 'Emergency Rollback Completed',
      message: 'System has been successfully rolled back',
      severity: 'critical',
      metadata: {
        results
      }
    });
  } catch (error) {
    console.error('Critical error during rollback:', error);
    process.exit(1);
  }
}

// Execute rollback
performEmergencyRollback();
