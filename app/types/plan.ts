import { Point } from './moisture';

export enum PlanFileType {
  PDF = 'PDF',
  DWG = 'DWG',
  DXF = 'DXF',
  IMAGE = 'IMAGE'
}

export enum PlanStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  ERROR = 'ERROR'
}

export enum PlanLevel {
  BASEMENT = 'BASEMENT',
  GROUND = 'GROUND',
  MEZZANINE = 'MEZZANINE',
  FLOOR = 'FLOOR',
  ROOF = 'ROOF'
}

export interface PlanMetadata {
  title: string;
  description?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  scale?: number;
  units: 'METRIC' | 'IMPERIAL';
  originalFormat: PlanFileType;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  status: PlanStatus;
  metadata: PlanMetadata;
  file: {
    url: string;
    size: number;
    hash: string;
    thumbnailUrl?: string;
  };
  changes?: {
    type: 'UPDATE' | 'REVISION' | 'CORRECTION';
    description: string;
    areas?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface FloorPlan {
  id: string;
  jobId: string;
  level: PlanLevel;
  levelNumber?: number;
  status: PlanStatus;
  currentVersion: number;
  versions: PlanVersion[];
  metadata: PlanMetadata;
  coordinates: {
    origin: Point;
    rotation: number;
    scale: number;
    bounds: {
      min: Point;
      max: Point;
    };
  };
  grid?: {
    spacing: number;
    subdivisions: number;
    offset: Point;
    visible: boolean;
  };
  references: {
    type: string;
    id: string;
    position: Point;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanUploadConfig {
  allowedTypes: PlanFileType[];
  maxFileSize: number;
  autoProcess: boolean;
  extractMetadata: boolean;
  generateThumbnails: boolean;
  validateDimensions: boolean;
  compressionOptions?: {
    enabled: boolean;
    quality: number;
    maxDimension?: number;
  };
}

export interface PlanProcessingResult {
  success: boolean;
  planId: string;
  version: number;
  metadata?: PlanMetadata;
  errors?: {
    code: string;
    message: string;
    details?: any;
  }[];
  warnings?: {
    code: string;
    message: string;
    details?: any;
  }[];
  thumbnails?: {
    size: string;
    url: string;
  }[];
}

export interface PlanStorageConfig {
  provider: 'LOCAL' | 'S3' | 'AZURE' | 'GCS';
  basePath: string;
  versioning: boolean;
  backup: {
    enabled: boolean;
    frequency: string;
    retention: number;
  };
  cache: {
    enabled: boolean;
    duration: number;
    maxSize: number;
  };
  compression: {
    enabled: boolean;
    algorithm: string;
    level: number;
  };
}

export interface PlanSearchCriteria {
  jobId?: string;
  level?: PlanLevel;
  status?: PlanStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  metadata?: {
    field: string;
    value: any;
  }[];
  tags?: string[];
  version?: number | 'latest' | 'all';
}

export interface PlanValidationRule {
  type: PlanFileType;
  constraints: {
    minDimensions?: {
      width: number;
      height: number;
    };
    maxDimensions?: {
      width: number;
      height: number;
    };
    aspectRatio?: {
      min: number;
      max: number;
    };
    resolution?: {
      min: number;
      max: number;
    };
    fileSize?: {
      max: number;
    };
    requiredMetadata?: string[];
  };
  customValidator?: (file: File, metadata: PlanMetadata) => Promise<boolean>;
}

export interface PlanConversionOptions {
  targetFormat: PlanFileType;
  quality?: number;
  preserveScale?: boolean;
  includeMetadata?: boolean;
  pageRange?: {
    start: number;
    end: number;
  };
  outputOptions?: Record<string, any>;
}

export interface PlanStats {
  totalCount: number;
  byStatus: Record<PlanStatus, number>;
  byType: Record<PlanFileType, number>;
  byLevel: Record<PlanLevel, number>;
  storage: {
    total: number;
    byType: Record<PlanFileType, number>;
  };
  versions: {
    average: number;
    max: number;
  };
  usage: {
    views: number;
    downloads: number;
    prints: number;
  };
}

export interface PlanPermissions {
  view: boolean;
  upload: boolean;
  update: boolean;
  delete: boolean;
  approve: boolean;
  print: boolean;
  export: boolean;
  conditions?: {
    statuses?: PlanStatus[];
    levels?: PlanLevel[];
    metadata?: Record<string, any>;
  };
}
