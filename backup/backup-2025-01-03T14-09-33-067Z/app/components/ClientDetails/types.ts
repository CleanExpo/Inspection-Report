import { Prisma } from '@prisma/client';

// Define our enums to match Prisma schema
export enum JobStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum JobPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum ClaimType {
    WATER_DAMAGE = 'WATER_DAMAGE',
    FIRE_DAMAGE = 'FIRE_DAMAGE',
    MOLD = 'MOLD',
    STORM_DAMAGE = 'STORM_DAMAGE',
    OTHER = 'OTHER'
}

export enum PropertyType {
    RESIDENTIAL = 'RESIDENTIAL',
    COMMERCIAL = 'COMMERCIAL',
    INDUSTRIAL = 'INDUSTRIAL',
    OTHER = 'OTHER'
}

export enum ScopeStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

// Define our base types
export interface Scope {
    id: string;
    content: string;
    amount: number;
    status: ScopeStatus;
    jobId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Invoice {
    id: string;
    amount: number;
    status: InvoiceStatus;
    jobId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ExtendedJob {
    id: string;
    title: string;
    description: string | null;
    status: JobStatus;
    priority: JobPriority;
    scheduledDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    claimType: ClaimType | null;
    claimDetails: string | null;
    propertyType: PropertyType | null;
    clientId: string;
    createdById: string;
    technicianId: string | null;
    scopes: Scope[];
    invoices: Invoice[];
}

export interface ExtendedClient {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    propertyImage: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    jobs: ExtendedJob[];
}
