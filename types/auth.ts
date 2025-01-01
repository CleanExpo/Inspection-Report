export type UserRole = 'developer' | 'manager' | 'admin' | 'technician';

export interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  execute: boolean;
}

export interface RolePermissions {
  [key: string]: {
    [key: string]: Permission;
  };
}

// Define all possible sections in the application
export const APP_SECTIONS = {
  DEVELOPMENT: 'development', // Platform development, code access
  SYSTEM_CONFIG: 'systemConfig', // System configuration
  USER_MANAGEMENT: 'userManagement', // User management
  MOISTURE_MAPPING: 'moistureMapping', // Moisture mapping functionality
  REPORTS: 'reports', // Report generation and management
  EQUIPMENT: 'equipment', // Equipment management
  CLIENT_DATA: 'clientData', // Client information
  PHOTOS: 'photos', // Photo management
  VOICE_COMMANDS: 'voiceCommands', // Voice command system
  AI_ANALYSIS: 'aiAnalysis', // AI analysis features
  TEMPLATES: 'templates', // Report templates
  STANDARDS: 'standards', // Industry standards
} as const;

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  developer: {
    [APP_SECTIONS.DEVELOPMENT]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.SYSTEM_CONFIG]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.USER_MANAGEMENT]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.MOISTURE_MAPPING]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.REPORTS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.EQUIPMENT]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.CLIENT_DATA]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.PHOTOS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.VOICE_COMMANDS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.AI_ANALYSIS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.TEMPLATES]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.STANDARDS]: { read: true, write: true, delete: true, execute: true },
  },
  manager: {
    [APP_SECTIONS.DEVELOPMENT]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.SYSTEM_CONFIG]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.USER_MANAGEMENT]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.MOISTURE_MAPPING]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.REPORTS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.EQUIPMENT]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.CLIENT_DATA]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.PHOTOS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.VOICE_COMMANDS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.AI_ANALYSIS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.TEMPLATES]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.STANDARDS]: { read: true, write: true, delete: true, execute: true },
  },
  admin: {
    [APP_SECTIONS.DEVELOPMENT]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.SYSTEM_CONFIG]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.USER_MANAGEMENT]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.MOISTURE_MAPPING]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.REPORTS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.EQUIPMENT]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.CLIENT_DATA]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.PHOTOS]: { read: true, write: true, delete: true, execute: true },
    [APP_SECTIONS.VOICE_COMMANDS]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.AI_ANALYSIS]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.TEMPLATES]: { read: true, write: false, delete: false, execute: true },
    [APP_SECTIONS.STANDARDS]: { read: true, write: false, delete: false, execute: true },
  },
  technician: {
    [APP_SECTIONS.DEVELOPMENT]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.SYSTEM_CONFIG]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.USER_MANAGEMENT]: { read: false, write: false, delete: false, execute: false },
    [APP_SECTIONS.MOISTURE_MAPPING]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.REPORTS]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.EQUIPMENT]: { read: true, write: false, delete: false, execute: true },
    [APP_SECTIONS.CLIENT_DATA]: { read: true, write: true, delete: false, execute: false },
    [APP_SECTIONS.PHOTOS]: { read: true, write: true, delete: false, execute: true },
    [APP_SECTIONS.VOICE_COMMANDS]: { read: true, write: false, delete: false, execute: true },
    [APP_SECTIONS.AI_ANALYSIS]: { read: true, write: false, delete: false, execute: true },
    [APP_SECTIONS.TEMPLATES]: { read: true, write: false, delete: false, execute: false },
    [APP_SECTIONS.STANDARDS]: { read: true, write: false, delete: false, execute: false },
  },
};

export const ROLE_DESCRIPTIONS = {
  developer: 'Full platform access including development tools and system configuration',
  manager: 'Complete access to all operational features except development tools',
  admin: 'Administrative access with limitations on system configuration and template management',
  technician: 'Basic access for field work and data collection',
} as const;

export const ROLE_COLORS = {
  developer: '#9c27b0', // Purple
  manager: '#1976d2', // Blue
  admin: '#2e7d32', // Green
  technician: '#ed6c02', // Orange
} as const;

export const PASSWORD_PROTECTED_ROLES = ['developer', 'manager', 'admin'];
