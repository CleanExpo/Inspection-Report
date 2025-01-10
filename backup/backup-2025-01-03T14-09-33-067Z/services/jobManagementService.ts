import { v4 as uuidv4 } from 'uuid';
import { moistureManagementService } from './moistureManagementService';
import { equipmentTrackingService } from './equipmentTrackingService';
import { documentationService } from './documentationService';
import { areaMappingService } from './areaMappingService';

interface JobDetails {
    jobId: string;
    clientInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        insurance: {
            company: string;
            policyNumber: string;
            claimNumber: string;
        };
    };
    incidentDetails: {
        dateOfLoss: string;
        type: string;
        source: string;
        affectedAreas: string[];
    };
    status: 'new' | 'in-progress' | 'monitoring' | 'completed';
    assignedTechnician: string;
    created: string;
    updated: string;
}

interface ScopeOfWork {
    jobId: string;
    tasks: Array<{
        area: string;
        description: string;
        status: 'pending' | 'in-progress' | 'completed';
        notes?: string;
    }>;
    equipment: Array<{
        type: string;
        count: number;
        location: string;
        purpose: string;
    }>;
    timeline: {
        estimated: number; // days
        actual?: number;
    };
    specialNotes?: string[];
}

interface InspectionReport {
    jobId: string;
    date: string;
    technician: string;
    propertyCondition: {
        exterior: {
            damage: boolean;
            notes: string[];
        };
        interior: {
            damage: boolean;
            notes: string[];
        };
        hazards: string[];
    };
    affectedAreas: Array<{
        area: string;
        damage: string[];
        readings: {
            moisture: number;
            humidity: number;
            temperature: number;
        };
        recommendations: string[];
    }>;
    photos: Array<{
        id: string;
        type: string;
        location: string;
        notes?: string;
    }>;
    equipment: Array<{
        type: string;
        count: number;
        location: string;
    }>;
    recommendations: string[];
    clientSignature?: string;
    technicianSignature: string;
}

/**
 * Service for managing restoration jobs
 */
class JobManagementService {
    private static instance: JobManagementService;
    private jobs: Map<string, JobDetails> = new Map();
    private scopes: Map<string, ScopeOfWork> = new Map();
    private inspections: Map<string, InspectionReport> = new Map();

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): JobManagementService {
        if (!JobManagementService.instance) {
            JobManagementService.instance = new JobManagementService();
        }
        return JobManagementService.instance;
    }

    /**
     * Create new job
     */
    createJob(details: Omit<JobDetails, 'jobId' | 'status' | 'created' | 'updated'>): JobDetails {
        const jobId = uuidv4();
        const job: JobDetails = {
            ...details,
            jobId,
            status: 'new',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };

        this.jobs.set(jobId, job);
        return job;
    }

    /**
     * Create inspection report
     */
    createInspectionReport(report: Omit<InspectionReport, 'date'>): InspectionReport {
        const inspection: InspectionReport = {
            ...report,
            date: new Date().toISOString()
        };

        this.inspections.set(report.jobId, inspection);
        return inspection;
    }

    /**
     * Create scope of work
     */
    createScopeOfWork(scope: ScopeOfWork): ScopeOfWork {
        this.scopes.set(scope.jobId, scope);
        return scope;
    }

    /**
     * Update job status
     */
    updateJobStatus(jobId: string, status: JobDetails['status']): void {
        const job = this.jobs.get(jobId);
        if (job) {
            job.status = status;
            job.updated = new Date().toISOString();
            this.jobs.set(jobId, job);
        }
    }

    /**
     * Get job details
     */
    getJob(jobId: string): JobDetails | undefined {
        return this.jobs.get(jobId);
    }

    /**
     * Get inspection report
     */
    getInspectionReport(jobId: string): InspectionReport | undefined {
        return this.inspections.get(jobId);
    }

    /**
     * Get scope of work
     */
    getScopeOfWork(jobId: string): ScopeOfWork | undefined {
        return this.scopes.get(jobId);
    }

    /**
     * Generate progress report
     */
    generateProgressReport(jobId: string): {
        jobDetails: JobDetails;
        initialInspection: InspectionReport;
        scope: ScopeOfWork;
        moistureReadings: any[];
        equipmentLogs: any[];
        photos: any[];
        recommendations: string[];
    } {
        const job = this.getJob(jobId);
        const inspection = this.getInspectionReport(jobId);
        const scope = this.getScopeOfWork(jobId);

        if (!job || !inspection || !scope) {
            throw new Error('Missing required job information');
        }

        // Get data from other services
        const moistureReadings = moistureManagementService.getReadings(
            inspection.affectedAreas[0].area,
            'all'
        );
        const equipmentLogs = equipmentTrackingService.getEquipmentByLocation(
            inspection.affectedAreas[0].area,
            'all'
        );
        const photos = documentationService.getPhotos(
            inspection.affectedAreas[0].area,
            'all'
        );

        return {
            jobDetails: job,
            initialInspection: inspection,
            scope,
            moistureReadings,
            equipmentLogs,
            photos,
            recommendations: inspection.recommendations
        };
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.jobs.clear();
        this.scopes.clear();
        this.inspections.clear();
    }
}

export const jobManagementService = JobManagementService.getInstance();
