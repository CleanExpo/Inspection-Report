import { InspectionReport } from '../types/inspection';

interface SaveReportOptions {
  generatePdf?: boolean;
  notifyStakeholders?: boolean;
  updateCrm?: boolean;
}

interface SaveReportResponse {
  success: boolean;
  reportId?: string;
  pdfUrl?: string;
  error?: string;
}

interface LoadReportResponse {
  success: boolean;
  report?: InspectionReport;
  error?: string;
}

export async function saveReport(
  report: Partial<InspectionReport>,
  options: SaveReportOptions = {}
): Promise<SaveReportResponse> {
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        report,
        options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save report');
    }

    return await response.json();
  } catch (error) {
    console.error('Save report error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save report'
    };
  }
}

export async function loadReport(reportId: string): Promise<LoadReportResponse> {
  try {
    const response = await fetch(`/api/reports/${reportId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load report');
    }

    return await response.json();
  } catch (error) {
    console.error('Load report error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load report'
    };
  }
}

export async function updateReport(
  reportId: string,
  updates: Partial<InspectionReport>,
  options: SaveReportOptions = {}
): Promise<SaveReportResponse> {
  try {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        updates,
        options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update report');
    }

    return await response.json();
  } catch (error) {
    console.error('Update report error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update report'
    };
  }
}

export async function deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete report');
    }

    return { success: true };
  } catch (error) {
    console.error('Delete report error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete report'
    };
  }
}

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout;

export function setupAutoSave(
  report: Partial<InspectionReport>,
  onSave?: (response: SaveReportResponse) => void,
  onError?: (error: Error) => void,
  delay: number = 5000 // 5 seconds
) {
  clearTimeout(autoSaveTimeout);

  autoSaveTimeout = setTimeout(async () => {
    try {
      const response = await saveReport(report, {
        generatePdf: false,
        notifyStakeholders: false,
        updateCrm: true
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      onSave?.(response);
    } catch (error) {
      console.error('Auto-save error:', error);
      onError?.(error instanceof Error ? error : new Error('Auto-save failed'));
    }
  }, delay);

  return () => clearTimeout(autoSaveTimeout);
}

// Batch operations
export async function batchSaveReports(
  reports: Partial<InspectionReport>[],
  options: SaveReportOptions = {}
): Promise<SaveReportResponse[]> {
  try {
    const response = await fetch('/api/reports/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reports,
        options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save reports');
    }

    return await response.json();
  } catch (error) {
    console.error('Batch save error:', error);
    return reports.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save reports'
    }));
  }
}

// Report validation
export function validateReport(report: Partial<InspectionReport>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!report.jobDetails?.jobNumber) {
    errors.push('Job number is required');
  }

  if (!report.clientInfo?.clientName) {
    errors.push('Client name is required');
  }

  if (!report.clientInfo?.propertyAddress) {
    errors.push('Property address is required');
  }

  // Safety documents
  if (!report.safetyDocuments?.JSA) {
    errors.push('JSA is required');
  }

  if (!report.safetyDocuments?.SWMS) {
    errors.push('SWMS is required');
  }

  // Authority forms
  if (report.authorityForms) {
    if (!report.authorityForms.authorityToWork) {
      errors.push('Authority to work is required');
    }
  } else {
    errors.push('Authority forms are required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
