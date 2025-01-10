# Inspection Report Deployment Procedures

## Overview
This guide outlines the deployment process for the Inspection Report system, a Next.js application with moisture mapping, equipment tracking, and reporting capabilities.

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Cloudflare account with Pages access
- Supabase account and project
- AWS S3 bucket for backups
- Environment variables configured

## Quick Start

```bash
# Deploy to production
npm run deploy:inspection

# Verify deployment
npm run verify:deployment

# Test backup system
npm run backup:test
```

This guide outlines the step-by-step procedures for deploying ServiceSphere to staging and production environments.

## Detailed Steps

### 1. Environment Setup

1. Configure Production Environment:
   ```bash
   # Copy production environment template
   cp .env.production.example .env.production

   # Edit with your values
   nano .env.production
   ```

2. Required Environment Variables:
   ```env
   # Application
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=${CF_PAGES_URL}

   # Database (Supabase)
   DATABASE_URL=your_supabase_connection_string
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key

   # AWS (for backups)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=ap-southeast-2
   AWS_BUCKET_NAME=inspection-report-backups
   ```

### 2. Pre-Deployment Checks

1. Run Tests:
   ```bash
   # Unit and integration tests
   npm run test:ci

   # Performance tests
   npm run performance:test
   ```

2. Validate Environment:
   ```bash
   # Verify production configuration
   npm run production:validate
   ```

3. Check Dependencies:
   ```bash
   # Verify dependencies
   npm audit

   # Check for updates
   npm outdated
   ```

### 3. Deployment Process

1. Build and Deploy:
   ```bash
   # Full deployment process
   npm run deploy:inspection
   ```

   This will:
   - Run all tests
   - Build the application
   - Deploy to Cloudflare Pages
   - Configure PWA settings
   - Set up monitoring
   - Verify deployment

2. Post-Deployment Verification:
   ```bash
   # Verify deployment
   npm run verify:deployment

   # Test backup system
   npm run backup:test
   ```

3. Monitor Deployment:
   ```bash
   # View metrics
   npm run metrics:view

   # Check error rates
   npm run metrics:errors
   ```

### 4. Feature Verification

1. Moisture Mapping:
   - Test moisture reading input
   - Verify mapping visualization
   - Check historical data
   - Test equipment integration

2. Report Generation:
   - Create test inspection report
   - Verify PDF generation
   - Check photo integration
   - Test data visualization

3. Equipment Tracking:
   - Add test equipment
   - Monitor runtime data
   - Verify alerts
   - Test maintenance tracking

### 5. PWA Verification

1. Installation:
   - Test PWA installation
   - Verify offline functionality
   - Check cache behavior
   - Test sync capabilities

2. Performance:
   - Verify load times
   - Test offline mode
   - Check resource usage
   - Monitor network usage

3. Updates:
   - Test update process
   - Verify cache updates
   - Check service worker
   - Test background sync

## Maintenance

### Daily Tasks

1. Monitoring:
   ```bash
   # Check system health
   npm run health:check

   # View error rates
   npm run metrics:errors

   # Check backups
   npm run backup:status
   ```

2. Data Management:
   - Monitor storage usage
   - Check database performance
   - Verify backup completion
   - Review error logs

### Weekly Tasks

1. Performance Review:
   ```bash
   # Generate performance report
   npm run metrics:report weekly

   # Review resource usage
   npm run resources:analyze
   ```

2. System Updates:
   - Check for updates
   - Review security patches
   - Test backup restoration
   - Update documentation

### Monthly Tasks

1. System Audit:
   ```bash
   # Run security scan
   npm run security:scan

   # Test recovery procedures
   npm run backup:test
   ```

2. Optimization:
   - Review performance metrics
   - Optimize database queries
   - Update caching strategies
   - Clean up old data

## Emergency Procedures

### System Issues

1. Stop Traffic:
   ```bash
   npm run traffic:stop
   ```

2. Restore System:
   ```bash
   # Restore from backup
   npm run backup:restore

   # Verify restoration
   npm run verify:deployment
   ```

3. Resume Service:
   ```bash
   npm run traffic:resume
   ```

### Data Issues

1. Stop Updates:
   ```bash
   # Enable maintenance mode
   npm run maintenance:enable
   ```

2. Restore Data:
   ```bash
   # Restore specific backup
   npm run backup:restore --date YYYY-MM-DD
   ```

3. Verify Data:
   ```bash
   # Run integrity checks
   npm run data:verify
   ```

## Support Contacts

### Technical Support
- Primary: [Contact]
- Backup: [Contact]
- After Hours: [Contact]

### Emergency Contacts
- DevOps Lead: [Contact]
- System Admin: [Contact]
- Security Team: [Contact]

## Additional Resources

- [API Documentation](./API.md)
- [Monitoring Guide](./MONITORING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Backup Procedures](./BACKUP.md)

## Rollback Procedures

If issues are detected post-deployment:

1. Stop Traffic:
   ```bash
   npm run traffic:stop
   ```

2. Restore Backup:
   ```bash
   npm run backup:restore
   ```

3. Verify System:
   ```bash
   npm run verify:deployment
   ```

4. Resume Traffic:
   ```bash
   npm run traffic:resume
   ```

## Verification Checklist

- [ ] All tests passing
- [ ] Performance metrics within acceptable range
- [ ] Security headers configured
- [ ] SSL/TLS properly configured
- [ ] CDN functioning
- [ ] Database connections verified
- [ ] API endpoints responding
- [ ] Monitoring systems active
- [ ] Alert systems configured
- [ ] Backup systems verified

## Common Issues

### Database Connection Issues

```bash
# Verify database connection
npm run db:verify

# Check connection pool
npm run db:status
```

### CDN Issues

```bash
# Clear CDN cache
npm run cdn:purge

# Verify CDN status
npm run cdn:verify
```

### SSL/TLS Issues

```bash
# Verify SSL configuration
npm run ssl:verify

# Force SSL renewal
npm run ssl:renew
```

## Maintenance Mode

To enable maintenance mode:

```bash
# Enable maintenance mode
npm run maintenance:enable

# Disable maintenance mode
npm run maintenance:disable
```

## Post-Deployment Tasks

1. Verify System Health:
   ```bash
   npm run health:check
   ```

2. Monitor Metrics:
   ```bash
   npm run metrics:view
   ```

3. Test Critical Paths:
   ```bash
   npm run test:e2e
   ```

## Contact Information

- Technical Support: [Contact]
- DevOps Team: [Contact]
- Security Team: [Contact]
- Emergency Contact: [Contact]

## Additional Resources

- [API Documentation](./API.md)
- [Monitoring Guide](./MONITORING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Emergency Procedures](./EMERGENCY.md)
