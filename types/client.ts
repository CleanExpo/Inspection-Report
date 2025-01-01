export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ClientData {
  businessName?: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
