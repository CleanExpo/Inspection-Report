export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  preferredContact?: string;
}

export interface PropertyDetails {
  address: string;
  propertyType: string;
  dateOfLoss: string;
  typeOfLoss: string;
  buildingAge?: number;
  squareFootage?: number;
}

export interface DamageAssessment {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedAreas: string[];
  recommendations: string;
  estimatedArea?: number;
  notes?: string;
}

export interface InspectionFormValues {
  clientInfo: ClientInfo;
  propertyDetails: PropertyDetails;
  damageAssessment: DamageAssessment;
  photos: File[];
}

export type FormSection = keyof InspectionFormValues;

export interface FormSectionConfig {
  id: FormSection;
  title: string;
  icon: string;
  isComplete: boolean;
}

export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type SeverityLevel = typeof SEVERITY_LEVELS[number];

export const PROPERTY_TYPES = [
  'residential',
  'commercial',
  'industrial',
  'multi-unit',
  'other'
] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

export const DAMAGE_TYPES = [
  'water',
  'fire',
  'mold',
  'storm',
  'flood',
  'other'
] as const;
export type DamageType = typeof DAMAGE_TYPES[number];

export const CONTACT_METHODS = [
  'email',
  'phone',
  'sms'
] as const;
export type ContactMethod = typeof CONTACT_METHODS[number];

export const AFFECTED_AREAS = [
  'walls',
  'ceiling',
  'floor',
  'basement',
  'attic',
  'kitchen',
  'bathroom',
  'living_room',
  'bedroom',
  'exterior',
  'roof',
  'foundation',
  'hvac_system',
  'plumbing',
  'electrical'
] as const;
export type AffectedArea = typeof AFFECTED_AREAS[number];

export interface PhotoFile extends File {
  preview?: string;
}
