# Cloudflare Pages Setup for ServiceSphere

## 1. Initial Setup

1. Go to Cloudflare Dashboard
2. Navigate to "Workers & Pages"
3. Click "Create application"
4. Select "Pages" tab
5. Click "Connect to Git"

## 2. Repository Connection

1. Select your Git provider (GitHub/GitLab)
2. Authorize Cloudflare Pages
3. Select the ServiceSphere repository
4. Configure build settings:

```
Project name: servicepshere
Production branch: main
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
```

## 3. Environment Variables

Add the following in Pages > Settings > Environment variables:

```
NODE_VERSION=18
NEXT_PUBLIC_APP_URL=${CF_PAGES_URL}
NEXT_PUBLIC_APP_MODE=pwa
```

## 3.1 PWA Configuration

Add the following environment variables for PWA support:

```
NEXT_PUBLIC_PWA_SCOPE=/
NEXT_PUBLIC_PWA_START_URL=/
NEXT_PUBLIC_PWA_DISPLAY=standalone
NEXT_PUBLIC_PWA_THEME_COLOR=#000000
NEXT_PUBLIC_PWA_BACKGROUND_COLOR=#ffffff
```

## 4. Build Configuration

Create `pages.config.js` in project root:
```javascript
module.exports = {
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  devCommand: 'npm run dev',
  installCommand: 'npm install',
}
```

## 5. Deployment Settings

### Production Branch
- Branch: main
- Environment: Production
- Build settings: Use project settings

### Preview Branches
- Branch: All other branches
- Environment: Preview
- Build settings: Use project settings

## 6. Advanced Settings

1. Functions:
   - Enable Edge Functions
   - Configure function timeouts
   - Set memory limits

2. Builds:
   - Enable automatic builds and deployments
   - Configure build cache
   - Set build resource allocation

3. Headers:
   ```
   # Static Assets
   /*.{js,css,jpg,jpeg,png,gif,ico,woff,woff2}
     Cache-Control: public, max-age=31536000, immutable

   # PWA Assets
   /manifest.json
     Cache-Control: public, max-age=3600
     Access-Control-Allow-Origin: *

   /icons/*
     Cache-Control: public, max-age=31536000, immutable
     Access-Control-Allow-Origin: *

   # Service Worker
   /sw.js
     Cache-Control: no-cache
     Access-Control-Allow-Origin: *

   /workbox-*.js
     Cache-Control: public, max-age=31536000, immutable
     Access-Control-Allow-Origin: *

   # API Routes
   /api/*
     Cache-Control: no-store
     Access-Control-Allow-Origin: *
   ```

4. PWA Settings:
   - Enable service worker registration
   - Configure offline fallback
   - Set up background sync
   - Configure push notifications (if needed)

## 7. Custom Domains (Optional)

If using a custom domain:
1. Go to Custom domains
2. Click "Set up custom domain"
3. Enter your domain
4. Follow DNS verification steps
5. Configure SSL/TLS settings

## 8. Environment Configuration

Create `.env.production` for production settings:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-pages-url.pages.dev
NEXT_PUBLIC_APP_MODE=pwa
```

## 9. Deployment Commands

```bash
# Deploy to Cloudflare Pages
npm run build

# Test locally with Wrangler
npx wrangler pages dev .next

# Test PWA locally
npm run pages:dev
```

## 10. Monitoring & Analytics

1. Enable:
   - Web Analytics
   - Performance monitoring
   - Error tracking
   - PWA usage metrics

2. Configure:
   - Custom error pages
   - Performance budgets
   - Uptime monitoring
   - Offline analytics

## Important Notes

1. Build Performance:
   - Use build cache
   - Optimize dependencies
   - Use asset optimization
   - Configure PWA caching strategies

2. Security:
   - Configure CSP headers
   - Enable security features
   - Use environment secrets
   - Set up PWA permissions

3. Optimization:
   - Enable automatic minification
   - Configure image optimization
   - Use edge caching
   - Implement PWA asset preloading

## Maintenance

### Regular Tasks
- Monitor build times
- Check error rates
- Review analytics
- Update dependencies
- Verify PWA functionality
- Test offline capabilities

### Security Tasks
- Review access permissions
- Check security headers
- Monitor unusual patterns
- Audit PWA permissions
- Review service worker scope

## Troubleshooting

1. Build Issues:
   - Check build logs
   - Verify Node.js version
   - Check dependencies
   - Validate PWA configuration

2. Runtime Issues:
   - Check Functions logs
   - Monitor error tracking
   - Review performance metrics
   - Debug service worker

3. Deployment Issues:
   - Verify git connection
   - Check build configuration
   - Review environment variables
   - Test PWA installation

4. PWA-Specific Issues:
   - Verify manifest.json
   - Check service worker registration
   - Test offline functionality
   - Debug push notifications
   - Validate caching strategies
