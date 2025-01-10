export interface SystemSettings {
  general: GeneralSettings;
  inspection: InspectionSettings;
  notifications: NotificationSettings;
  integration: IntegrationSettings;
  security: SecuritySettings;
  backup: BackupSettings;
}

export interface GeneralSettings {
  companyName: string;
  timezone: string;
  dateFormat: string;
  language: string;
  currency: string;
  measurementUnit: 'metric' | 'imperial';
}

export interface InspectionSettings {
  defaultTemplate: string;
  autoSaveInterval: number; // minutes
  requirePhotos: boolean;
  photoQualityMin: number;
  maxPhotosPerInspection: number;
  allowDraftSave: boolean;
  requireClientSignature: boolean;
  requireInspectorSignature: boolean;
  defaultDueDateDays: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyOnNewInspection: boolean;
  notifyOnInspectionComplete: boolean;
  notifyOnClientComment: boolean;
  notifyOnDueDate: boolean;
  reminderDays: number[];
}

export interface IntegrationSettings {
  ascoraEnabled: boolean;
  ascoraApiKey?: string;
  ascoraEndpoint?: string;
  googleMapsEnabled: boolean;
  googleMapsApiKey?: string;
  weatherApiEnabled: boolean;
  weatherApiKey?: string;
  documentScanningEnabled: boolean;
  documentScanningProvider?: string;
}

export interface SecuritySettings {
  requireMfa: boolean;
  sessionTimeout: number; // minutes
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordRequireNumber: boolean;
  passwordRequireUppercase: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionPeriod: number; // days
  includePhotos: boolean;
  backupLocation: 'local' | 'cloud';
  cloudProvider?: string;
  cloudCredentials?: {
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
  };
}

export type SettingCategory = 
  | 'general'
  | 'inspection'
  | 'notifications'
  | 'integration'
  | 'security'
  | 'backup';

export interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'time' | 'password' | 'multiselect';
  description?: string;
  options?: { label: string; value: string | number }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  sensitive?: boolean;
  category: SettingCategory;
}
