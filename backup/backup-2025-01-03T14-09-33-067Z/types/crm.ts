import { Address } from './client';

export interface CRMClientData {
  id?: string;
  businessName?: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CRMError {
  message: string;
  code: string;
  details?: any;
}
