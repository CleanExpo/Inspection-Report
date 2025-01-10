interface Hazard {
    type: string;
    risk: 'low' | 'medium' | 'high';
    controls: string[];
    responsible: string;
    reviewed: boolean;
}

interface PPE {
    type: string;
    required: boolean;
    condition: 'new' | 'good' | 'replace';
    lastInspected: string;
}

interface SafetyChecklist {
    id: string;
    jobId: string;
    technician: string;
    timestamp: string;
    hazards: Hazard[];
    ppe: PPE[];
    siteInduction: boolean;
    emergencyProcedures: boolean;
    firstAidKit: boolean;
    workAreaSecured: boolean;
    properSignage: boolean;
    completed: boolean;
    signature?: string;
}

interface SWMS {
    id: string;
    jobId: string;
    projectDetails: {
        address: string;
        scope: string;
        startDate: string;
        duration: string;
    };
    highRiskWork: {
        type: string;
        controls: string[];
        permits: string[];
    }[];
    responsibilities: {
        role: string;
        name: string;
        duties: string[];
    }[];
    reviewed: boolean;
    approved: boolean;
    reviewedBy?: string;
    reviewDate?: string;
}

interface JSA {
    id: string;
    jobId: string;
    task: string;
    steps: Array<{
        description: string;
        hazards: string[];
        controls: string[];
        responsible: string;
    }>;
    reviewed: boolean;
    approved: boolean;
    reviewedBy?: string;
    reviewDate?: string;
}

interface RequiredDocuments {
    frontPhoto: boolean;
    safetyChecklist: boolean;
    swms: boolean;
    jsa: boolean;
    siteInduction: boolean;
}

/**
 * Service for managing safety requirements and documentation
 */
import { documentationService } from './documentationService';

interface Photo {
    id: string;
    type: string;
    description: string;
}

