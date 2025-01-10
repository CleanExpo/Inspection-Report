import { Prisma } from '@prisma/client';

// Define base types from Prisma schema
export type Client = Prisma.clientGetPayload<{
  include: {
    jobs: {
      include: {
        scopes: true;
        invoices: true;
      };
    };
  };
}>;

export type Job = Prisma.jobGetPayload<{
  include: {
    scopes: true;
    invoices: true;
  };
}>;

export type Scope = Prisma.scopeGetPayload<{}>;
export type Invoice = Prisma.invoiceGetPayload<{}>;

// Enums
export const JobStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export const JobPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

export const ClaimType = {
  WATER_DAMAGE: 'WATER_DAMAGE',
  FIRE_DAMAGE: 'FIRE_DAMAGE',
  MOLD: 'MOLD',
  STORM_DAMAGE: 'STORM_DAMAGE',
  OTHER: 'OTHER'
} as const;

export const PropertyType = {
  RESIDENTIAL: 'RESIDENTIAL',
  COMMERCIAL: 'COMMERCIAL',
  INDUSTRIAL: 'INDUSTRIAL',
  OTHER: 'OTHER'
} as const;

export const ScopeStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];
export type JobPriorityType = typeof JobPriority[keyof typeof JobPriority];
export type ClaimTypeType = typeof ClaimType[keyof typeof ClaimType];
export type PropertyTypeType = typeof PropertyType[keyof typeof PropertyType];
export type ScopeStatusType = typeof ScopeStatus[keyof typeof ScopeStatus];
export type InvoiceStatusType = typeof InvoiceStatus[keyof typeof InvoiceStatus];
