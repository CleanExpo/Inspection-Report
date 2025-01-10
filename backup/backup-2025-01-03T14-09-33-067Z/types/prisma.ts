import type { PrismaClient, Prisma } from '@prisma/client';

// Define the Job model with relations
export interface JobWithRelations {
    id: string;
    title: string;
    description?: string | null;
    status: JobStatus;
    priority: JobPriority;
    scheduledDate?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    createdById: string;
    technicianId?: string | null;
    client: Client;
    createdBy: User;
    assignedTechnician?: User | null;
    readings: Reading[];
    photos: Photo[];
    notes: Note[];
}

// Re-export Prisma enums
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

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    TECHNICIAN = 'TECHNICIAN'
}

// Export Prisma model types
export type Job = {
    id: string;
    title: string;
    description: string | null;
    status: JobStatus;
    priority: JobPriority;
    scheduledDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    createdById: string;
    technicianId: string | null;
};

export type Client = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
};

export type User = {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
};

export type Reading = {
    id: string;
    value: number;
    location: string;
    timestamp: Date;
    jobId: string;
};

export type Photo = {
    id: string;
    url: string;
    caption: string | null;
    timestamp: Date;
    jobId: string;
};

export type Note = {
    id: string;
    content: string;
    timestamp: Date;
    jobId: string;
};

// Export Prisma client type
export type { PrismaClient };

// Export Prisma namespace for utility types
export type { Prisma };
