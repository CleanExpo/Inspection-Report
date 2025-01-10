import type { PhotoAttachment } from './photo';

export interface AuthorityFormData {
  jobNumber: string;
  clientName: string;
  propertyAddress: string;
  authorizedBy: string;
  authorizedDate: string;
  scope: string;
  conditions?: string;
  signature?: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}

export interface AuthorityResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface AuthorityValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export interface AuthorityDocument {
  id: string;
  jobNumber: string;
  type: 'commence' | 'completion' | 'variation';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  data: AuthorityFormData;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface AuthoritySearchParams {
  jobNumber?: string;
  type?: 'commence' | 'completion' | 'variation';
  status?: 'pending' | 'approved' | 'rejected';
  dateFrom?: string;
  dateTo?: string;
}

export interface AuthoritySearchResult {
  total: number;
  page: number;
  pageSize: number;
  results: AuthorityDocument[];
}

export const validateAuthorityForm = (data: AuthorityFormData): AuthorityValidationResult => {
  const errors: ValidationErrors = {};

  if (!data.jobNumber) {
    errors.jobNumber = ['Job number is required'];
  } else if (!/^\d{6}-\d{2}$/.test(data.jobNumber)) {
    errors.jobNumber = ['Invalid job number format. Expected format: XXXXXX-XX'];
  }

  if (!data.clientName) {
    errors.clientName = ['Client name is required'];
  }

  if (!data.propertyAddress) {
    errors.propertyAddress = ['Property address is required'];
  }

  if (!data.authorizedBy) {
    errors.authorizedBy = ['Authorization name is required'];
  }

  if (!data.authorizedDate) {
    errors.authorizedDate = ['Authorization date is required'];
  } else {
    const date = new Date(data.authorizedDate);
    if (isNaN(date.getTime())) {
      errors.authorizedDate = ['Invalid authorization date'];
    }
  }

  if (!data.scope) {
    errors.scope = ['Scope of work is required'];
  }

  if (!data.signature) {
    errors.signature = ['Signature is required'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
