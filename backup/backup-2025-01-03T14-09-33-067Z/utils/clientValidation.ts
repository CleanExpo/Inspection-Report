import { ValidationError } from './errors';
import { AddressFormatter } from './addressFormatting';

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  abn?: string;
  preferredContact?: string;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class ClientValidator {
  private static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static PHONE_REGEX = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
  private static ABN_REGEX = /^\d{11}$/;

  static validateClient(data: Partial<ClientData>): ValidationResult {
    const errors: Record<string, string[]> = {};

    // Required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.name = ['Name must be at least 2 characters long'];
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.email = ['Email is required'];
    } else if (!this.EMAIL_REGEX.test(data.email)) {
      errors.email = ['Invalid email format'];
    }

    if (!data.phone || typeof data.phone !== 'string') {
      errors.phone = ['Phone number is required'];
    } else if (!this.PHONE_REGEX.test(data.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = ['Invalid Australian phone number format'];
    }

    if (!data.address || typeof data.address !== 'string') {
      errors.address = ['Address is required'];
    } else {
      const parsedAddress = AddressFormatter.parseAddress(data.address);
      if (!parsedAddress) {
        errors.address = ['Invalid Australian address format'];
      } else {
        // Validate postcode if provided
        if (parsedAddress.postcode && parsedAddress.state) {
          if (!AddressFormatter.validatePostcode(parsedAddress.postcode, parsedAddress.state)) {
            errors.address = ['Invalid postcode for the specified state'];
          }
        }
      }
    }

    // Optional fields
    if (data.company !== undefined && (typeof data.company !== 'string' || data.company.trim().length < 2)) {
      errors.company = ['Company name must be at least 2 characters long'];
    }

    if (data.abn !== undefined) {
      if (typeof data.abn !== 'string') {
        errors.abn = ['ABN must be a string'];
      } else {
        const cleanABN = data.abn.replace(/\s/g, '');
        if (!this.ABN_REGEX.test(cleanABN)) {
          errors.abn = ['Invalid ABN format - must be 11 digits'];
        } else if (!this.validateABN(cleanABN)) {
          errors.abn = ['Invalid ABN checksum'];
        }
      }
    }

    if (data.preferredContact !== undefined) {
      const validContacts = ['email', 'phone', 'sms'];
      if (!validContacts.includes(data.preferredContact.toLowerCase())) {
        errors.preferredContact = [`Preferred contact must be one of: ${validContacts.join(', ')}`];
      }
    }

    if (data.notes !== undefined && typeof data.notes !== 'string') {
      errors.notes = ['Notes must be a string'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static sanitizeClient(data: ClientData): ClientData {
    const sanitized = {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.replace(/[\s\-()]/g, ''),
      address: data.address,
      company: data.company?.trim(),
      abn: data.abn?.replace(/\s/g, ''),
      preferredContact: data.preferredContact?.toLowerCase(),
      notes: data.notes?.trim(),
    };

    // Try to standardize the address
    const parsedAddress = AddressFormatter.parseAddress(data.address);
    if (parsedAddress) {
      sanitized.address = AddressFormatter.formatAddress(parsedAddress);
    }

    return sanitized;
  }

  private static validateABN(abn: string): boolean {
    // ABN validation algorithm
    // https://abr.business.gov.au/Help/AbnFormat
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('').map(Number);
    
    // Subtract 1 from first digit
    digits[0]--;
    
    // Calculate weighted sum
    const sum = digits.reduce((acc, digit, index) => {
      return acc + (digit * weights[index]);
    }, 0);
    
    // Valid if sum is divisible by 89
    return sum % 89 === 0;
  }
}
