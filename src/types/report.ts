export interface Report {
  id: string;
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
  pdfUrl?: string;
  status: ReportStatus;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'emailed' | 'error';

export interface ReportFormData {
  jobNumber: string;
  inspectionDate: string;
  clientName: string;
  clientEmail?: string;
  propertyAddress: string;
  damageType: string;
  description: string;
  recommendations: string;
  inspectorName: string;
}

export interface ReportImages {
  propertyImage: string | null;
  claimImage: string | null;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'image' | 'checklist' | 'signature';
  required: boolean;
  order: number;
  defaultValue?: string;
  options?: string[];
}
