export const ASCORA_CONFIG = {
  API_VERSION: 'v1',
  ENDPOINTS: {
    INSPECTIONS: '/inspections',
    DOCUMENTS: '/documents',
    ANALYSIS: '/analysis',
    VALIDATION: '/validation',
    TEMPLATES: '/templates',
    STANDARDS: '/standards'
  },
  DOCUMENT_TYPES: {
    PHOTO: 'photo',
    REPORT: 'report',
    AUTHORITY: 'authority',
    SAFETY: 'safety',
    OTHER: 'other'
  },
  ANALYSIS_TYPES: {
    DAMAGE: 'damage',
    MOISTURE: 'moisture',
    MOLD: 'mould',
    SAFETY: 'safety'
  },
  VALIDATION_RULES: {
    IICRC_S500: 'iicrc_s500',
    IICRC_S520: 'iicrc_s520',
    OSHA: 'osha',
    EPA: 'epa'
  },
  REPORT_FORMATS: {
    PDF: 'pdf',
    DOCX: 'docx'
  },
  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 20
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000 // 1 second
  }
};

export interface AscoraDocument {
  id: string;
  type: keyof typeof ASCORA_CONFIG.DOCUMENT_TYPES;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    inspectionId: string;
    section?: string;
    description?: string;
    tags?: string[];
    location?: string;
    timestamp: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

export interface AscoraAnalysis {
  id: string;
  inspectionId: string;
  type: keyof typeof ASCORA_CONFIG.ANALYSIS_TYPES;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    findings: string[];
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    metadata: Record<string, any>;
  };
  startedAt: string;
  completedAt?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AscoraValidation {
  id: string;
  inspectionId: string;
  rules: Array<keyof typeof ASCORA_CONFIG.VALIDATION_RULES>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    isValid: boolean;
    violations: Array<{
      rule: string;
      severity: 'warning' | 'error';
      message: string;
      recommendation?: string;
    }>;
    metadata: Record<string, any>;
  };
  startedAt: string;
  completedAt?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AscoraTemplate {
  id: string;
  name: string;
  description: string;
  type: 'report' | 'form' | 'checklist';
  format: keyof typeof ASCORA_CONFIG.REPORT_FORMATS;
  sections: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AscoraStandard {
  id: string;
  code: string;
  name: string;
  organization: string;
  version: string;
  description: string;
  requirements: Array<{
    id: string;
    section: string;
    description: string;
    type: 'mandatory' | 'recommended';
    metadata: Record<string, any>;
  }>;
  updatedAt: string;
}

export interface AscoraError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AscoraPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
