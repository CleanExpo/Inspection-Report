import { AnnotationType } from './annotation';

export enum LinkType {
  REFERENCE = 'REFERENCE',
  DEPENDENCY = 'DEPENDENCY',
  ASSOCIATION = 'ASSOCIATION',
  GROUPING = 'GROUPING'
}

export enum LinkDirection {
  UNIDIRECTIONAL = 'UNIDIRECTIONAL',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum LinkStatus {
  ACTIVE = 'ACTIVE',
  BROKEN = 'BROKEN',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED'
}

export enum UpdatePropagation {
  NONE = 'NONE',
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  BOTH = 'BOTH'
}

export interface LinkValidationRule {
  sourceType: AnnotationType[];
  targetType: AnnotationType[];
  linkType: LinkType[];
  direction: LinkDirection[];
  maxLinks?: number;
  allowSelfLink?: boolean;
  customValidator?: (link: AnnotationLink) => boolean;
  errorMessage: string;
}

export interface AnnotationLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: LinkType;
  direction: LinkDirection;
  status: LinkStatus;
  propagation: UpdatePropagation;
  metadata?: {
    description?: string;
    tags?: string[];
    priority?: number;
    customData?: Record<string, any>;
  };
  validation?: {
    lastValidated: Date;
    isValid: boolean;
    errors: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkGroup {
  id: string;
  name: string;
  links: string[]; // Link IDs
  type: LinkType;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkDependency {
  id: string;
  linkId: string;
  dependentId: string; // Another link ID
  type: 'REQUIRES' | 'CONFLICTS' | 'ENHANCES';
  priority: number;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface LinkUpdateEvent {
  id: string;
  linkId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  propagation: UpdatePropagation;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: Date;
  initiatedBy: string;
}

export interface LinkValidationContext {
  sourceAnnotation: {
    id: string;
    type: AnnotationType;
    metadata?: Record<string, any>;
  };
  targetAnnotation: {
    id: string;
    type: AnnotationType;
    metadata?: Record<string, any>;
  };
  existingLinks: {
    fromSource: AnnotationLink[];
    toTarget: AnnotationLink[];
  };
  rules: LinkValidationRule[];
}

export interface LinkUpdateResult {
  success: boolean;
  linkId: string;
  propagatedUpdates: {
    linkId: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }[];
  validationResults: {
    isValid: boolean;
    errors: string[];
  };
}

export interface LinkQueryOptions {
  types?: LinkType[];
  directions?: LinkDirection[];
  statuses?: LinkStatus[];
  annotationIds?: string[];
  includeMetadata?: boolean;
  includeValidation?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface LinkStatistics {
  total: number;
  byType: Record<LinkType, number>;
  byStatus: Record<LinkStatus, number>;
  byDirection: Record<LinkDirection, number>;
  validationStatus: {
    valid: number;
    invalid: number;
    pending: number;
  };
  averagePropagationTime: number;
  errorRate: number;
}

export interface LinkGraphNode {
  id: string;
  type: AnnotationType;
  links: {
    outgoing: AnnotationLink[];
    incoming: AnnotationLink[];
  };
  metadata?: Record<string, any>;
}

export interface LinkGraph {
  nodes: LinkGraphNode[];
  cycles: string[][]; // Arrays of node IDs forming cycles
  roots: string[]; // Node IDs with no incoming links
  leaves: string[]; // Node IDs with no outgoing links
  metadata?: {
    depth: number;
    breadth: number;
    density: number;
  };
}

export interface LinkMigrationPlan {
  sourceSchema: {
    version: string;
    types: LinkType[];
    rules: LinkValidationRule[];
  };
  targetSchema: {
    version: string;
    types: LinkType[];
    rules: LinkValidationRule[];
  };
  migrations: {
    linkId: string;
    changes: {
      field: string;
      transform: (oldValue: any) => any;
    }[];
    validation: LinkValidationRule[];
  }[];
}

export interface LinkAuditEntry {
  id: string;
  linkId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE';
  timestamp: Date;
  userId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

export interface LinkPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  validate: boolean;
  propagate: boolean;
  conditions?: {
    types?: LinkType[];
    directions?: LinkDirection[];
    metadata?: Record<string, any>;
  };
}
