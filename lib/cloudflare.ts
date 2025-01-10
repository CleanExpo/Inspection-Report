import { z } from 'zod';

const envSchema = z.object({
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_ZONE_ID: z.string().length(32),
  CLOUDFLARE_ACCOUNT_ID: z.string().length(32),
});

export type CloudflareEnvConfig = z.infer<typeof envSchema>;

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  accountId: string;
}

export class CloudflareClient {
  private baseUrl = 'https://api.cloudflare.com/client/v4';
  private config: CloudflareConfig;

  constructor(envConfig: CloudflareEnvConfig) {
    const result = envSchema.safeParse(envConfig);
    if (!result.success) {
      throw new Error(`Invalid Cloudflare configuration: ${result.error.message}`);
    }
    this.config = {
      apiToken: envConfig.CLOUDFLARE_API_TOKEN,
      zoneId: envConfig.CLOUDFLARE_ZONE_ID,
      accountId: envConfig.CLOUDFLARE_ACCOUNT_ID,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Cloudflare API error: ${response.status} ${
          data.errors?.[0]?.message || response.statusText
        }`
      );
    }

    return data.result;
  }

  async setupCDN() {
    // Configure SSL/TLS
    await this.request(`/zones/${this.config.zoneId}/settings/ssl`, {
      method: 'PATCH',
      body: JSON.stringify({
        value: 'strict'
      })
    });

    // Configure cache rules
    await this.request(`/zones/${this.config.zoneId}/cache/rules`, {
      method: 'POST',
      body: JSON.stringify({
        rules: [
          {
            expression: '(http.request.uri.path matches "^/api/.*")',
            description: 'Do not cache API endpoints',
            action: 'bypass_cache',
            enabled: true
          },
          {
            expression: '(http.request.uri.path matches "^/cdn/.*")',
            description: 'Cache CDN assets',
            action: 'cache_everything',
            enabled: true,
            cache_ttl: 86400 // 24 hours
          }
        ]
      })
    });

    // Configure security headers
    await this.request(`/zones/${this.config.zoneId}/settings/security_header`, {
      method: 'PATCH',
      body: JSON.stringify({
        value: {
          strict_transport_security: {
            enabled: true,
            max_age: 31536000,
            include_subdomains: true,
            preload: true
          },
          x_content_type_options: {
            enabled: true
          },
          x_frame_options: {
            enabled: true,
            value: 'DENY'
          },
          x_xss_protection: {
            enabled: true,
            value: '1; mode=block'
          }
        }
      })
    });

    // Configure rate limiting
    await this.request(`/zones/${this.config.zoneId}/rate_limits`, {
      method: 'POST',
      body: JSON.stringify({
        disabled: false,
        description: 'API rate limiting',
        match: {
          request: {
            url_pattern: '/api/*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
          }
        },
        threshold: 100,
        period: 60,
        action: {
          mode: 'simulate',
          timeout: 60
        }
      })
    });
  }

  async verifySetup(): Promise<{
    ssl: boolean;
    cacheRules: boolean;
    securityHeaders: boolean;
    rateLimits: boolean;
  }> {
    const results = await Promise.all([
      // Check SSL settings
      this.request<{ value: string }>(
        `/zones/${this.config.zoneId}/settings/ssl`
      ),
      // Check cache rules
      this.request<{ rules: unknown[] }>(
        `/zones/${this.config.zoneId}/cache/rules`
      ),
      // Check security headers
      this.request<{ value: unknown }>(
        `/zones/${this.config.zoneId}/settings/security_header`
      ),
      // Check rate limits
      this.request<{ result: unknown[] }>(
        `/zones/${this.config.zoneId}/rate_limits`
      )
    ]);

    return {
      ssl: results[0].value === 'strict',
      cacheRules: Array.isArray(results[1].rules) && results[1].rules.length > 0,
      securityHeaders: !!results[2].value,
      rateLimits: Array.isArray(results[3].result) && results[3].result.length > 0
    };
  }

  async purgeCache(urls?: string[]) {
    await this.request(`/zones/${this.config.zoneId}/purge_cache`, {
      method: 'POST',
      body: JSON.stringify(
        urls ? { files: urls } : { purge_everything: true }
      )
    });
  }

  // Pages API methods
  async createPagesProject(projectName: string) {
    try {
      await this.request(`/accounts/${this.config.accountId}/pages/projects/${projectName}`, {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          production_branch: 'main'
        })
      });
      return true;
    } catch (error) {
      if ((error as Error).message.includes('already exists')) {
        return true;
      }
      throw error;
    }
  }

  async configurePagesProject(projectName: string, config: {
    buildCommand: string;
    destinationDir: string;
    rootDir: string;
    envVars: Record<string, string>;
  }) {
    await this.request(
      `/accounts/${this.config.accountId}/pages/projects/${projectName}/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          build_config: {
            build_command: config.buildCommand,
            destination_dir: config.destinationDir,
            root_dir: config.rootDir
          },
          deployment_configs: {
            production: {
              env_vars: config.envVars
            }
          }
        })
      }
    );
  }

  async getPagesProject(projectName: string) {
    return this.request(
      `/accounts/${this.config.accountId}/pages/projects/${projectName}`
    );
  }
}

export async function createCloudflareClient(): Promise<CloudflareClient> {
  const envConfig: CloudflareEnvConfig = {
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN!,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID!,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  };

  return new CloudflareClient(envConfig);
}