class SafetyService {
    private static instance: SafetyService;
    private checklists: Map<string, SafetyChecklist> = new Map(); // key: jobId
    private swmsList: Map<string, SWMS> = new Map(); // key: jobId
    private jsaList: Map<string, JSA> = new Map(); // key: jobId

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): SafetyService {
        if (!SafetyService.instance) {
            SafetyService.instance = new SafetyService();
        }
        return SafetyService.instance;
    }

    /**
     * Create safety checklist
     */
    createChecklist(jobId: string, technician: string): SafetyChecklist {
        const checklist: SafetyChecklist = {
            id: `checklist-${Date.now()}`,
            jobId,
            technician,
            timestamp: new Date().toISOString(),
            hazards: [],
            ppe: [
                {
                    type: 'Safety Boots',
                    required: true,
                    condition: 'good',
                    lastInspected: new Date().toISOString()
                },
                {
                    type: 'Gloves',
                    required: true,
                    condition: 'good',
                    lastInspected: new Date().toISOString()
                },
                {
                    type: 'Respirator',
                    required: false,
                    condition: 'good',
                    lastInspected: new Date().toISOString()
                }
            ],
            siteInduction: false,
            emergencyProcedures: false,
            firstAidKit: false,
            workAreaSecured: false,
            properSignage: false,
            completed: false
        };

        this.checklists.set(jobId, checklist);
        return checklist;
    }

    /**
     * Create SWMS
     */
    createSWMS(jobId: string, projectDetails: SWMS['projectDetails']): SWMS {
        const swms: SWMS = {
            id: `swms-${Date.now()}`,
            jobId,
            projectDetails,
            highRiskWork: [],
            responsibilities: [],
            reviewed: false,
            approved: false
        };

        this.swmsList.set(jobId, swms);
        return swms;
    }

    /**
     * Create JSA
     */
    createJSA(jobId: string, task: string): JSA {
        const jsa: JSA = {
            id: `jsa-${Date.now()}`,
            jobId,
            task,
            steps: [],
            reviewed: false,
            approved: false
        };

        this.jsaList.set(jobId, jsa);
        return jsa;
    }

    /**
     * Add hazard to checklist
     */
    addHazard(jobId: string, hazard: Omit<Hazard, 'reviewed'>): void {
        const checklist = this.checklists.get(jobId);
        if (!checklist) {
            throw new Error('Checklist not found');
        }

        checklist.hazards.push({
            ...hazard,
            reviewed: false
        });
    }

    /**
     * Add high risk work to SWMS
     */
    addHighRiskWork(
        jobId: string,
        work: SWMS['highRiskWork'][0]
    ): void {
        const swms = this.swmsList.get(jobId);
        if (!swms) {
            throw new Error('SWMS not found');
        }

        swms.highRiskWork.push(work);
    }

    /**
     * Add step to JSA
     */
    addJSAStep(
        jobId: string,
        step: JSA['steps'][0]
    ): void {
        const jsa = this.jsaList.get(jobId);
        if (!jsa) {
            throw new Error('JSA not found');
        }

        jsa.steps.push(step);
    }

    /**
     * Complete safety checklist
     */
    completeChecklist(jobId: string, signature: string): void {
        const checklist = this.checklists.get(jobId);
        if (!checklist) {
            throw new Error('Checklist not found');
        }

        checklist.completed = true;
        checklist.signature = signature;
    }

    /**
     * Approve SWMS
     */
    approveSWMS(jobId: string, reviewer: string): void {
        const swms = this.swmsList.get(jobId);
        if (!swms) {
            throw new Error('SWMS not found');
        }

        swms.reviewed = true;
        swms.approved = true;
        swms.reviewedBy = reviewer;
        swms.reviewDate = new Date().toISOString();
    }

    /**
     * Approve JSA
     */
    approveJSA(jobId: string, reviewer: string): void {
        const jsa = this.jsaList.get(jobId);
        if (!jsa) {
            throw new Error('JSA not found');
        }

        jsa.reviewed = true;
        jsa.approved = true;
        jsa.reviewedBy = reviewer;
        jsa.reviewDate = new Date().toISOString();
    }

    /**
     * Check if job can be activated
     */
    canActivateJob(jobId: string): {
        canActivate: boolean;
        requiredDocuments: RequiredDocuments;
    } {
        const checklist = this.checklists.get(jobId);
        const swms = this.swmsList.get(jobId);
        const jsa = this.jsaList.get(jobId);

        // Check for front photo
        const hasFrontPhoto = documentationService.getPhotos(jobId)
            .some((photo: Photo) => photo.type === 'property' && photo.description.toLowerCase().includes('front'));

        const requiredDocuments: RequiredDocuments = {
            frontPhoto: hasFrontPhoto,
            safetyChecklist: checklist?.completed || false,
            swms: swms?.approved || false,
            jsa: jsa?.approved || false,
            siteInduction: checklist?.siteInduction || false
        };

        const canActivate = Object.values(requiredDocuments).every(Boolean);

        return {
            canActivate,
            requiredDocuments
        };
    }

    /**
     * Generate safety report
     */
    generateSafetyReport(jobId: string): string {
        const checklist = this.checklists.get(jobId);
        const swms = this.swmsList.get(jobId);
        const jsa = this.jsaList.get(jobId);

        if (!checklist || !swms || !jsa) {
            throw new Error('Safety documentation not complete');
        }

        return `
SITE SAFETY DOCUMENTATION
========================

Safety Checklist
---------------
Technician: ${checklist.technician}
Date: ${new Date(checklist.timestamp).toLocaleDateString()}

Hazards Identified:
${checklist.hazards.map(h => `
- Type: ${h.type}
  Risk Level: ${h.risk}
  Controls: ${h.controls.join(', ')}
  Responsible: ${h.responsible}
  Reviewed: ${h.reviewed ? 'Yes' : 'No'}
`).join('\n')}

PPE Requirements:
${checklist.ppe.map(p => `
- ${p.type}: ${p.required ? 'Required' : 'Optional'}
  Condition: ${p.condition}
  Last Inspected: ${new Date(p.lastInspected).toLocaleDateString()}
`).join('\n')}

Site Safety Checks:
- Site Induction: ${checklist.siteInduction ? '✓' : '✗'}
- Emergency Procedures: ${checklist.emergencyProcedures ? '✓' : '✗'}
- First Aid Kit: ${checklist.firstAidKit ? '✓' : '✗'}
- Work Area Secured: ${checklist.workAreaSecured ? '✓' : '✗'}
- Proper Signage: ${checklist.properSignage ? '✓' : '✗'}

SWMS Details
-----------
Project: ${swms.projectDetails.scope}
Start Date: ${new Date(swms.projectDetails.startDate).toLocaleDateString()}
Duration: ${swms.projectDetails.duration}

High Risk Work:
${swms.highRiskWork.map(w => `
- Type: ${w.type}
  Controls: ${w.controls.join(', ')}
  Permits: ${w.permits.join(', ')}
`).join('\n')}

Responsibilities:
${swms.responsibilities.map(r => `
- Role: ${r.role}
  Name: ${r.name}
  Duties: ${r.duties.join(', ')}
`).join('\n')}

JSA Details
----------
Task: ${jsa.task}

Steps:
${jsa.steps.map((s, i) => `
${i + 1}. ${s.description}
   Hazards: ${s.hazards.join(', ')}
   Controls: ${s.controls.join(', ')}
   Responsible: ${s.responsible}
`).join('\n')}

Approvals
---------
Checklist Completed: ${checklist.completed ? 'Yes' : 'No'}
${checklist.signature ? `Technician Signature: ${checklist.signature}` : ''}

SWMS Approved: ${swms.approved ? 'Yes' : 'No'}
${swms.reviewedBy ? `Reviewed By: ${swms.reviewedBy}
Review Date: ${new Date(swms.reviewDate!).toLocaleDateString()}` : ''}

JSA Approved: ${jsa.approved ? 'Yes' : 'No'}
${jsa.reviewedBy ? `Reviewed By: ${jsa.reviewedBy}
Review Date: ${new Date(jsa.reviewDate!).toLocaleDateString()}` : ''}
        `;
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.checklists.clear();
        this.swmsList.clear();
        this.jsaList.clear();
    }
}

export const safetyService = SafetyService.getInstance();
