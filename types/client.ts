export const JOB_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD'
] as const;

export const JOB_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
] as const;

export type JobStatus = typeof JOB_STATUSES[number];
export type JobPriority = typeof JOB_PRIORITIES[number];

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface Job {
  id: string;
  number: string;
  clientId: string;
  status: JobStatus;
  priority: JobPriority;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobUpdateRequest {
  status?: JobStatus;
  priority?: JobPriority;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}
