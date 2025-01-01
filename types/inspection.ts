import type { PhotoAttachment } from './photo';
import type { AuthorityFormData } from './authority';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  preserveExif?: boolean;
  autoRotate?: boolean;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  url?: string;
  error?: string;
}

export type InspectionStatus = 
  | 'draft'
  | 'in-progress'
  | 'completed'
  | 'on-hold'
  | 'cancelled'
  | 'pending-review'
  | 'approved'
  | 'rejected';

export interface InspectionImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  location?: string;
  tags?: string[];
}

export interface InspectionNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  type?: 'observation' | 'recommendation' | 'action';
  photos?: PhotoAttachment[];
}

export interface InspectionFormData {
  jobNumber: string;
  inspectionDate: string;
  inspector: string;
  location: string;
  notes: string;
  images: InspectionImage[];
  moistureReadings: {
    location: string;
    value: number;
    timestamp: string;
  }[];
  equipmentUsed: string[];
  recommendations?: string[];
  status: InspectionStatus;
}

export interface InspectionReport {
  id: string;
  jobNumber: string;
  inspectionDate: string;
  inspector: string;
  location: string;
  images: InspectionImage[];
  notes?: InspectionNote[];
  status: InspectionStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  authorityForms: {
    authorityToWork: boolean;
    authorityToDrill: boolean;
    authorityToDispose: boolean;
    workAuthority?: AuthorityFormData;
    drillAuthority?: AuthorityFormData;
    disposeAuthority?: AuthorityFormData;
  };
}

export interface InspectionArea {
  id: string;
  name: string;
  damageType?: string;
  severity?: 'low' | 'medium' | 'high';
  affectedMaterials?: string[];
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    area?: number;
  };
  moistureReadings?: {
    value: number;
    location: string;
    timestamp: string;
  }[];
  notes?: string;
  images?: InspectionImage[];
}

export interface InspectionEquipment {
  id: string;
  type: string;
  serialNumber?: string;
  location: string;
  installationDate: string;
  removalDate?: string;
  readings?: {
    timestamp: string;
    value: number;
    unit: string;
  }[];
  notes?: string;
}

export interface InspectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface InspectionSummary {
  totalAreas: number;
  affectedMaterials: string[];
  equipmentCount: number;
  moistureReadings: {
    min: number;
    max: number;
    average: number;
  };
  recommendations?: string[];
  estimatedDryingTime?: number;
}

export interface CRMResponse {
  data: InspectionReport[];
  total: number;
  page: number;
  pageSize: number;
}
