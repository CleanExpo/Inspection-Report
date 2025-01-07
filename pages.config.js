/** @type {import('@cloudflare/pages').PagesConfig} */
module.exports = {
  // Build settings
  buildCommand: 'npm run build',
  outputDirectory: '.next',
  devCommand: 'npm run dev',
  installCommand: 'npm install',

  // Build configuration
  build: {
    baseDirectory: '.',
    command: 'npm run build',
    commandTimeout: 900, // 15 minutes
    outputDirectory: '.next',
    environment: {
      NODE_VERSION: '18',
    },
  },

  // Headers configuration
  headers: [
    {
      // Static Assets
      source: '/*.{js,css,jpg,jpeg,png,gif,ico,woff,woff2}',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      // PWA Assets
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600'
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        }
      ]
    },
    {
      source: '/icons/*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        }
      ]
    },
    {
      // Service Worker
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache'
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        }
      ]
    },
    {
      source: '/workbox-*.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        }
      ]
    },
    {
      // API Routes
      source: '/api/*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store'
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        }
      ]
    }
  ],

  // Advanced configuration
  advanced: {
    // Functions configuration
    functions: {
      maxDuration: 60, // seconds
      memory: 1024, // MB
    },
    // Build cache configuration
    cache: {
      enabled: true,
      maxAge: 86400, // 24 hours
    },
    // Security headers
    security: {
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "connect-src 'self' https://api.cloudflare.com",
          "manifest-src 'self'",
          "worker-src 'self'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  }
};
