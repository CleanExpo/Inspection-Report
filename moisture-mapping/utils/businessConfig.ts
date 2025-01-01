import { BusinessConfig, BusinessSettings, BusinessLocation } from '../types/business';

export const defaultBusinessConfig: BusinessConfig = {
  id: '',
  companyName: '',
  abn: '',
  location: {
    address: '',
    suburb: '',
    state: '',
    postcode: ''
  },
  branding: {
    logo: '/default-logo.png',
    colors: {
      primary: '#00539B',
      secondary: '#FFD700'
    }
  },
  contactDetails: {
    phone: '',
    email: '',
    website: ''
  },
  certifications: {
    iicrc: false,
    iso: false,
    other: []
  }
};

export const defaultBusinessSettings: BusinessSettings = {
  ...defaultBusinessConfig,
  preferences: {
    defaultMaterialTypes: ['drywall', 'wood', 'concrete'],
    defaultDevices: ['protimeter', 'tramex'],
    autoFinalizeDays: false,
    requirePhotos: true,
    requireNotes: false
  },
  reporting: {
    logo: {
      position: 'left',
      size: 'medium'
    },
    includeGraphs: true,
    includeMaterialLegend: true,
    includePhotos: true,
    includeNotes: true,
    includeIICRCGuidelines: true
  }
};

export function validateABN(abn: string): boolean {
  // Remove spaces and non-numeric characters
  const cleanABN = abn.replace(/[^0-9]/g, '');
  
  // ABN must be 11 digits
  if (cleanABN.length !== 11) {
    return false;
  }

  // Apply ABN validation algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  // Subtract 1 from first digit
  const digits = cleanABN.split('').map(Number);
  digits[0]--;

  // Calculate weighted sum
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }

  return sum % 89 === 0;
}

export function validateBusinessConfig(config: Partial<BusinessConfig>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!config.companyName?.trim()) {
    errors.push('Company name is required');
  }

  if (!config.abn?.trim()) {
    errors.push('ABN is required');
  } else if (!validateABN(config.abn)) {
    errors.push('Invalid ABN format');
  }

  // Location validation
  if (config.location) {
    if (!config.location.address?.trim()) {
      errors.push('Business address is required');
    }
    if (!config.location.suburb?.trim()) {
      errors.push('Suburb is required');
    }
    if (!config.location.state?.trim()) {
      errors.push('State is required');
    }
    if (!config.location.postcode?.trim()) {
      errors.push('Postcode is required');
    } else if (!/^\d{4}$/.test(config.location.postcode)) {
      errors.push('Invalid postcode format');
    }
  } else {
    errors.push('Business location is required');
  }

  // Contact details validation
  if (config.contactDetails) {
    if (!config.contactDetails.phone?.trim()) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s-]{8,}$/.test(config.contactDetails.phone)) {
      errors.push('Invalid phone number format');
    }

    if (!config.contactDetails.email?.trim()) {
      errors.push('Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactDetails.email)) {
      errors.push('Invalid email format');
    }

    if (config.contactDetails.website && 
        !/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(config.contactDetails.website)) {
      errors.push('Invalid website URL format');
    }
  } else {
    errors.push('Contact details are required');
  }

  return errors;
}

export function applyBusinessTheme(settings: BusinessSettings): void {
  // Apply primary color to CSS variables
  document.documentElement.style.setProperty(
    '--primary-color', 
    settings.branding.colors.primary
  );
  
  // Apply secondary color to CSS variables
  document.documentElement.style.setProperty(
    '--secondary-color', 
    settings.branding.colors.secondary
  );
}

export function formatABN(abn: string): string {
  const cleaned = abn.replace(/[^0-9]/g, '');
  if (cleaned.length !== 11) return abn;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
}

export function getBusinessDisplayName(config: BusinessConfig): string {
  return `${config.companyName} (ABN: ${formatABN(config.abn)})`;
}

export function getBusinessAddress(location: BusinessLocation): string {
  return `${location.address}, ${location.suburb} ${location.state} ${location.postcode}`;
}
