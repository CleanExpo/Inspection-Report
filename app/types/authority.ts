export type AuthorityFormType = 
  | 'water_damage'
  | 'mould_remediation'
  | 'fire_damage'
  | 'biohazard_cleanup'
  | 'general_authority'
  | 'commence_authority'
  | 'dispose_authority'
  | 'satisfaction_certificate';

export type AuthorityFormStatus = 'draft' | 'pending' | 'signed' | 'archived';

export type AuthorityFormFieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'checkbox_with_text'
  | 'signature'
  | 'dynamic'
  | 'textarea'
  | 'file';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuthorityFormField {
  id: string;
  type: AuthorityFormFieldType;
  label: string;
  dynamicKey?: string;
  associatedText?: string;
  defaultValue?: string;
  isRequired: boolean;
  order: number;
}

export interface AuthorityFormSection {
  id: string;
  title: string;
  description?: string;
  fields: AuthorityFormField[];
  isRequired: boolean;
  order: number;
}

export interface AuthorityFormTemplate {
  id: string;
  type: AuthorityFormType;
  title: string;
  description: string;
  sections: AuthorityFormSection[];
  version: string;
  lastUpdated: string;
  isActive: boolean;
  riskLevel: RiskLevel;
}

export interface AuthorityFormSignature {
  name: string;
  signature: string;
  date: string;
}

export interface AuthorityForm {
  id: string;
  templateId: string;
  type: AuthorityFormType;
  status: AuthorityFormStatus;
  clientId: string;
  inspectionId: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  data: { [key: string]: any };
  signatures: {
    client?: AuthorityFormSignature;
    technician?: AuthorityFormSignature;
  };
  jobData?: {
    customerName?: string;
    propertyAddress?: string;
    claimNumber?: string;
    technicianName?: string;
  };
  riskLevel: RiskLevel;
}

export interface AuthorityFormValidation {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface AuthorityFormSubmission {
  formId: string;
  clientSignature?: AuthorityFormSignature;
  technicianSignature?: AuthorityFormSignature;
}
