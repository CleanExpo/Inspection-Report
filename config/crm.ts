interface CRMConfig {
  apiKey: string;
  baseUrl: string;
  version: string;
}

if (!process.env.CRM_API_KEY) {
  throw new Error('CRM_API_KEY environment variable is required');
}

if (!process.env.CRM_BASE_URL) {
  throw new Error('CRM_BASE_URL environment variable is required');
}

export const crmConfig: CRMConfig = {
  apiKey: process.env.CRM_API_KEY,
  baseUrl: process.env.CRM_BASE_URL,
  version: process.env.CRM_API_VERSION || 'v1'
};

export const getCRMHeaders = () => ({
  'Authorization': `Bearer ${crmConfig.apiKey}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const getCRMEndpoint = (path: string): string => {
  return `${crmConfig.baseUrl}/api/${crmConfig.version}/${path}`.replace(/\/+/g, '/');
};
