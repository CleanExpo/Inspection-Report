import { config } from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import Redis from 'ioredis';
import { S3 } from 'aws-sdk';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

// Load staging environment variables
config({ path: path.resolve(process.cwd(), '.env.staging') });

interface ValidationResult {
  service: string;
  status: 'success' | 'failed';
  message: string;
}

async function validateDatabase(): Promise<ValidationResult> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true'
  });

  try {
    await client.connect();
    await client.query('SELECT NOW()');
    await client.end();

    return {
      service: 'Database',
      status: 'success',
      message: 'Successfully connected to PostgreSQL database'
    };
  } catch (error) {
    return {
      service: 'Database',
      status: 'failed',
      message: `Failed to connect to database: ${error}`
    };
  }
}

async function validateRedis(): Promise<ValidationResult> {
  const redis = new Redis(process.env.REDIS_URL!, {
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_SSL === 'true' ? {} : undefined
  });

  try {
    await redis.ping();
    await redis.quit();

    return {
      service: 'Redis',
      status: 'success',
      message: 'Successfully connected to Redis'
    };
  } catch (error) {
    return {
      service: 'Redis',
      status: 'failed',
      message: `Failed to connect to Redis: ${error}`
    };
  }
}

async function validateS3(): Promise<ValidationResult> {
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  try {
    await s3.headBucket({ Bucket: process.env.AWS_BUCKET_NAME! }).promise();

    return {
      service: 'S3 Storage',
      status: 'success',
      message: 'Successfully connected to S3 bucket'
    };
  } catch (error) {
    return {
      service: 'S3 Storage',
      status: 'failed',
      message: `Failed to connect to S3: ${error}`
    };
  }
}

async function validateSMTP(): Promise<ValidationResult> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();

    return {
      service: 'SMTP',
      status: 'success',
      message: 'Successfully connected to SMTP server'
    };
  } catch (error) {
    return {
      service: 'SMTP',
      status: 'failed',
      message: `Failed to connect to SMTP server: ${error}`
    };
  }
}

async function validateExternalAPIs(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Weather API
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${process.env.WEATHER_API_KEY}`
    );
    if (weatherResponse.ok) {
      results.push({
        service: 'Weather API',
        status: 'success',
        message: 'Successfully connected to Weather API'
      });
    } else {
      throw new Error(`HTTP ${weatherResponse.status}`);
    }
  } catch (error) {
    results.push({
      service: 'Weather API',
      status: 'failed',
      message: `Failed to connect to Weather API: ${error}`
    });
  }

  // Maps API
  try {
    const mapsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=London&key=${process.env.MAPS_API_KEY}`
    );
    if (mapsResponse.ok) {
      results.push({
        service: 'Maps API',
        status: 'success',
        message: 'Successfully connected to Maps API'
      });
    } else {
      throw new Error(`HTTP ${mapsResponse.status}`);
    }
  } catch (error) {
    results.push({
      service: 'Maps API',
      status: 'failed',
      message: `Failed to connect to Maps API: ${error}`
    });
  }

  return results;
}

async function validateSentry(): Promise<ValidationResult> {
  if (!process.env.SENTRY_DSN) {
    return {
      service: 'Sentry',
      status: 'failed',
      message: 'Sentry DSN not configured'
    };
  }

  try {
    const response = await fetch(process.env.SENTRY_DSN);
    if (response.ok) {
      return {
        service: 'Sentry',
        status: 'success',
        message: 'Successfully connected to Sentry'
      };
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    return {
      service: 'Sentry',
      status: 'failed',
      message: `Failed to connect to Sentry: ${error}`
    };
  }
}

async function validateEnvironment() {
  console.log('Starting staging environment validation...\n');

  const validations = [
    validateDatabase(),
    validateRedis(),
    validateS3(),
    validateSMTP(),
    validateSentry(),
    ...await validateExternalAPIs()
  ];

  const results = await Promise.all(validations);
  let hasFailures = false;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.message}`);
    if (result.status === 'failed') hasFailures = true;
  });

  console.log('\nValidation complete!');
  
  if (hasFailures) {
    console.log('\n❌ Some validations failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All services validated successfully!');
  }
}

// Run validation
validateEnvironment().catch(error => {
  console.error('Error during validation:', error);
  process.exit(1);
});
