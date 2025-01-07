# ServiceSphere Deployment Guide

## Environment Setup

### Development Environment

1. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Required Development Variables:
   ```env
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   LOGGING_LEVEL=debug
   ENABLE_INSPECTION_REPORTS=true
   ENABLE_CARSI_TRAINING=true
   ENABLE_ANALYTICS=false
   ```

### Production Environment (Vercel)

1. Configure Production Variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.example`

2. Critical Production Variables:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   LOGGING_LEVEL=info
   ENABLE_INSPECTION_REPORTS=true
   ENABLE_CARSI_TRAINING=true
   ENABLE_ANALYTICS=true
   ```

### Firebase Setup

1. Create a Firebase Project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Authentication and Storage services

2. Get Firebase Configuration:
   - Project Settings > General > Your Apps
   - Create a Web App
   - Copy configuration values to environment variables

3. Firebase Admin Setup:
   - Project Settings > Service Accounts
   - Generate New Private Key
   - Add to environment variables (ensure FIREBASE_PRIVATE_KEY has quotes)

### Security Configuration

1. Generate Secure Keys:
   ```bash
   # Generate AUTH_SECRET
   openssl rand -base64 32
   
   # Generate JWT_SECRET
   openssl rand -base64 32
   
   # Generate SESSION_SECRET
   openssl rand -base64 32
   
   # Generate ENCRYPTION_KEY
   openssl rand -base64 32
   ```

2. Configure CORS:
   ```env
   CORS_ORIGINS=https://your-domain.com,https://admin.your-domain.com
   ```

3. Set CSP Directives:
   ```env
   CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;"
   ```

### Storage Configuration

1. Local Storage (Development):
   ```env
   STORAGE_PROVIDER=local
   ```

2. S3 Storage (Production):
   ```env
   STORAGE_PROVIDER=s3
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_NAME=your-bucket
   S3_REGION=your-region
   ```

### Email Configuration

1. SMTP Setup (Production):
   ```env
   SMTP_HOST=smtp.provider.com
   SMTP_PORT=587
   SMTP_USER=your-username
   SMTP_PASSWORD=your-password
   EMAIL_FROM=noreply@your-domain.com
   ```

### Monitoring Setup

1. Sentry Configuration:
   ```env
   SENTRY_DSN=your-sentry-dsn
   ```

2. Analytics Setup:
   ```env
   GOOGLE_ANALYTICS_ID=your-ga-id
   MIXPANEL_TOKEN=your-mixpanel-token
   ```

### Rate Limiting

Configure based on your needs:
```env
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Cache Configuration

1. Development (Local):
   ```env
   CACHE_TTL=3600
   ```

2. Production (Redis):
   ```env
   REDIS_URL=redis://your-redis-url
   CACHE_TTL=3600
   ```

## Deployment Checklist

### Pre-deployment
- [ ] All required environment variables are set
- [ ] Firebase project is properly configured
- [ ] Storage provider is set up and accessible
- [ ] Email service is configured
- [ ] Security keys are generated and set
- [ ] CORS origins are correctly configured
- [ ] Rate limiting is properly set
- [ ] Monitoring services are configured

### Post-deployment
- [ ] Verify environment variables are loaded
- [ ] Test Firebase authentication
- [ ] Verify file uploads work
- [ ] Check email functionality
- [ ] Verify API rate limiting
- [ ] Test monitoring and logging
- [ ] Verify analytics tracking
- [ ] Check cache functionality

## Troubleshooting

### Common Issues

1. Firebase Private Key Issues:
   - Ensure FIREBASE_PRIVATE_KEY includes quotes and newlines
   - Example: `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"`

2. CORS Issues:
   - Verify CORS_ORIGINS includes all necessary domains
   - Include both www and non-www versions if needed

3. Environment Variable Loading:
   - Check if .env files are in the correct location
   - Verify variable names match exactly
   - Restart the application after changing environment variables

### Monitoring Deployment

1. Check Logs:
   ```bash
   # View deployment logs
   vercel logs
   
   # View specific function logs
   vercel logs your-function-name
   ```

2. Monitor Performance:
   - Use Vercel Analytics
   - Check Sentry for errors
   - Monitor Firebase Console

## Scaling Considerations

1. Rate Limiting:
   - Adjust RATE_LIMIT_WINDOW and RATE_LIMIT_MAX_REQUESTS based on usage
   - Monitor API usage patterns

2. Cache Configuration:
   - Adjust CACHE_TTL based on data freshness requirements
   - Monitor Redis memory usage

3. Storage:
   - Monitor S3 bucket usage
   - Set up bucket lifecycle policies

## Security Best Practices

1. Environment Variables:
   - Never commit .env files
   - Rotate secrets regularly
   - Use different values for development and production

2. API Security:
   - Keep CORS_ORIGINS as restrictive as possible
   - Regularly update CSP_DIRECTIVES
   - Monitor authentication logs

3. Monitoring:
   - Set up alerts for unusual patterns
   - Monitor rate limit violations
   - Track failed authentication attempts
