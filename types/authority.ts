export interface AuthorityForm {
  id: string;
  jobId: string;
  formType: string;
  status: FormStatus;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  submittedBy?: string;
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  validation?: ValidationRule[];
  defaultValue?: any;
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  TEXTAREA = 'TEXTAREA',
  SIGNATURE = 'SIGNATURE'
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export enum ValidationType {
  REQUIRED = 'REQUIRED',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  MIN_VALUE = 'MIN_VALUE',
  MAX_VALUE = 'MAX_VALUE',
  PATTERN = 'PATTERN',
  CUSTOM = 'CUSTOM'
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isActive: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
  submittedBy: string;
  status: FormStatus;
  notes?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
  isRequired: boolean;
}

export interface FormValidationError {
  field: string;
  message: string;
  type: ValidationType;
  value?: any;
}

export interface FormMetadata {
  totalSubmissions: number;
  pendingReviews: number;
  lastSubmissionDate?: Date;
  averageCompletionTime?: number;
}
