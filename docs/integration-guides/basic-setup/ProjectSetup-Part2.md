# Basic Setup Guide - Part 2: Environment Setup & Advanced Configuration

## Environment Configuration

### Environment Variables Setup

```bash
# Create environment files
touch .env.local .env.development .env.production .env.test
```

```plaintext
# .env.local example
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ASSET_PREFIX=
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
```

### Environment Type Definitions

```typescript
// src/types/environment.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ASSET_PREFIX: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
```

## Advanced Configuration

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Middleware Configuration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Build Optimization

```javascript
// next.config.js
module.exports = {
  // Enable production source maps
  productionBrowserSourceMaps: true,

  // Configure build output
  output: 'standalone',

  // Optimize images
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['your-image-domain.com'],
    path: '/_next/image',
    loader: 'default',
    disableStaticImages: false,
  },

  // Configure webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
      })
    );

    return config;
  },
};
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Report Web Vitals
    const reportWebVitals = (metric: any) => {
      console.log(metric);
      // Send to analytics
    };

    // Initialize performance observer
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('Performance Entry:', entry);
      });
    });

    perfObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

    return reportWebVitals;
  }
};
```

### Error Handling Setup

```typescript
// src/pages/_error.tsx
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
```

### Development Tools Configuration

```typescript
// src/utils/development.ts
export const setupDevTools = () => {
  if (process.env.NODE_ENV === 'development') {
    // Enable React Developer Tools
    if (typeof window !== 'undefined') {
      const whyDidYouRender = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, {
        trackAllPureComponents: true,
      });
    }

    // Enable API mocking in development
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      require('../mocks');
    }
  }
};
```

## Testing Setup

### Integration Test Configuration

```typescript
// integration.config.ts
import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
  testMatch: ['**/*.integration.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};

export default config;
```

### E2E Test Configuration

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'Safari',
      use: { browserName: 'webkit' },
    },
  ],
};

export default config;
```

## Deployment Configuration

### Docker Setup

```dockerfile
# Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### CI/CD Configuration

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      # Add your deployment steps here
```

## Best Practices

1. **Environment Management**
   - Use different environment files for different stages
   - Never commit sensitive environment variables
   - Validate environment variables at startup

2. **Security**
   - Implement proper security headers
   - Use HTTPS in production
   - Regularly update dependencies

3. **Performance**
   - Enable source maps in production
   - Optimize images and assets
   - Monitor performance metrics

4. **Testing**
   - Maintain different configurations for unit, integration, and E2E tests
   - Use CI/CD pipelines
   - Implement proper test coverage

5. **Deployment**
   - Use Docker for consistent environments
   - Implement proper CI/CD workflows
   - Monitor application in production
