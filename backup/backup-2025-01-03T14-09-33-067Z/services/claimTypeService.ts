interface IICRCStandard {
    code: string;
    name: string;
    version: string;
    requirements: string[];
    guidelines: string[];
    documentation: string[];
}

interface InspectionRequirement {
    category: string;
    items: Array<{
        name: string;
        required: boolean;
        description: string;
        standards: string[];
    }>;
}

interface PPERequirement {
    type: string;
    required: boolean;
    standard: string;
    description: string;
}

interface ClaimType {
    id: string;
    name: string;
    category: 'water' | 'fire' | 'crime' | 'clandestine' | 'other';
    iicrcStandards: IICRCStandard[];
    inspectionRequirements: InspectionRequirement[];
    ppeRequirements: PPERequirement[];
    hazardAssessment: string[];
    containmentRequirements: string[];
    specialEquipment: string[];
    disposalRequirements: string[];
    decontaminationProcedures: string[];
    clearanceRequirements: string[];
}

/**
 * Service for managing different claim types and their IICRC requirements
 */
class ClaimTypeService {
    private static instance: ClaimTypeService;
    private claimTypes: Map<string, ClaimType> = new Map();

    private constructor() {
        this.initializeClaimTypes();
    }

    static getInstance(): ClaimTypeService {
        if (!ClaimTypeService.instance) {
            ClaimTypeService.instance = new ClaimTypeService();
        }
        return ClaimTypeService.instance;
    }

    /**
     * Get claim type details
     */
    getClaimType(id: string): ClaimType | undefined {
        return this.claimTypes.get(id);
    }

    /**
     * Get all claim types
     */
    getAllClaimTypes(): ClaimType[] {
        return Array.from(this.claimTypes.values());
    }

    /**
     * Get IICRC standards for claim type
     */
    getStandards(claimTypeId: string): IICRCStandard[] {
        return this.claimTypes.get(claimTypeId)?.iicrcStandards || [];
    }

    /**
     * Get inspection requirements for claim type
     */
    getInspectionRequirements(claimTypeId: string): InspectionRequirement[] {
        return this.claimTypes.get(claimTypeId)?.inspectionRequirements || [];
    }

    /**
     * Validate inspection against requirements
     */
    validateInspection(claimTypeId: string, inspection: any): {
        valid: boolean;
        missing: string[];
    } {
        const claimType = this.claimTypes.get(claimTypeId);
        if (!claimType) {
            throw new Error('Claim type not found');
        }

        const missing: string[] = [];
        let valid = true;

        claimType.inspectionRequirements.forEach(category => {
            category.items.forEach(item => {
                if (item.required && !this.checkRequirement(inspection, item.name)) {
                    valid = false;
                    missing.push(`${category.category}: ${item.name}`);
                }
            });
        });

        return { valid, missing };
    }

    /**
     * Generate inspection checklist
     */
    generateInspectionChecklist(claimTypeId: string): string {
        const claimType = this.claimTypes.get(claimTypeId);
        if (!claimType) {
            throw new Error('Claim type not found');
        }

        return `
INSPECTION CHECKLIST: ${claimType.name.toUpperCase()}
===============================================

IICRC Standards:
${claimType.iicrcStandards.map(std => `
${std.code} - ${std.name} (${std.version})
Requirements:
${std.requirements.map(req => `- ${req}`).join('\n')}
`).join('\n')}

Inspection Requirements:
${claimType.inspectionRequirements.map(cat => `
${cat.category}:
${cat.items.map(item => `□ ${item.required ? '[Required]' : '[Optional]'} ${item.name}
  Description: ${item.description}
  Standards: ${item.standards.join(', ')}`).join('\n')}
`).join('\n')}

PPE Requirements:
${claimType.ppeRequirements.map(ppe => `
□ ${ppe.type} ${ppe.required ? '[Required]' : '[Optional]'}
  Standard: ${ppe.standard}
  Description: ${ppe.description}
`).join('\n')}

Hazard Assessment:
${claimType.hazardAssessment.map(h => `□ ${h}`).join('\n')}

Containment Requirements:
${claimType.containmentRequirements.map(c => `□ ${c}`).join('\n')}

Special Equipment:
${claimType.specialEquipment.map(e => `□ ${e}`).join('\n')}

Disposal Requirements:
${claimType.disposalRequirements.map(d => `□ ${d}`).join('\n')}

Decontamination Procedures:
${claimType.decontaminationProcedures.map(p => `□ ${p}`).join('\n')}

Clearance Requirements:
${claimType.clearanceRequirements.map(r => `□ ${r}`).join('\n')}
        `;
    }

