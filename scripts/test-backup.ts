import { config } from 'dotenv';
import path from 'path';
import { S3 } from 'aws-sdk';
import { createClient } from '@supabase/supabase-js';

// Load production environment variables
config({ path: path.resolve(process.cwd(), '.env.production') });

interface BackupTestResult {
  component: string;
  status: 'success' | 'failed';
  message: string;
  details?: Record<string, any>;
}

async function testS3Backup(): Promise<BackupTestResult> {
  try {
    const s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    // Test bucket access
    await s3.headBucket({
      Bucket: process.env.AWS_BUCKET_NAME!
    }).promise();

    // Create test file
    const testData = {
      timestamp: new Date().toISOString(),
      test: 'backup-verification'
    };

    await s3.putObject({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: 'backup-test/test.json',
      Body: JSON.stringify(testData),
      ContentType: 'application/json'
    }).promise();

    // Verify test file
    const result = await s3.getObject({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: 'backup-test/test.json'
    }).promise();

    // Clean up test file
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: 'backup-test/test.json'
    }).promise();

    return {
      component: 'S3 Backup',
      status: 'success',
      message: 'Successfully tested S3 backup system',
      details: {
        bucket: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_REGION,
        testFile: 'backup-test/test.json'
      }
    };
  } catch (error) {
    return {
      component: 'S3 Backup',
      status: 'failed',
      message: `Failed to test S3 backup: ${error}`
    };
  }
}

async function testDatabaseBackup(): Promise<BackupTestResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test record
    const { data: insertData, error: insertError } = await supabase
      .from('backup_tests')
      .insert([
        { 
          test_id: `backup-test-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      ]);

    if (insertError) throw insertError;

    // Verify test record
    const { data: verifyData, error: verifyError } = await supabase
      .from('backup_tests')
      .select()
      .eq('test_id', insertData[0].test_id);

    if (verifyError) throw verifyError;

    // Clean up test record
    await supabase
      .from('backup_tests')
      .delete()
      .eq('test_id', insertData[0].test_id);

    return {
      component: 'Database Backup',
      status: 'success',
      message: 'Successfully tested database backup system',
      details: {
        testRecord: insertData[0].test_id,
        timestamp: insertData[0].timestamp
      }
    };
  } catch (error) {
    return {
      component: 'Database Backup',
      status: 'failed',
      message: `Failed to test database backup: ${error}`
    };
  }
}

async function verifyBackupSchedule(): Promise<BackupTestResult> {
  try {
    const s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    // List recent backups
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
      component: 'Backup Schedule',
      status: 'success',
      message: 'Backup schedule is working properly',
      details: {
        latestBackup: latestBackup.LastModified,
        backupCount: backups.Contents.length,
        backupAge: `${Math.round(backupAge / (1000 * 60 * 60))} hours`
      }
    };
  } catch (error) {
    return {
      component: 'Backup Schedule',
      status: 'failed',
      message: `Failed to verify backup schedule: ${error}`
    };
  }
}

async function testBackupSystem() {
  console.log('Starting backup system verification...\n');

  try {
    // Run all tests
    const results = await Promise.all([
      testS3Backup(),
      testDatabaseBackup(),
      verifyBackupSchedule()
    ]);

    let hasFailures = false;

    // Process results
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.details) {
        console.log('  Details:', JSON.stringify(result.details, null, 2));
      }
      if (result.status === 'failed') hasFailures = true;
    });

    console.log('\nBackup verification complete!');
    
    if (hasFailures) {
      console.log('\n❌ Some backup tests failed. Please check the output above.');
      process.exit(1);
    } else {
      console.log('\n✅ All backup systems are functioning correctly!');
    }
  } catch (error) {
    console.error('Error during backup verification:', error);
    process.exit(1);
  }
}

// Run backup tests
testBackupSystem();
