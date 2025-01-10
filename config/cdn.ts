import { env } from '../utils/env';

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'cloudfront' | 'custom';
  domain: string;
  paths: {
    images: string;
    documents: string;
    assets: string;
  };
  cacheControl: {
    images: string;
    documents: string;
    assets: string;
  };
}

const defaultConfig: CDNConfig = {
  enabled: false,
  provider: 'cloudflare',
  domain: '',
  paths: {
    images: '/images',
    documents: '/documents',
    assets: '/assets',
  },
  cacheControl: {
    images: 'public, max-age=31536000, immutable',
    documents: 'public, max-age=86400, must-revalidate',
    assets: 'public, max-age=31536000, immutable',
  },
};

export const cdnConfig: CDNConfig = {
  enabled: !!env.CDN_URL,
  provider: (env.CDN_PROVIDER as CDNConfig['provider']) || defaultConfig.provider,
  domain: env.CDN_URL || defaultConfig.domain,
  paths: {
    images: `${env.CDN_URL || ''}${defaultConfig.paths.images}`,
    documents: `${env.CDN_URL || ''}${defaultConfig.paths.documents}`,
    assets: `${env.CDN_URL || ''}${defaultConfig.paths.assets}`,
  },
  cacheControl: defaultConfig.cacheControl,
};

// Helper functions for CDN URLs
export const getCDNUrl = (path: string): string => {
  if (!cdnConfig.enabled) return path;
  return `${cdnConfig.domain}${path}`;
};

export const getImageUrl = (path: string): string => {
  return getCDNUrl(`${cdnConfig.paths.images}${path}`);
};

export const getDocumentUrl = (path: string): string => {
  return getCDNUrl(`${cdnConfig.paths.documents}${path}`);
};

export const getAssetUrl = (path: string): string => {
  return getCDNUrl(`${cdnConfig.paths.assets}${path}`);
};

// Cache control helpers
export const getCacheControl = (type: keyof CDNConfig['cacheControl']): string => {
  return cdnConfig.cacheControl[type];
};

// CDN health check
export const checkCDNHealth = async (): Promise<boolean> => {
  if (!cdnConfig.enabled) return true;
  
  try {
    const response = await fetch(cdnConfig.domain);
    return response.ok;
  } catch (error) {
    console.error('CDN health check failed:', error);
    return false;
  }
};

// CDN configuration validation
export const validateCDNConfig = (): boolean => {
  if (!cdnConfig.enabled) return true;

  const requiredFields = ['domain', 'provider'];
  const missingFields = requiredFields.filter(field => !cdnConfig[field as keyof CDNConfig]);

  if (missingFields.length > 0) {
    console.error('Missing required CDN configuration fields:', missingFields);
    return false;
  }

  return true;
};
