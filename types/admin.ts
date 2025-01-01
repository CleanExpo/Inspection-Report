export interface AdminDetails {
  id?: string;  // Added optional id field
  jobSupplier: string;
  orderNumber: string;
  dateContacted: string;
  timeContacted: string;
  claimDate: string;
  clientName: string;
  phoneNumbers: {
    primary: string;
    other: string;
  };
  tenantName: string;
  meetingOnSite: string;
  siteAddress: string;
  otherAddress: string;
  staffMembers: string[];
  timeOnSite: string;
  timeOffSite: string;
  claimType: string;
  category: string;
  policyNumber: string;
  propertyReference: string;
  causeOfLoss: string;
  otherTradesRequired: boolean;
  otherTrades: string;
  assessorAssigned: {
    assigned: boolean;
    name: string;
    contact: string;
  };
  jobNotes: string;
}

export interface FormErrors {
  [key: string]: string;
}

export type ClaimType = 'water' | 'fire' | 'storm' | 'impact' | 'other';

export type WaterCategory = '1' | '2' | '3' | 'na';

export const CLAIM_TYPES: { value: ClaimType; label: string }[] = [
  { value: 'water', label: 'Water Damage' },
  { value: 'fire', label: 'Fire Damage' },
  { value: 'storm', label: 'Storm Damage' },
  { value: 'impact', label: 'Impact Damage' },
  { value: 'other', label: 'Other' },
];

export const WATER_CATEGORIES: { value: WaterCategory; label: string }[] = [
  { value: '1', label: 'Category 1 - Clean Water' },
  { value: '2', label: 'Category 2 - Grey Water' },
  { value: '3', label: 'Category 3 - Black Water' },
  { value: 'na', label: 'Not Applicable' },
];

export const REQUIRED_FIELDS = [
  'jobSupplier',
  'orderNumber',
  'dateContacted',
  'timeContacted',
  'claimDate',
  'clientName',
  'siteAddress',
  'claimType',
] as const;

export const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

export interface APIResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export interface SaveDetailsResponse extends APIResponse<AdminDetails> {
  id?: string;
}
