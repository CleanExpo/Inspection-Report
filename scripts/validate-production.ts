import { config } from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { S3 } from 'aws-sdk';
import fetch from 'node-fetch';
import https from 'https';
import tls from 'tls';

// Load production environment variables
config({ path: path.resolve(process.cwd(), '.env.production') });

interface ValidationResult {
  service: string;
  status: 'success' | 'failed';
  message: string;
  details?: Record<string, any>;
}

async function validateDatabase(): Promise<ValidationResult> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  try {
    await client.connect();
    
    // Check connection
    await client.query('SELECT NOW()');
    
    // Check connection pool
    const poolResult = await client.query(`
      SELECT count(*) as connection_count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    // Check database size
    const sizeResult = await client.query(`
      SELECT pg_database_size(current_database()) as size
    `);

    await client.end();

    return {
      service: 'Database',
      status: 'success',
      message: 'Database validation successful',
      details: {
        connections: poolResult.rows[0].connection_count,
        dbSize: sizeResult.rows[0].size
      }
    };
  } catch (error) {
    return {
      service: 'Database',
      status: 'failed',
      message: `Database validation failed: ${error}`
    };
  }
}

async function validateSupabase(): Promise<ValidationResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Test authentication
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return {
      service: 'Supabase',
      status: 'success',
      message: 'Supabase validation successful',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSession: !!data.session
      }
    };
  } catch (error) {
    return {
      service: 'Supabase',
      status: 'failed',
      message: `Supabase validation failed: ${error}`
    };
  }
}

async function validateBackups(): Promise<ValidationResult> {
  const s3 = new S3({
    region: process.env.AWS_REGION
  });

  try {
    // Check recent backups
    const backups = await s3.listObjects({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: 'backups/',
      MaxKeys: 10
    }).promise();

    if (!backups.Contents || backups.Contents.length === 0) {
      throw new Error('No recent backups found');
    }

    // Check most recent backup
    const latestBackup = backups.Contents[backups.Contents.length - 1];
    const backupAge = Date.now() - latestBackup.LastModified!.getTime();
    const maxAge = parseInt(process.env.BACKUP_RETENTION_DAYS!) * 24 * 60 * 60 * 1000;

    if (backupAge > maxAge) {
      throw new Error('Most recent backup is too old');
    }

    return {
      service: 'Backups',
      status: 'success',
      message: 'Backup validation successful',
      details: {
        backupCount: backups.Contents.length,
        latestBackup: latestBackup.LastModified,
        backupSize: latestBackup.Size
      }
    };
  } catch (error) {
    return {
      service: 'Backups',
      status: 'failed',
      message: `Backup validation failed: ${error}`
    };
  }
}

async function validateSecurity(): Promise<ValidationResult> {
  try {
    const url = process.env.NEXT_PUBLIC_APP_URL!;
    const response = await fetch(url, {
      method: 'HEAD'
    });

    const headers = response.headers;
    const securityHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy'
    ];

    const missingHeaders = securityHeaders.filter(
      header => !headers.get(header)
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
    }

    // Check TLS version
    const tlsInfo = await new Promise((resolve, reject) => {
      const socket = tls.connect({
        host: new URL(url).hostname,
        port: 443,
        minVersion: 'TLSv1.2'
      }, () => {
        resolve({
          protocol: socket.getProtocol(),
          cipher: socket.getCipher()
        });
        socket.end();
      });
      socket.on('error', reject);
    });

    return {
      service: 'Security',
      status: 'success',
      message: 'Security validation successful',
      details: {
        tlsVersion: tlsInfo,
        securityHeaders: Object.fromEntries(
          securityHeaders.map(h => [h, headers.get(h)])
        )
      }
    };
  } catch (error) {
    return {
      service: 'Security',
      status: 'failed',
      message: `Security validation failed: ${error}`
    };
  }
}

async function validateCDN(): Promise<ValidationResult> {
  try {
    const url = process.env.NEXT_PUBLIC_APP_URL!;
    const response = await fetch(url);
    const cfRay = response.headers.get('cf-ray');
    const cfCache = response.headers.get('cf-cache-status');

    if (!cfRay) {
      throw new Error('Cloudflare not detected');
    }

    return {
      service: 'CDN',
      status: 'success',
      message: 'CDN validation successful',
      details: {
        cfRay,
        cacheStatus: cfCache,
        server: response.headers.get('server')
      }
    };
  } catch (error) {
    return {
      service: 'CDN',
      status: 'failed',
      message: `CDN validation failed: ${error}`
    };
  }
}

async function validateProduction() {
  console.log('Starting production environment validation...\n');

  const validations = [
    validateDatabase(),
    validateSupabase(),
    validateBackups(),
    validateSecurity(),
    validateCDN()
  ];

  const results = await Promise.all(validations);
  let hasFailures = false;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
    if (result.details) {
      console.log('Details:', JSON.stringify(result.details, null, 2));
    }
    if (result.status === 'failed') hasFailures = true;
  });

  console.log('\nValidation complete!');
  
  if (hasFailures) {
    console.log('\n❌ Some validations failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All production validations passed successfully!');
  }
}

// Run validation
validateProduction().catch(error => {
  console.error('Error during production validation:', error);
  process.exit(1);
});
