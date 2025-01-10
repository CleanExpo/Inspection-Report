import { Job, JobWithRelations } from './prisma';

export interface ApiResponse {
    message?: string;
    errors?: string[];
}

export interface ErrorResponse extends ApiResponse {
    message: string;
    details?: any;
}

export interface JobResponse extends ApiResponse {
    data: {
        job: JobWithRelations;
    };
}

export interface JobsResponse extends ApiResponse {
    data: {
        jobs: JobWithRelations[];
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ValidationResult {
    success: boolean;
    errors?: string[];
}
