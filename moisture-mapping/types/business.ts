export interface BusinessLocation {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface BusinessBranding {
  logo: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface BusinessConfig {
  id: string;
  companyName: string;
  abn: string;
  location: BusinessLocation;
  branding: BusinessBranding;
  contactDetails: {
    phone: string;
    email: string;
    website?: string;
  };
  certifications: {
    iicrc: boolean;
    iso: boolean;
    other: string[];
  };
}

export interface BusinessSettings extends BusinessConfig {
  preferences: {
    defaultMaterialTypes: string[];
    defaultDevices: string[];
    autoFinalizeDays: boolean;
    requirePhotos: boolean;
    requireNotes: boolean;
  };
  reporting: {
    logo: {
      position: 'left' | 'center' | 'right';
      size: 'small' | 'medium' | 'large';
    };
    includeGraphs: boolean;
    includeMaterialLegend: boolean;
    includePhotos: boolean;
    includeNotes: boolean;
    includeIICRCGuidelines: boolean;
  };
}
