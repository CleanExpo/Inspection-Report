/**
 * Core types for inspection report system
 */

// Client Information Types
export interface ClientInfo {
    jobNo: string;
    claimDate: string;
    timeReceived: string;
    jobSupplier: string;
    orderNo: string;
    clientName: string;
    tenantName?: string;
    phoneNumbers: {
        client: string;
        tenant?: string;
        site?: string;
    };
    siteAddress: string;
    otherAddress?: string;
    claimDetails: {
        policyNumber: string;
        claimNumber: string;
        buildingAmount?: number;
        contentAmount?: number;
        type: ClaimType;
        category: string;
        class: 'Building' | 'Content' | 'Both';
    };
    staffMembers: StaffMember[];
    assessor?: {
        name: string;
        contactNo: string;
    };
    dateOfLoss: string;
    notes?: string;
}

export interface StaffMember {
    name: string;
    timeOnSite: string;
    timeOffSite: string;
}

export type ClaimType = 
    | 'Water Damage'
    | 'Fire Damage'
    | 'Storm Damage'
    | 'Mold Remediation'
    | 'Other';

// Building Assessment Types
export interface BuildingAssessment {
    buildingAffected: boolean;
    drillingRequired: boolean;
    removalRequired: boolean;
    thermalReadings: boolean;
    moistureReadings: boolean;
    moistureMeterUsed: string;
    additionalStaff: {
        required: boolean;
        count?: number;
        reason?: string;
    };
    powerDetails: {
        circuits: number;
        ampsAvailable: number;
        circuitDetails: {
            [key: string]: boolean; // circuit availability
        };
    };
    cleaningRequired: boolean;
    buildingPhotos: boolean;
    microbialGrowth: {
        building?: boolean;
        contents?: boolean;
    };
    estimatedDryingDays: {
        building?: number;
        contents?: number;
    };
    suspectAsbestos: boolean;
    tempAccommodation: {
        required: boolean;
        reason?: string;
    };
}

// Moisture Management Types
export interface MoistureReading {
    area: string;
    room: string;
    readings: {
        subfloorWME: number;
        flooringWME: number;
        basePlateWME: number;
        bottomWallWME: number;
        scanReading: number;
        relativeHumidity: number;
        airTemp: number;
        benchmarkWME: number;
    };
    timestamp: string;
}

// Property Documentation Types
export interface PropertyArea {
    area: string;
    room: string;
    size: string;
    flooringDetails: {
        type: string;
        subfloor: string;
        age: number;
        installed: string;
        underlay: string;
        restorable: boolean;
    };
}

// Equipment Tracking Types
export interface EquipmentRecord {
    type: string;
    serialNumber: string;
    modelNumber: string;
    installDate: string;
    removalDate?: string;
    runtime: number;
    powerUsage: number;
    location: {
        area: string;
        room: string;
    };
}

// Process Tracking Types
export interface RestorationProgress {
    moistureLevels: {
        reachedBenchmark: boolean;
        remainingAreas: string[];
    };
    completedSteps: {
        equipmentRemoval: boolean;
        areasCleaned: boolean;
        carpetRelayed: boolean;
        carpetVacuumed: boolean;
        waterMarksRemoved: boolean;
        carpetCleaned: boolean;
        furnitureReturned: boolean;
    };
    issues: {
        powerRestrictions: boolean;
        equipmentTripped: boolean;
        equipmentTurnedOff: boolean;
        claimRestrictions: boolean;
        details?: string;
    };
    iicrcCompliance: {
        s500Standard: boolean;
        s520Standard: boolean;
        dryingDaysRequired: number;
    };
    safetyMeasures: {
        leadsSecured: boolean;
        tripHazardsAddressed: boolean;
    };
}

// Documentation Types
export interface InspectionDocumentation {
    frontPropertyPhotos: {
        completed: boolean;
        unable?: boolean;
        reason?: string;
    };
    jsa: {
        completed: boolean;
        unable?: boolean;
        reason?: string;
    };
    swms: {
        completed: boolean;
        unable?: boolean;
        reason?: string;
    };
    preWorkAgreement: {
        completed: boolean;
        unable?: boolean;
        reason?: string;
    };
    authorityToCommence: {
        completed: boolean;
        unable?: boolean;
        reason?: string;
    };
    photos: {
        moisture: boolean;
        damage: boolean;
        equipment: boolean;
    };
}

// Initial Assessment Types
export interface InitialAssessment {
    propertyConditions: {
        mainRoofDamaged: boolean;
        homeCluttered: boolean;
        incidentConfirmed: boolean;
        insuredUnderstandsSteps: boolean;
        insuredAdvisedEquipment: boolean;
        insuredUnderstandsObligations: boolean;
    };
    requirements: {
        homeMaintained: boolean;
        insuredWillingToProceed: boolean;
        specialtyDrying: boolean;
        disposal: boolean;
        storage: boolean;
        scopeToBeAdded: boolean;
        dryingEquipment: boolean;
        afdInstalled: boolean;
    };
}
