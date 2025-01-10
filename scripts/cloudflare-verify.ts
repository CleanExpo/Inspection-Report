import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.cloudflare
config({ path: path.resolve(process.cwd(), '.env.cloudflare') });

interface VerificationResult {
  name: string;
  status: 'success' | 'failed';
  message: string;
}

async function verifyDNS(): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const records = data.result;

    const hasARecord = records.some((record: any) => 
      record.type === 'A' && record.name === process.env.DOMAIN
    );
    
    const hasCDNRecord = records.some((record: any) =>
      record.type === 'CNAME' && 
      record.name === `${process.env.CDN_SUBDOMAIN}.${process.env.DOMAIN}`
    );

    if (hasARecord && hasCDNRecord) {
      return {
        name: 'DNS Configuration',
        status: 'success',
        message: 'A and CNAME records are properly configured'
      };
    }

    return {
      name: 'DNS Configuration',
      status: 'failed',
      message: 'Missing required DNS records'
    };
  } catch (error) {
    return {
      name: 'DNS Configuration',
      status: 'failed',
      message: `Error verifying DNS: ${error}`
    };
  }
}

async function verifySSL(): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/settings/ssl`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const sslMode = data.result.value;

    if (sslMode === 'full') {
      return {
        name: 'SSL Configuration',
        status: 'success',
        message: 'SSL is properly configured in full mode'
      };
    }

    return {
      name: 'SSL Configuration',
      status: 'failed',
      message: `SSL is not in full mode (current: ${sslMode})`
    };
  } catch (error) {
    return {
      name: 'SSL Configuration',
      status: 'failed',
      message: `Error verifying SSL: ${error}`
    };
  }
}

async function verifyCache(): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/settings/cache_level`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const cacheLevel = data.result.value;

    if (cacheLevel === 'aggressive') {
      return {
        name: 'Cache Configuration',
        status: 'success',
        message: 'Cache is properly configured in aggressive mode'
      };
    }

    return {
      name: 'Cache Configuration',
      status: 'failed',
      message: `Cache is not in aggressive mode (current: ${cacheLevel})`
    };
  } catch (error) {
    return {
      name: 'Cache Configuration',
      status: 'failed',
      message: `Error verifying cache: ${error}`
    };
  }
}

async function verifySecurityHeaders(): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/settings/security_header`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const securityHeaders = data.result.value;

    if (securityHeaders.enabled && securityHeaders.strict_transport_security.enabled) {
      return {
        name: 'Security Headers',
        status: 'success',
        message: 'Security headers are properly configured'
      };
    }

    return {
      name: 'Security Headers',
      status: 'failed',
      message: 'Security headers are not properly configured'
    };
  } catch (error) {
    return {
      name: 'Security Headers',
      status: 'failed',
      message: `Error verifying security headers: ${error}`
    };
  }
}

async function verifyRateLimits(): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/rate_limits`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const rateLimits = data.result;

    const hasApiRateLimit = rateLimits.some((limit: any) => 
      limit.match.request.url_pattern === '*/api/*' && !limit.disabled
    );

    if (hasApiRateLimit) {
      return {
        name: 'Rate Limits',
        status: 'success',
        message: 'API rate limits are properly configured'
      };
    }

    return {
      name: 'Rate Limits',
      status: 'failed',
      message: 'API rate limits are not configured'
    };
  } catch (error) {
    return {
      name: 'Rate Limits',
      status: 'failed',
      message: `Error verifying rate limits: ${error}`
    };
  }
}

async function verify() {
  console.log('Starting Cloudflare configuration verification...\n');

  const verifications = [
    verifyDNS(),
    verifySSL(),
    verifyCache(),
    verifySecurityHeaders(),
    verifyRateLimits()
  ];

  const results = await Promise.all(verifications);
  let hasFailures = false;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.status === 'failed') hasFailures = true;
  });

  console.log('\nVerification complete!');
  
  if (hasFailures) {
    console.log('\n❌ Some verifications failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All configurations verified successfully!');
  }
}

// Run verification
verify().catch(error => {
  console.error('Error during verification:', error);
  process.exit(1);
});
