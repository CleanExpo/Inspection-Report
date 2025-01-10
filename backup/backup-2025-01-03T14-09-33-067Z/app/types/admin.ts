export interface PhoneNumbers {
  primary: string;
  other?: string;
}

export interface AdminDetails {
  id?: string;
  phoneNumbers: PhoneNumbers;
  timeOnSite?: string;
  timeOffSite?: string;
  [key: string]: any; // For other fields checked by REQUIRED_FIELDS
}

export interface SaveDetailsResponse {
  error?: string;
  message?: string;
  data?: AdminDetails;
}

export const REQUIRED_FIELDS = [
  'phoneNumbers',
  'address',
  'contactName',
  'email'
];

export const PHONE_REGEX = /^\+?[\d\s-()]{10,}$/;
