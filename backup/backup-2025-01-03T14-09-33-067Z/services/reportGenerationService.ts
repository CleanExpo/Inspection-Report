import { jobManagementService } from './jobManagementService';
import { moistureManagementService } from './moistureManagementService';
import { equipmentTrackingService } from './equipmentTrackingService';
import { documentationService } from './documentationService';
import { sketchService } from './sketchService';
import { visualizationService } from './visualizationService';

interface ReportOptions {
    includePhotos: boolean;
    includeMoistureReadings: boolean;
    includeEquipmentLogs: boolean;
    includeFloorPlans: boolean;
    includeThermalImages: boolean;
}

/**
 * Service for generating comprehensive inspection reports
 */
class ReportGenerationService {
    private static instance: ReportGenerationService;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): ReportGenerationService {
        if (!ReportGenerationService.instance) {
            ReportGenerationService.instance = new ReportGenerationService();
        }
        return ReportGenerationService.instance;
    }

    /**
     * Generate initial inspection report
     */
    generateInitialReport(jobId: string): string {
        const job = jobManagementService.getJob(jobId);
        const inspection = jobManagementService.getInspectionReport(jobId);
        const floorPlans = sketchService.getAllFloorPlans(jobId);

        if (!job || !inspection) {
            throw new Error('Missing required job information');
        }

        let report = this.generateHeader(job);
        report += this.generateClientSection(job);
        report += this.generateInitialAssessment(inspection);
        report += this.generateMoistureReadings(jobId);
        report += this.generateEquipmentSection(jobId);
        report += this.generateFloorPlans(floorPlans);
        report += this.generatePhotosSection(jobId);
        report += this.generateRecommendations(inspection);

        return report;
    }

    /**
     * Generate progress report
     */
    generateProgressReport(jobId: string, date: string): string {
        const job = jobManagementService.getJob(jobId);
        const readings = moistureManagementService.getReadings('all', 'all');
        const equipment = equipmentTrackingService.getActiveEquipment();

        if (!job) {
            throw new Error('Job not found');
        }

        let report = this.generateHeader(job);
        report += this.generateProgressSummary(jobId, date);
        report += this.generateMoistureComparison(readings);
        report += this.generateEquipmentStatus(equipment);
        report += this.generateIssuesSection(jobId);

        return report;
    }

    /**
     * Generate final report
     */
    generateFinalReport(jobId: string, options: ReportOptions): string {
        const job = jobManagementService.getJob(jobId);
        const inspection = jobManagementService.getInspectionReport(jobId);
        const scope = jobManagementService.getScopeOfWork(jobId);
        const moistureMap = visualizationService.generateMoistureMap();

        if (!job || !inspection || !scope) {
            throw new Error('Missing required job information');
        }

        let report = this.generateHeader(job);
        report += this.generateExecutiveSummary(job, inspection, scope);
        
        if (options.includeMoistureReadings) {
            report += this.generateMoistureHistory(jobId);
        }
        
        if (options.includeEquipmentLogs) {
            report += this.generateEquipmentHistory(jobId);
        }
        
        if (options.includeFloorPlans) {
            report += this.generateFloorPlans(sketchService.getAllFloorPlans(jobId));
        }
        
        if (options.includePhotos) {
            report += this.generatePhotosSection(jobId);
        }

        report += this.generateComplianceSection(jobId);
        report += this.generateSignoffSection();

        return report;
    }

    private generateHeader(job: any): string {
        return `
DISASTER RECOVERY QLD
Insurance Claims made easy

Initial Assessment / Report / Estimation

Job No: ${job.jobId}
Date: ${new Date().toLocaleDateString()}
Client: ${job.clientInfo.name}
Address: ${job.clientInfo.address}
        `;
    }

    private generateClientSection(job: any): string {
        return `
Client Information:
------------------
Name: ${job.clientInfo.name}
Phone: ${job.clientInfo.phone}
Email: ${job.clientInfo.email}
Insurance: ${job.clientInfo.insurance.company}
Policy No: ${job.clientInfo.insurance.policyNumber}
Claim No: ${job.clientInfo.insurance.claimNumber}
        `;
    }

    private generateInitialAssessment(inspection: any): string {
        return `
Initial Assessment:
------------------
Technician: ${inspection.technician}
Date: ${inspection.date}

Property Condition:
External: ${inspection.propertyCondition.exterior.notes.join(', ')}
Internal: ${inspection.propertyCondition.interior.notes.join(', ')}
Hazards: ${inspection.propertyCondition.hazards.join(', ')}

Affected Areas:
${inspection.affectedAreas.map((area: { 
    area: string;
    damage: string[];
    readings: { moisture: number; humidity: number; temperature: number };
    recommendations: string[];
}) => `
- ${area.area}:
  Damage: ${area.damage.join(', ')}
  Readings: M=${area.readings.moisture}%, RH=${area.readings.humidity}%, T=${area.readings.temperature}°C
  Recommendations: ${area.recommendations.join(', ')}
`).join('\n')}
        `;
    }

    private generateMoistureReadings(jobId: string): string {
        const readings = moistureManagementService.getReadings('all', 'all');
        return `
Moisture Readings:
-----------------
${readings.map(reading => `
Area: ${reading.area} - ${reading.room}
Date: ${new Date(reading.timestamp).toLocaleDateString()}
Readings:
- Subfloor: ${reading.readings.subfloorWME}%
- Flooring: ${reading.readings.flooringWME}%
- Base Plate: ${reading.readings.basePlateWME}%
- Bottom Wall: ${reading.readings.bottomWallWME}%
- RH: ${reading.readings.relativeHumidity}%
- Temperature: ${reading.readings.airTemp}°C
`).join('\n')}
        `;
    }

    private generateEquipmentSection(jobId: string): string {
        const equipment = equipmentTrackingService.getActiveEquipment();
        return `
Equipment Installed:
-------------------
${equipment.map(eq => `
Type: ${eq.type}
Serial: ${eq.serialNumber}
Location: ${eq.location.area} - ${eq.location.room}
Install Date: ${new Date(eq.installDate).toLocaleDateString()}
`).join('\n')}
        `;
    }

    private generateFloorPlans(floorPlans: any[]): string {
        return `
Floor Plans:
-----------
${floorPlans.map(plan => `
Level: ${plan.level}
Dimensions: ${plan.dimensions.width}x${plan.dimensions.height} ${plan.dimensions.unit}

${plan.rooms.map((room: {
    name: string;
    dimensions: { width: number; height: number; unit: string };
    features: Array<{ label: string }>;
    affectedAreas: any[];
}) => `
Room: ${room.name}
Size: ${room.dimensions.width}x${room.dimensions.height} ${room.dimensions.unit}
Features: ${room.features.map((f: { label: string }) => f.label).join(', ')}
Affected Areas: ${room.affectedAreas.length}
`).join('\n')}
`).join('\n')}
        `;
    }

    private generatePhotosSection(jobId: string): string {
        const photos = documentationService.getPhotos();
        return `
Photo Documentation:
-------------------
${photos.map(photo => `
ID: ${photo.id}
Type: ${photo.type}
Location: ${photo.area || ''} ${photo.room || ''}
Description: ${photo.description}
Timestamp: ${new Date(photo.timestamp).toLocaleDateString()}
`).join('\n')}
        `;
    }

    private generateRecommendations(inspection: any): string {
        return `
Recommendations:
---------------
${inspection.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
        `;
    }

    private generateProgressSummary(jobId: string, date: string): string {
        // Implementation would include progress metrics and status updates
        return '';
    }

    private generateMoistureComparison(readings: any[]): string {
        // Implementation would compare readings over time
        return '';
    }

    private generateEquipmentStatus(equipment: any[]): string {
        // Implementation would include equipment runtime and effectiveness
        return '';
    }

    private generateIssuesSection(jobId: string): string {
        // Implementation would list any issues or concerns
        return '';
    }

    private generateExecutiveSummary(job: any, inspection: any, scope: any): string {
        // Implementation would provide overview of entire job
        return '';
    }

    private generateMoistureHistory(jobId: string): string {
        // Implementation would show moisture trends
        return '';
    }

    private generateEquipmentHistory(jobId: string): string {
        // Implementation would show equipment usage history
        return '';
    }

    private generateComplianceSection(jobId: string): string {
        // Implementation would include compliance checklist
        return '';
    }

    private generateSignoffSection(): string {
        return `
Sign-off:
--------
Technician: ___________________ Date: ___________________

Client: ______________________ Date: ___________________
        `;
    }
}

export const reportGenerationService = ReportGenerationService.getInstance();
