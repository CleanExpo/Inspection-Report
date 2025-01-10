import { ClientFormData, JobStatus, JobPriority } from './client';

/**
 * Job Creation API Types
 */
export interface JobCreateRequest {
    clientId: string;
    status?: JobStatus;
    priority?: JobPriority;
    category: string;
    description?: string;
    sequence?: number;
}

export interface JobCreateResponse {
    success: boolean;
    message: string;
    jobNumber?: string;
    errors?: {
        field: string;
        message: string;
    }[];
}


/**
 * Client Update API Types
 */

export interface ClientUpdateRequest {
    clientId: string;
    data: Partial<ClientFormData>;
}

export interface ClientUpdateResponse {
    success: boolean;
    message: string;
    client?: ClientFormData;
    errors?: {
        field: string;
        message: string;
    }[];
}

export type ClientUpdateHandler = (
    request: ClientUpdateRequest
) => Promise<ClientUpdateResponse>;

/**
 * Job List API Types
 */
export interface JobListResponse {
    success: boolean;
    message: string;
    jobs?: Array<{
        jobNumber: string;
        clientId: string;
        status: string;
        priority: string;
        category: string;
        description?: string;
        createdAt: string;
    }>;
    total?: number;
    page?: number;
    limit?: number;
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Job Get API Types
 */
export interface JobGetResponse {
    success: boolean;
    message: string;
    job?: {
        jobNumber: string;
        clientId: string;
        status: string;
        priority: string;
        category: string;
        description?: string;
        createdAt: string;
    };
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Job Update API Types
 */
export interface JobUpdateRequest {
    status?: JobStatus;
    priority?: JobPriority;
    category?: string;
    description?: string;
}

export interface JobUpdateResponse {
    success: boolean;
    message: string;
    job?: {
        jobNumber: string;
        status: string;
    };
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Job Delete API Types
 */
export interface JobDeleteResponse {
    success: boolean;
    message: string;
    jobNumber?: string;
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Job Validation API Types
 */
export interface JobValidationRequest {
    jobNumber: string;
}

export interface JobValidationResponse {
    success: boolean;
    message: string;
    isValid: boolean;
    errors?: {
        field: string;
        message: string;
    }[];
}

/**
 * Job Fields Validation API Types
 */
export interface JobFieldsValidationRequest {
    status?: JobStatus;
    priority?: JobPriority;
    category?: string;
    description?: string;
}

export interface JobFieldsValidationResponse {
    success: boolean;
    message: string;
    isValid: boolean;
    validatedFields?: {
        [key: string]: boolean;
    };
    errors?: {
        field: string;
        message: string;
    }[];
}
