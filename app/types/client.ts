export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  jobs?: Job[];
}

export interface Job {
  id: string;
  jobNumber: string;
  clientId: string;
  status: JobStatus;
  priority: JobPriority;
  category: string;
  description?: string;
  startDate?: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export const JOB_STATUSES: JobStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const JOB_PRIORITIES: JobPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  notes?: string;
}

export interface JobFormData {
  jobNumber: string;
  clientId: string;
  status: JobStatus;
  priority: JobPriority;
  category: string;
  description?: string;
  startDate?: Date;
  completionDate?: Date;
}
