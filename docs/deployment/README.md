# Deployment Guide

## Overview
This guide covers the deployment process for the Inspection Report application, including environment setup, build process, and monitoring configuration.

## Prerequisites

### System Requirements
- Node.js 18+
- npm 8+
- PostgreSQL 14+
- Redis (optional, for caching)
- HTTPS certificate
- Domain name

### Access Requirements
- Production server access
- Database credentials
- Environment variables
- SSL certificates
- DNS access

## Environment Setup

### Environment Variables
Create a `.env` file with the following variables:

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret

# Optional
REDIS_URL=redis://user:password@host:6379
API_RATE_LIMIT=100
ENABLE_CACHE=true
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://your-domain.com
COOKIE_SECRET=your-secure-cookie-secret
```

### Database Setup
1. Create production database:
```sql
CREATE DATABASE inspection_report;
```

2. Run migrations:
```bash
npm run db:migrate
```

3. Set up backup schedule:
```bash
# Example cron job for daily backups
0 0 * * * /usr/local/bin/backup-db.sh
```

## Build Process

### Production Build
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Verify build
npm run start
```

### Build Verification
1. Check bundle size:
```bash
npm run analyze
```

2. Run tests:
```bash
npm run test:ci
```

3. Check TypeScript:
```bash
npm run type-check
```

## Deployment Steps

### 1. Pre-deployment Checks
- [ ] Run all tests
- [ ] Check bundle size
- [ ] Verify environment variables
- [ ] Test database migrations
- [ ] Check dependencies

### 2. Staging Deployment
1. Deploy to staging environment
2. Run smoke tests
3. Check performance metrics
4. Verify features
5. Test rollback procedure

### 3. Production Deployment
1. Create deployment branch
2. Tag release version
3. Deploy to production
4. Run verification tests
5. Monitor metrics

### 4. Post-deployment
1. Monitor error rates
2. Check performance metrics
3. Verify database operations
4. Test critical paths

## Server Configuration

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 Configuration
```json
{
  "apps": [{
    "name": "inspection-report",
    "script": "npm",
    "args": "start",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

## Monitoring Setup

### Application Monitoring
1. Set up logging:
```bash
npm install winston
```

2. Configure metrics:
```bash
npm install prom-client
```

3. Set up health checks:
```bash
npm install @hapi/bounce
```

### Performance Monitoring
- Set up APM tools
- Configure error tracking
- Enable real-time metrics
- Set up alerts

### Error Tracking
1. Configure error reporting
2. Set up alert thresholds
3. Create error dashboards
4. Configure notifications

## Backup Strategy

### Database Backups
1. Daily full backups
2. Hourly incremental backups
3. Weekly backup tests
4. Off-site backup storage

### Application Backups
1. Configuration backups
2. User uploads backup
3. SSL certificate backup
4. Environment backup

## Security Measures

### SSL Configuration
1. Install SSL certificate
2. Configure HTTPS
3. Set up auto-renewal
4. Test SSL grade

### Security Headers
```nginx
add_header Strict-Transport-Security "max-age=31536000";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
```

### Firewall Rules
1. Configure application firewall
2. Set up rate limiting
3. Enable DDoS protection
4. Restrict admin access

## Rollback Procedure

### Quick Rollback
```bash
# Switch to previous version
git checkout v1.x.x

# Rebuild
npm ci && npm run build

# Restart application
pm2 restart inspection-report
```

### Database Rollback
```bash
# Revert last migration
npm run db:migrate:undo

# Restore from backup if needed
pg_restore -d dbname backup.sql
```

## Troubleshooting

### Common Issues
1. Build failures
   - Check Node version
   - Clear npm cache
   - Verify dependencies

2. Database issues
   - Check connections
   - Verify migrations
   - Check permissions

3. Performance issues
   - Check resource usage
   - Monitor response times
   - Review error logs

### Debug Process
1. Check application logs
2. Review error tracking
3. Monitor metrics
4. Test critical paths

## Maintenance

### Regular Tasks
- Update dependencies
- Rotate logs
- Clean up old backups
- Update SSL certificates

### Performance Optimization
- Analyze slow queries
- Optimize caching
- Review bundle size
- Check memory usage

## Support

### Documentation
- API documentation
- User guides
- Error codes
- Troubleshooting guides

### Contact
- Technical support
- Emergency contacts
- Vendor support
- Community resources
