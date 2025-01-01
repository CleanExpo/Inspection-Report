import { NextApiRequest, NextApiResponse } from 'next';

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}

// Default CORS configuration
const defaultConfig: CorsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // 24 hours
  credentials: true,
};

// Endpoint-specific configurations
const endpointConfigs: Record<string, Partial<CorsConfig>> = {
  '/api/moisture': {
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  '/api/validate': {
    allowedMethods: ['POST', 'OPTIONS'],
  },
  '/api/generate': {
    allowedMethods: ['POST', 'OPTIONS'],
  },
};

function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => {
    // Handle wildcard subdomains
    if (allowed.startsWith('*.')) {
      const allowedDomain = allowed.slice(2);
      return origin.endsWith(allowedDomain);
    }
    return origin === allowed;
  });
}

export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
  endpoint?: string
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
    try {
      // Merge endpoint-specific config with default config
      const config: CorsConfig = {
        ...defaultConfig,
        ...(endpoint ? endpointConfigs[endpoint] : {}),
      };

      const requestOrigin = req.headers.origin;
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        // Check if origin is allowed
        if (requestOrigin && isOriginAllowed(requestOrigin, config.allowedOrigins)) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin);
          
          if (config.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          }

          res.setHeader('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
          res.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
          
          if (config.exposedHeaders) {
            res.setHeader('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
          }
          
          if (config.maxAge) {
            res.setHeader('Access-Control-Max-Age', config.maxAge.toString());
          }

          return res.status(204).end();
        }
        return res.status(403).json({ error: 'Origin not allowed' });
      }

      // Handle actual request
      if (requestOrigin && isOriginAllowed(requestOrigin, config.allowedOrigins)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        
        if (config.credentials) {
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        if (config.exposedHeaders) {
          res.setHeader('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
        }
      } else {
        return res.status(403).json({ error: 'Origin not allowed' });
      }

      // Check if method is allowed
      if (!config.allowedMethods.includes(req.method || 'GET')) {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Call the next handler
      return handler(req, res);
    } catch (error) {
      console.error('CORS Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
