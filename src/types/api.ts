export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
  error?: string;
}

export interface GenerateReportResponse {
  message: string;
  reportId: string;
  reportData: any;
  pdfUrl: string;
  generatedAt: string;
  status: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API Request types
export interface UploadImageRequest {
  imageBase64: string;
  imageName: string;
  type?: 'property' | 'claim';
  metadata?: Record<string, any>;
}

export interface GenerateReportRequest {
  jobNumber: string;
  inspectionDate: string;
  clientName: string;
  clientEmail?: string;
  propertyAddress: string;
  damageType: string;
  description: string;
  recommendations: string;
  inspectorName: string;
  propertyImage: string;
  claimImage: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD_IMAGE: '/api/uploadImage',
  GENERATE_REPORT: '/api/generateReport',
  GET_REPORT: (id: string) => `/api/reports/${id}`,
  LIST_REPORTS: '/api/reports',
  DELETE_REPORT: (id: string) => `/api/reports/${id}`,
  UPDATE_REPORT: (id: string) => `/api/reports/${id}`,
  SEND_EMAIL: '/api/sendEmail',
  GET_TEMPLATES: '/api/templates',
  CREATE_TEMPLATE: '/api/templates',
  UPDATE_TEMPLATE: (id: string) => `/api/templates/${id}`,
  DELETE_TEMPLATE: (id: string) => `/api/templates/${id}`,
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// API Status Codes
export const API_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// API Error Codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  PDF_GENERATION_ERROR: 'PDF_GENERATION_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  TEMPLATE_ERROR: 'TEMPLATE_ERROR',
} as const;
