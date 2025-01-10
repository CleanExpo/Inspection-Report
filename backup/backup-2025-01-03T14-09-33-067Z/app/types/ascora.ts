export interface AscoraJob {
  jobId: string;
  propertyDetails: {
    address: string;
    propertyType: string;
    contactName: string;
    contactPhone: string;
  };
  insuranceDetails: {
    company: string;
    policyNumber: string;
    claimNumber: string;
  };
  jobStatus: 'pending' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AscoraVerifyJobResponse {
  success: boolean;
  job?: AscoraJob;
  error?: {
    code: string;
    message: string;
  };
}

export interface AscoraError {
  code: string;
  message: string;
}

// Cache configuration
export interface AscoraJobCache {
  job: AscoraJob;
  timestamp: number;
}

// API Response types
export interface VerifyJobResponse {
  success: boolean;
  job?: AscoraJob;
  error?: AscoraError;
  cached?: boolean;
}

// Configuration types
export interface AscoraConfig {
  apiKey: string;
  apiUrl: string;
  cacheTimeout: number; // in milliseconds
}
