import type { 
  HazardousMaterial, 
  HazardAssessment, 
  SafetyMeasure,
  SafetyMeasureType,
  ImplementationStatus,
  Effectiveness,
  HazardReport 
} from '../types/hazard';

class HazardService {
  private static instance: HazardService;

  private constructor() {}

  public static getInstance(): HazardService {
    if (!HazardService.instance) {
      HazardService.instance = new HazardService();
    }
    return HazardService.instance;
  }

  async createAssessment(jobNumber: string, materials: HazardousMaterial[]): Promise<HazardAssessment> {
    try {
      const response = await fetch('/api/hazards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobNumber, materials }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create hazard assessment');
      }

      const assessment = await response.json();

      return {
        id: assessment.id,
        inspectionId: assessment.jobNumber,
        materials: JSON.parse(assessment.materials),
        assessmentDate: assessment.assessmentDate,
        assessedBy: assessment.assessedBy,
        notes: assessment.notes,
        recommendations: JSON.parse(assessment.recommendations),
        photos: JSON.parse(assessment.photos),
        status: assessment.status as 'draft' | 'completed' | 'reviewed',
        reviewedBy: assessment.reviewedBy || undefined,
        reviewDate: assessment.reviewDate || undefined
      };
    } catch (error) {
      console.error('Error creating hazard assessment:', error);
      throw error;
    }
  }

  async updateAssessment(
    assessmentId: string,
    updates: Partial<HazardAssessment>
  ): Promise<HazardAssessment> {
    try {
      const response = await fetch(`/api/hazards/${assessmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update hazard assessment');
      }

      const assessment = await response.json();

      return {
        id: assessment.id,
        inspectionId: assessment.jobNumber,
        materials: JSON.parse(assessment.materials),
        assessmentDate: assessment.assessmentDate,
        assessedBy: assessment.assessedBy,
        notes: assessment.notes,
        recommendations: JSON.parse(assessment.recommendations),
        photos: JSON.parse(assessment.photos),
        status: assessment.status as 'draft' | 'completed' | 'reviewed',
        reviewedBy: assessment.reviewedBy || undefined,
        reviewDate: assessment.reviewDate || undefined
      };
    } catch (error) {
      console.error('Error updating hazard assessment:', error);
      throw error;
    }
  }

  async addSafetyMeasure(measure: Omit<SafetyMeasure, 'id'>): Promise<SafetyMeasure> {
    try {
      const response = await fetch(`/api/hazards/${measure.hazardAssessmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measure),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add safety measure');
      }

      const safetyMeasure = await response.json();

      return {
        id: safetyMeasure.id,
        hazardAssessmentId: safetyMeasure.hazardAssessmentId,
        type: safetyMeasure.type as SafetyMeasureType,
        description: safetyMeasure.description,
        implementationStatus: safetyMeasure.implementationStatus as ImplementationStatus,
        effectiveness: safetyMeasure.effectiveness as Effectiveness,
        notes: safetyMeasure.notes,
        verificationDate: safetyMeasure.verificationDate || undefined,
        verifiedBy: safetyMeasure.verifiedBy || undefined
      };
    } catch (error) {
      console.error('Error adding safety measure:', error);
      throw error;
    }
  }

  async generateReport(assessmentId: string): Promise<HazardReport> {
    try {
      const response = await fetch(`/api/hazards/${assessmentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate hazard report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating hazard report:', error);
      throw error;
    }
  }
}

export const hazardService = HazardService.getInstance();
