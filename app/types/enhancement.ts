import { Point } from './moisture';

export enum ExternalSystemType {
  CRM = 'CRM',
  ERP = 'ERP',
  ACCOUNTING = 'ACCOUNTING',
  CALENDAR = 'CALENDAR',
  MESSAGING = 'MESSAGING',
  CUSTOM = 'CUSTOM'
}

export enum SyncStrategy {
  IMMEDIATE = 'IMMEDIATE',
  BATCH = 'BATCH',
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL'
}

export enum ConflictResolution {
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',
  MANUAL_RESOLVE = 'MANUAL_RESOLVE'
}

export enum NotificationType {
  SYNC_COMPLETE = 'SYNC_COMPLETE',
  SYNC_ERROR = 'SYNC_ERROR',
  UPDATE_AVAILABLE = 'UPDATE_AVAILABLE',
  DATA_CONFLICT = 'DATA_CONFLICT',
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE'
}

export interface ExternalSystem {
  id: string;
  type: ExternalSystemType;
  name: string;
  baseUrl: string;
  auth: {
    type: 'API_KEY' | 'OAUTH2' | 'JWT' | 'BASIC';
    credentials: Record<string, string>;
    scopes?: string[];
    expiresAt?: Date;
  };
  endpoints: {
    [key: string]: {
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      params?: Record<string, string>;
      rateLimit?: number;
    };
  };
  mapping: {
    [key: string]: {
      sourceField: string;
      targetField: string;
      transform?: string;
      validation?: string;
    }[];
  };
  webhooks?: {
    id: string;
    event: string;
    url: string;
    secret?: string;
    active: boolean;
  }[];
  status: {
    connected: boolean;
    lastSync?: Date;
    error?: string;
  };
}

export interface MobileConfig {
  id: string;
  platform: 'IOS' | 'ANDROID' | 'PWA';
  version: string;
  features: {
    offlineMode: boolean;
    pushNotifications: boolean;
    locationServices: boolean;
    cameraAccess: boolean;
    biometricAuth: boolean;
  };
  storage: {
    maxSize: number;
    purgeStrategy: 'LRU' | 'SIZE' | 'AGE';
    purgeThreshold: number;
  };
  sync: {
    strategy: SyncStrategy;
    interval?: number;
    retryAttempts: number;
    batchSize: number;
  };
  ui: {
    theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    fontSize: number;
    touchTargetSize: number;
    animations: boolean;
  };
}

export interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  deviceId: string;
  userId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  retryCount: number;
  error?: string;
  dependencies?: string[];
}

export interface SyncSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  operations: {
    total: number;
    completed: number;
    failed: number;
  };
  conflicts: {
    total: number;
    resolved: number;
    pending: number;
  };
  stats: {
    uploadSize: number;
    downloadSize: number;
    duration: number;
    networkSpeed: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface DataConflict {
  id: string;
  entityType: string;
  entityId: string;
  clientVersion: {
    data: any;
    timestamp: number;
    deviceId: string;
  };
  serverVersion: {
    data: any;
    timestamp: number;
    userId: string;
  };
  resolution?: {
    strategy: ConflictResolution;
    resolvedData: any;
    resolvedBy: string;
    timestamp: number;
  };
}

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  timestamp: Date;
  expiresAt?: Date;
  read: boolean;
  action?: {
    type: string;
    payload: any;
  };
}

export interface DeviceInfo {
  id: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  lastActive: Date;
  networkType?: string;
  batteryLevel?: number;
  storageUsage: {
    total: number;
    used: number;
  };
  location?: {
    coordinates: Point;
    accuracy: number;
    timestamp: Date;
  };
}

export interface EnhancementStats {
  external: {
    systems: number;
    activeConnections: number;
    syncSuccess: number;
    syncErrors: number;
  };
  mobile: {
    activeDevices: number;
    offlineOperations: number;
    storageUsage: number;
    pushDelivery: number;
  };
  offline: {
    pendingOperations: number;
    conflicts: number;
    syncFrequency: number;
    dataSize: number;
  };
  sync: {
    lastSuccess?: Date;
    averageDuration: number;
    failureRate: number;
    dataTransferred: number;
  };
}

export interface EnhancementConfig {
  external: {
    maxSystems: number;
    rateLimits: Record<ExternalSystemType, number>;
    timeout: number;
    retryPolicy: {
      attempts: number;
      backoff: number;
    };
  };
  mobile: {
    maxOfflineSize: number;
    syncInterval: number;
    pushEnabled: boolean;
    locationTracking: boolean;
  };
  offline: {
    maxOperations: number;
    maxRetries: number;
    conflictStrategy: ConflictResolution;
    purgeAge: number;
  };
  sync: {
    batchSize: number;
    concurrency: number;
    lockTimeout: number;
    validateData: boolean;
  };
}
