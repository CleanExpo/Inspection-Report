# Cloudflare Setup Guide for ServiceSphere

This guide walks you through setting up Cloudflare for the ServiceSphere application, including DNS configuration, CDN setup, and deployment configuration.

## Prerequisites

- Node.js 18 or later
- npm or yarn
- A Cloudflare account
- A registered domain on Cloudflare

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Get Cloudflare API token:
```bash
npm run cloudflare:token
```
This script will:
- Open the Cloudflare dashboard
- Guide you through creating an API token
- Help you set up the environment file

3. Configure environment:
```bash
# Copy the example environment file
cp .env.cloudflare.example .env.cloudflare

# Edit with your values
nano .env.cloudflare
```

4. Run the setup:
```bash
npm run cloudflare:setup
```

5. Verify the configuration:
```bash
npm run cloudflare:verify
```

## Manual Setup Steps

If you prefer to set up manually, follow these steps:

### 1. Domain Setup

1. Log into Cloudflare Dashboard (https://dash.cloudflare.com)
2. Add your domain:
   - Click "Add a Site"
   - Enter your domain name
   - Select "Free" plan for starting (can upgrade later)
   - Follow DNS verification steps

### 2. DNS Configuration

1. Add A Record:
   ```
   Type: A
   Name: @
   Target: Your server IP
   Proxy status: Proxied
   TTL: Auto
   ```

2. Add CNAME for CDN:
   ```
   Type: CNAME
   Name: cdn
   Target: @
   Proxy status: Proxied
   TTL: Auto
   ```

## Environment Variables

Required variables in `.env.cloudflare`:

```env
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id
SERVER_IP=your_server_ip
DOMAIN=your_domain.com
```

Optional configurations:
```env
CDN_SUBDOMAIN=cdn
ENVIRONMENT=production
BROWSER_CACHE_TTL=14400
EDGE_CACHE_TTL=7200
API_RATE_LIMIT=100
```

## Features Configured

Our setup scripts configure the following:

1. DNS Records
   - A record for main domain
   - CNAME record for CDN

2. SSL/TLS
   - Full SSL mode
   - Automatic HTTPS rewrites

3. Cache Rules
   - Aggressive caching
   - Browser cache TTL
   - Edge cache settings

4. Security
   - Security headers
   - Rate limiting
   - WAF rules

5. Performance
   - Auto minification
   - Brotli compression
   - Early hints

6. Monitoring
   - Health checks
   - Analytics
   - Error tracking

## Verification

The verification script checks:
- DNS configuration
- SSL/TLS settings
- Cache rules
- Security headers
- CDN performance
- Worker deployment
- Analytics setup

## Troubleshooting

### Common Issues

1. DNS Not Propagating
   ```bash
   # Check DNS propagation
   dig your-domain.com
   ```

2. SSL Issues
   - Ensure SSL mode is set to "Full"
   - Check for SSL certificates
   - Verify DNS records

3. Cache Issues
   - Clear cache in Cloudflare dashboard
   - Check cache headers
   - Verify cache rules

### Debug Commands

Check configuration:
```bash
npm run cloudflare:verify
```

View detailed logs:
```bash
DEBUG=cloudflare:* npm run cloudflare:setup
```

## Maintenance

### Daily Tasks
- Monitor cache hit rates
- Check worker execution metrics
- Review security events

### Weekly Tasks
- Review analytics
- Check for new Cloudflare features
- Update SSL certificates if needed

### Monthly Tasks
- Review and optimize cache rules
- Update security rules
- Check for worker script updates

## Support

- Cloudflare Support: https://support.cloudflare.com
- Status Page: https://www.cloudflarestatus.com
- Developer Docs: https://developers.cloudflare.com

## Security Notes

- Keep API tokens secure
- Regularly rotate tokens
- Monitor audit logs
- Review security settings monthly
- Keep worker scripts in version control

## Deployment

For deployment instructions, see:
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- [CLOUDFLARE-PAGES-SETUP.md](./CLOUDFLARE-PAGES-SETUP.md)

## Additional Resources

- [Cloudflare API Documentation](https://api.cloudflare.com/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Pages Documentation](https://developers.cloudflare.com/pages/)