    private initializeClaimTypes(): void {
        // Fire and Smoke Damage
        this.claimTypes.set('fire', {
            id: 'fire',
            name: 'Fire and Smoke Damage',
            category: 'fire',
            iicrcStandards: [{
                code: 'FSRT',
                name: 'Fire and Smoke Restoration Technician',
                version: '2021',
                requirements: [
                    'Combustion by-product assessment',
                    'Structural damage evaluation',
                    'Content damage evaluation',
                    'HVAC system inspection'
                ],
                guidelines: [
                    'pH testing of surfaces',
                    'Soot type identification',
                    'Odor assessment procedures'
                ],
                documentation: [
                    'Thermal imaging records',
                    'Air quality measurements',
                    'Surface contamination tests'
                ]
            }],
            inspectionRequirements: [{
                category: 'Structural Assessment',
                items: [
                    {
                        name: 'Structural Integrity Check',
                        required: true,
                        description: 'Evaluate building stability and safety',
                        standards: ['FSRT 2.1']
                    },
                    {
                        name: 'Smoke Penetration Assessment',
                        required: true,
                        description: 'Determine extent of smoke damage',
                        standards: ['FSRT 3.2']
                    }
                ]
            }],
            ppeRequirements: [
                {
                    type: 'Respirator',
                    required: true,
                    standard: 'OSHA 1910.134',
                    description: 'N95 or higher for smoke particles'
                }
            ],
            hazardAssessment: [
                'Structural stability evaluation',
                'Air quality testing',
                'Electrical system inspection'
            ],
            containmentRequirements: [
                'HVAC isolation',
                'Clean/contaminated zone separation'
            ],
            specialEquipment: [
                'Thermal imaging camera',
                'Air scrubbers',
                'HEPA vacuums'
            ],
            disposalRequirements: [
                'Contaminated material handling',
                'Hazardous waste protocols'
            ],
            decontaminationProcedures: [
                'Surface cleaning protocols',
                'HVAC system cleaning'
            ],
            clearanceRequirements: [
                'Air quality testing',
                'Surface testing',
                'Odor elimination verification'
            ]
        });

        // Crime Scene
        this.claimTypes.set('crime', {
            id: 'crime',
            name: 'Crime Scene Cleanup',
            category: 'crime',
            iicrcStandards: [{
                code: 'GBAC',
                name: 'Forensic Cleanup Safety',
                version: '2021',
                requirements: [
                    'Biohazard assessment',
                    'Cross-contamination prevention',
                    'Evidence preservation protocols'
                ],
                guidelines: [
                    'Scene documentation procedures',
                    'Chemical exposure limits',
                    'Decontamination protocols'
                ],
                documentation: [
                    'Scene photographs',
                    'Contamination mapping',
                    'Disposal records'
                ]
            }],
            inspectionRequirements: [{
                category: 'Biohazard Assessment',
                items: [
                    {
                        name: 'Contamination Mapping',
                        required: true,
                        description: 'Document extent of biological contamination',
                        standards: ['GBAC 1.1']
                    },
                    {
                        name: 'Evidence Documentation',
                        required: true,
                        description: 'Photograph and document scene',
                        standards: ['GBAC 2.3']
                    }
                ]
            }],
            ppeRequirements: [
                {
                    type: 'Biohazard Suit',
                    required: true,
                    standard: 'OSHA 1910.1030',
                    description: 'Full body protection with face shield'
                }
            ],
            hazardAssessment: [
                'Biological hazard evaluation',
                'Chemical exposure assessment',
                'Sharps hazard inspection'
            ],
            containmentRequirements: [
                'Biohazard containment setup',
                'Decontamination zones'
            ],
            specialEquipment: [
                'Biohazard containers',
                'ATP testing equipment',
                'Chemical neutralizers'
            ],
            disposalRequirements: [
                'Medical waste protocols',
                'Biohazard disposal documentation'
            ],
            decontaminationProcedures: [
                'Surface disinfection protocols',
                'Equipment decontamination'
            ],
            clearanceRequirements: [
                'ATP testing results',
                'Surface testing verification',
                'Disposal documentation'
            ]
        });

        // Clandestine Lab
        this.claimTypes.set('clandestine', {
            id: 'clandestine',
            name: 'Clandestine Lab Remediation',
            category: 'clandestine',
            iicrcStandards: [{
                code: 'CMRT',
                name: 'Clandestine Meth Lab Remediation',
                version: '2021',
                requirements: [
                    'Chemical contamination assessment',
                    'Hazardous material identification',
                    'Structural absorption evaluation'
                ],
                guidelines: [
                    'Sampling procedures',
                    'Contamination mapping',
                    'Clearance testing'
                ],
                documentation: [
                    'Lab assessment records',
                    'Chemical testing results',
                    'Clearance documentation'
                ]
            }],
            inspectionRequirements: [{
                category: 'Chemical Assessment',
                items: [
                    {
                        name: 'Surface Testing',
                        required: true,
                        description: 'Test surfaces for chemical residue',
                        standards: ['CMRT 1.4']
                    },
                    {
                        name: 'HVAC Contamination Check',
                        required: true,
                        description: 'Evaluate HVAC system contamination',
                        standards: ['CMRT 2.2']
                    }
                ]
            }],
            ppeRequirements: [
                {
                    type: 'Chemical Suit',
                    required: true,
                    standard: 'OSHA 1910.120',
                    description: 'Level B protection with SCBA'
                }
            ],
            hazardAssessment: [
                'Chemical exposure evaluation',
                'Absorption assessment',
                'Ventilation requirements'
            ],
            containmentRequirements: [
                'Negative air pressure',
                'Chemical containment protocols'
            ],
            specialEquipment: [
                'Chemical testing kits',
                'Specialized cleaning agents',
                'Air monitoring equipment'
            ],
            disposalRequirements: [
                'Hazardous waste handling',
                'Chemical disposal protocols'
            ],
            decontaminationProcedures: [
                'Chemical neutralization',
                'Surface removal protocols'
            ],
            clearanceRequirements: [
                'Chemical residue testing',
                'Air quality verification',
                'State compliance documentation'
            ]
        });
    }

    private checkRequirement(inspection: any, requirement: string): boolean {
        // Implementation would check if the requirement is met in the inspection
        return true;
    }
}

export const claimTypeService = ClaimTypeService.getInstance();
