import { 
  SystemSettings, 
  SettingCategory, 
  SettingField,
  GeneralSettings,
  InspectionSettings,
  NotificationSettings,
  IntegrationSettings,
  SecuritySettings,
  BackupSettings
} from '../types/settings';

export class SettingsService {
  private static instance: SettingsService;
  
  // Mock initial settings
  private settings: SystemSettings = {
    general: {
      companyName: 'DRQ Inspection Services',
      timezone: 'Australia/Melbourne',
      dateFormat: 'DD/MM/YYYY',
      language: 'en-AU',
      currency: 'AUD',
      measurementUnit: 'metric'
    },
    inspection: {
      defaultTemplate: 'commercial-property',
      autoSaveInterval: 5,
      requirePhotos: true,
      photoQualityMin: 1200,
      maxPhotosPerInspection: 50,
      allowDraftSave: true,
      requireClientSignature: true,
      requireInspectorSignature: true,
      defaultDueDateDays: 7
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      notifyOnNewInspection: true,
      notifyOnInspectionComplete: true,
      notifyOnClientComment: true,
      notifyOnDueDate: true,
      reminderDays: [1, 3, 7]
    },
    integration: {
      ascoraEnabled: true,
      ascoraApiKey: 'mock-key',
      ascoraEndpoint: 'https://api.ascora.com/v1',
      googleMapsEnabled: true,
      googleMapsApiKey: 'mock-key',
      weatherApiEnabled: true,
      weatherApiKey: 'mock-key',
      documentScanningEnabled: true,
      documentScanningProvider: 'azure'
    },
    security: {
      requireMfa: true,
      sessionTimeout: 30,
      passwordMinLength: 12,
      passwordRequireSpecialChar: true,
      passwordRequireNumber: true,
      passwordRequireUppercase: true,
      passwordExpiryDays: 90,
      maxLoginAttempts: 5,
      ipWhitelist: []
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '00:00',
      retentionPeriod: 30,
      includePhotos: true,
      backupLocation: 'cloud',
      cloudProvider: 'aws',
      cloudCredentials: {
        accessKey: 'mock-key',
        secretKey: 'mock-secret',
        bucket: 'drq-backups'
      }
    }
  };

  // Field definitions for the settings UI
  private settingFields: SettingField[] = [
    // General Settings
    {
      key: 'companyName',
      label: 'Company Name',
      type: 'text',
      description: 'Your company name as it appears on reports',
      validation: { required: true },
      category: 'general'
    },
    {
      key: 'timezone',
      label: 'Timezone',
      type: 'select',
      options: [
        { label: 'Melbourne (AEST/AEDT)', value: 'Australia/Melbourne' },
        { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
        { label: 'Brisbane (AEST)', value: 'Australia/Brisbane' }
      ],
      category: 'general'
    },
    {
      key: 'dateFormat',
      label: 'Date Format',
      type: 'select',
      options: [
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
      ],
      category: 'general'
    },
    // Inspection Settings
    {
      key: 'defaultTemplate',
      label: 'Default Template',
      type: 'select',
      options: [
        { label: 'Commercial Property', value: 'commercial-property' },
        { label: 'Residential Property', value: 'residential-property' }
      ],
      category: 'inspection'
    },
    {
      key: 'autoSaveInterval',
      label: 'Auto-save Interval (minutes)',
      type: 'number',
      validation: { min: 1, max: 60 },
      category: 'inspection'
    },
    {
      key: 'requirePhotos',
      label: 'Require Photos',
      type: 'boolean',
      description: 'Require at least one photo per inspection',
      category: 'inspection'
    },
    // Integration Settings
    {
      key: 'ascoraApiKey',
      label: 'ASCORA API Key',
      type: 'password',
      sensitive: true,
      category: 'integration'
    },
    {
      key: 'ascoraEnabled',
      label: 'Enable ASCORA Integration',
      type: 'boolean',
      category: 'integration'
    },
    // Security Settings
    {
      key: 'requireMfa',
      label: 'Require Multi-Factor Authentication',
      type: 'boolean',
      category: 'security'
    },
    {
      key: 'passwordMinLength',
      label: 'Minimum Password Length',
      type: 'number',
      validation: { min: 8, max: 128 },
      category: 'security'
    },
    // Backup Settings
    {
      key: 'autoBackup',
      label: 'Enable Automatic Backups',
      type: 'boolean',
      category: 'backup'
    },
    {
      key: 'backupFrequency',
      label: 'Backup Frequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
      ],
      category: 'backup'
    }
  ];

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async getSettings(): Promise<SystemSettings> {
    // In production, this would fetch from an API
    return Promise.resolve(this.settings);
  }

  public async updateSettings<T extends SettingCategory>(
    category: T,
    updates: Partial<SystemSettings[T]>
  ): Promise<void> {
    // In production, this would be an API call
    this.settings[category] = {
      ...this.settings[category],
      ...updates
    } as SystemSettings[T];
    return Promise.resolve();
  }

  public async resetSettings(category: SettingCategory): Promise<void> {
    // In production, this would be an API call
    // For now, just log the action
    console.log(`Reset settings for category: ${category}`);
    return Promise.resolve();
  }

  public getSettingFields(category: SettingCategory): SettingField[] {
    return this.settingFields.filter(field => field.category === category);
  }

  public getAllSettingFields(): SettingField[] {
    return this.settingFields;
  }

  public validateSetting(field: SettingField, value: any): string | null {
    if (!field.validation) return null;

    if (field.validation.required && !value) {
      return field.validation.message || 'This field is required';
    }

    if (typeof value === 'number') {
      if (field.validation.min !== undefined && value < field.validation.min) {
        return `Value must be at least ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && value > field.validation.max) {
        return `Value must be no more than ${field.validation.max}`;
      }
    }

    if (field.validation.pattern && typeof value === 'string') {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return field.validation.message || 'Invalid format';
      }
    }

    return null;
  }
}
