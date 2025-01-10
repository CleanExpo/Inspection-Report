import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // App Config
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Firebase Config
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  FIREBASE_APP_ID: z.string().min(1),
  FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Firebase Admin Config
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_STORAGE_BUCKET_URL: z.string().url(),

  // Database Config
  DATABASE_URL: z.string().url().optional(),
  DATABASE_SSL: z.boolean().optional(),
  DATABASE_SSL_VERIFY: z.boolean().optional(),

  // Auth Config
  AUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),

  // Email Config
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.number().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Storage Config
  STORAGE_PROVIDER: z.enum(['local', 's3', 'gcs']).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  S3_BUCKET_NAME: z.string().min(1).optional(),
  S3_REGION: z.string().min(1).optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.number().positive(),
  RATE_LIMIT_MAX_REQUESTS: z.number().positive(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOGGING_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),

  // Security
  CORS_ORIGINS: z.string(),
  CSP_DIRECTIVES: z.string(),
  ENCRYPTION_KEY: z.string().min(32),

  // Feature Flags
  ENABLE_INSPECTION_REPORTS: z.boolean(),
  ENABLE_CARSI_TRAINING: z.boolean(),
  ENABLE_ANALYTICS: z.boolean(),

  // Third-Party Integrations
  STRIPE_PUBLIC_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().min(1).optional(),
  MIXPANEL_TOKEN: z.string().min(1).optional(),

  // External Services
  WEATHER_API_KEY: z.string().min(1).optional(),
  MAPS_API_KEY: z.string().min(1).optional(),

  // Cache Config
  REDIS_URL: z.string().url().optional(),
  CACHE_TTL: z.number().positive().optional(),

  // CDN Configuration
  CDN_URL: z.string().url().optional().or(z.literal('')),
  CDN_PROVIDER: z.enum(['cloudflare', 'cloudfront', 'custom']).optional().or(z.literal('')),
  CDN_REGION: z.string().optional().or(z.literal('')),
  CDN_ACCESS_KEY_ID: z.string().optional().or(z.literal('')),
  CDN_SECRET_ACCESS_KEY: z.string().optional().or(z.literal('')),
  CDN_DISTRIBUTION_ID: z.string().optional().or(z.literal('')),
  ASSET_PREFIX: z.string().url().optional().or(z.literal('')),

  // Deployment Config
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),

  // Debug Config
  DEBUG: z.string().optional(),
  DEBUG_COLORS: z.boolean().optional(),
  DEBUG_HIDE_DATE: z.boolean().optional(),
});

// Function to validate and parse environment variables
function validateEnv() {
  try {
    const parsedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_STORAGE_BUCKET_URL: process.env.FIREBASE_STORAGE_BUCKET_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_SSL: process.env.DATABASE_SSL === 'true',
      DATABASE_SSL_VERIFY: process.env.DATABASE_SSL_VERIFY === 'true',
      AUTH_SECRET: process.env.AUTH_SECRET!,
      JWT_SECRET: process.env.JWT_SECRET!,
      SESSION_SECRET: process.env.SESSION_SECRET!,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      EMAIL_FROM: process.env.EMAIL_FROM,
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER as 'local' | 's3' | 'gcs',
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      S3_REGION: process.env.S3_REGION,
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW!),
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!),
      SENTRY_DSN: process.env.SENTRY_DSN,
      LOGGING_LEVEL: process.env.LOGGING_LEVEL as 'debug' | 'info' | 'warn' | 'error',
      CORS_ORIGINS: process.env.CORS_ORIGINS!,
      CSP_DIRECTIVES: process.env.CSP_DIRECTIVES!,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
      ENABLE_INSPECTION_REPORTS: process.env.ENABLE_INSPECTION_REPORTS === 'true',
      ENABLE_CARSI_TRAINING: process.env.ENABLE_CARSI_TRAINING === 'true',
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
      WEATHER_API_KEY: process.env.WEATHER_API_KEY,
      MAPS_API_KEY: process.env.MAPS_API_KEY,
      REDIS_URL: process.env.REDIS_URL,
      CACHE_TTL: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : undefined,
      CDN_URL: process.env.CDN_URL,
      ASSET_PREFIX: process.env.ASSET_PREFIX,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV as 'production' | 'preview' | 'development',
      VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
      DEBUG: process.env.DEBUG,
      DEBUG_COLORS: process.env.DEBUG_COLORS === 'true',
      DEBUG_HIDE_DATE: process.env.DEBUG_HIDE_DATE === 'true',
    });

    return parsedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.'));
      throw new Error(`❌ Invalid environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export type for environment variables
export type Env = z.infer<typeof envSchema>;
