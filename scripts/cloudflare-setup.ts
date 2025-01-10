import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.cloudflare
config({ path: path.resolve(process.cwd(), '.env.cloudflare') });

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  accountId: string;
  serverIp: string;
  domain: string;
  cdnSubdomain: string;
  environment: string;
  browserCacheTtl: number;
  edgeCacheTtl: number;
  apiRateLimit: number;
}

// Validate required environment variables
function validateConfig(): CloudflareConfig {
  const required = [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ZONE_ID',
    'CLOUDFLARE_ACCOUNT_ID',
    'SERVER_IP',
    'DOMAIN'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    zoneId: process.env.CLOUDFLARE_ZONE_ID!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    serverIp: process.env.SERVER_IP!,
    domain: process.env.DOMAIN!,
    cdnSubdomain: process.env.CDN_SUBDOMAIN || 'cdn',
    environment: process.env.ENVIRONMENT || 'production',
    browserCacheTtl: parseInt(process.env.BROWSER_CACHE_TTL || '14400'),
    edgeCacheTtl: parseInt(process.env.EDGE_CACHE_TTL || '7200'),
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100')
  };
}

// Setup DNS records
async function setupDNS(config: CloudflareConfig) {
  console.log('Setting up DNS records...');
  
  const headers = {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  };

  // Add A record
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'A',
      name: '@',
      content: config.serverIp,
      proxied: true
    })
  });

  // Add CNAME for CDN
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'CNAME',
      name: config.cdnSubdomain,
      content: config.domain,
      proxied: true
    })
  });
}

// Configure SSL/TLS
async function setupSSL(config: CloudflareConfig) {
  console.log('Configuring SSL/TLS...');
  
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/settings/ssl`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: 'full'
    })
  });
}

// Configure cache rules
async function setupCache(config: CloudflareConfig) {
  console.log('Setting up cache rules...');
  
  const headers = {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  };

  // Set browser cache TTL
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/settings/browser_cache_ttl`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      value: config.browserCacheTtl
    })
  });

  // Configure edge cache
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/settings/cache_level`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      value: 'aggressive'
    })
  });
}

// Configure security headers
async function setupSecurity(config: CloudflareConfig) {
  console.log('Configuring security headers...');
  
  const headers = {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  };

  // Enable security headers
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/settings/security_header`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      value: {
        enabled: true,
        strict_transport_security: {
          enabled: true,
          max_age: 31536000,
          include_subdomains: true,
          preload: true
        }
      }
    })
  });

  // Set up rate limiting
  await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zoneId}/rate_limits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      disabled: false,
      description: 'API Rate Limiting',
      match: {
        request: {
          url_pattern: '*/api/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        }
      },
      threshold: config.apiRateLimit,
      period: 60,
      action: {
        mode: 'simulate',
        timeout: 60
      }
    })
  });
}

// Main setup function
async function setup() {
  try {
    console.log('Starting Cloudflare setup...');
    
    const config = validateConfig();
    
    await setupDNS(config);
    await setupSSL(config);
    await setupCache(config);
    await setupSecurity(config);
    
    console.log('Cloudflare setup completed successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

// Run setup
setup();
