import { MaterialType } from './moisture';
import { EquipmentType } from './equipment';

export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ROLLBACK = 'ROLLBACK'
}

export enum EntityType {
  READING = 'READING',
  MAP = 'MAP',
  EQUIPMENT = 'EQUIPMENT',
  CLIENT = 'CLIENT',
  JOB = 'JOB',
  ANNOTATION = 'ANNOTATION',
  ANNOTATION_LINK = 'ANNOTATION_LINK',
  RENDER_LAYER = 'RENDER_LAYER',
  COORDINATE_SPACE = 'COORDINATE_SPACE',
  COORDINATE_LEVEL = 'COORDINATE_LEVEL',
  COORDINATE_GRID = 'COORDINATE_GRID',
  COORDINATE_MAPPING = 'COORDINATE_MAPPING',
  INTEGRATION_ELEMENT = 'INTEGRATION_ELEMENT',
  PERFORMANCE_CHUNK = 'PERFORMANCE_CHUNK',
  VISUALIZATION_SCENE = 'VISUALIZATION_SCENE',
  VISUALIZATION_MODEL = 'VISUALIZATION_MODEL',
  VISUALIZATION_INTERACTION = 'VISUALIZATION_INTERACTION',
  VISUALIZATION_ANIMATION = 'VISUALIZATION_ANIMATION',
  VISUALIZATION_REPORT = 'VISUALIZATION_REPORT',
  VISUALIZATION_UPDATE = 'VISUALIZATION_UPDATE',
  EXTERNAL_SYSTEM = 'EXTERNAL_SYSTEM',
  MOBILE_CONFIG = 'MOBILE_CONFIG',
  DEVICE_INFO = 'DEVICE_INFO',
  OFFLINE_OPERATION = 'OFFLINE_OPERATION',
  SYNC_SESSION = 'SYNC_SESSION',
  DATA_CONFLICT = 'DATA_CONFLICT',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  ANALYTICS_MODEL = 'ANALYTICS_MODEL',
  ANALYTICS_PATTERN = 'ANALYTICS_PATTERN',
  ANALYTICS_ANOMALY = 'ANALYTICS_ANOMALY',
  ANALYTICS_RISK = 'ANALYTICS_RISK',
  ANALYTICS_PREDICTION = 'ANALYTICS_PREDICTION',
  ANALYTICS_REPORT = 'ANALYTICS_REPORT',
  ANALYTICS_DASHBOARD = 'ANALYTICS_DASHBOARD',
  ANALYTICS_INSIGHT = 'ANALYTICS_INSIGHT'
}

export interface HistoryEntry {
  id: string;
  entityId: string;
  entityType: EntityType;
  changeType: ChangeType;
  timestamp: Date;
  userId: string;
  previousVersion?: string; // JSON string of previous state
  newVersion: string; // JSON string of new state
  metadata?: Record<string, any>;
}

export interface ReadingHistory {
  readingId: string;
  materialType: MaterialType;
  equipmentType: EquipmentType;
  values: {
    timestamp: Date;
    value: number;
    confidence: number;
    environmentalConditions: {
      temperature: number;
      humidity: number;
    };
  }[];
}

export interface TrendAnalysis {
  readingId: string;
  period: {
    start: Date;
    end: Date;
  };
  statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
    standardDeviation: number;
  };
  trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'FLUCTUATING';
  confidence: number;
  anomalies: {
    timestamp: Date;
    value: number;
    expectedRange: {
      min: number;
      max: number;
    };
  }[];
}

export interface ComparisonResult {
  readingIds: string[];
  period: {
    start: Date;
    end: Date;
  };
  differences: {
    timestamp: Date;
    values: Record<string, number>;
    deviation: number;
  }[];
  correlation: number;
  similarityScore: number;
}

export interface HistoryReport {
  id: string;
  entityId: string;
  entityType: EntityType;
  period: {
    start: Date;
    end: Date;
  };
  changes: {
    total: number;
    byType: Record<ChangeType, number>;
  };
  trends?: TrendAnalysis[];
  comparisons?: ComparisonResult[];
  metadata?: Record<string, any>;
  generatedAt: Date;
}

export interface HistoryFilter {
  entityIds?: string[];
  entityTypes?: EntityType[];
  changeTypes?: ChangeType[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  includeMetadata?: boolean;
}

export interface TrendDetectionOptions {
  minDataPoints: number;
  confidenceThreshold: number;
  anomalyThreshold: number;
  smoothingFactor?: number;
  seasonalityPeriod?: number;
}

export interface ComparisonOptions {
  method: 'VALUE' | 'TREND' | 'PATTERN';
  tolerance: number;
  normalizeData?: boolean;
  ignoreTimestamps?: boolean;
  weightFactors?: {
    value: number;
    trend: number;
    pattern: number;
  };
}

export interface ExportOptions {
  format: 'CSV' | 'JSON' | 'PDF';
  includeMetadata: boolean;
  includeTrends: boolean;
  includeComparisons: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

export interface RollbackOptions {
  cascadeChanges: boolean;
  updateReferences: boolean;
  preserveAuditTrail: boolean;
  notifyUsers?: boolean;
}

export interface AuditLogEntry extends HistoryEntry {
  ipAddress?: string;
  userAgent?: string;
  location?: {
    x: number;
    y: number;
    floor?: number;
  };
  relatedChanges?: string[]; // IDs of related history entries
  validationResults?: {
    isValid: boolean;
    errors: string[];
  };
}

export interface VersionInfo {
  versionId: string;
  entityId: string;
  entityType: EntityType;
  timestamp: Date;
  hash: string; // Hash of the version content for integrity checking
  parentVersion?: string;
  branchName?: string;
  tags?: string[];
  state: string; // JSON string of the complete state
  changeDescription?: string;
}
