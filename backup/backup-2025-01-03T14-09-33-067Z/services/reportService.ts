import type { ReportData, ReportOptions } from '../types/report';

export class ReportError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ReportError';
  }
}

export const fetchReportData = async (options: ReportOptions): Promise<ReportData> => {
  try {
    const queryParams = new URLSearchParams({
      includeSops: options.includeSops.toString(),
      includeGuidelines: options.includeGuidelines.toString()
    });

    const response = await fetch(`/api/report?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ReportError(
        errorData.error || 'Failed to fetch report data',
        response.status
      );
    }

    const data = await response.json();
    return data as ReportData;
  } catch (error) {
    if (error instanceof ReportError) {
      throw error;
    }
    
    console.error('Error fetching report data:', error);
    throw new ReportError(
      'Failed to fetch report data',
      500
    );
  }
};

export const validateReportData = (data: ReportData): string[] => {
  const errors: string[] = [];

  // Validate job details
  if (!data.jobDetails.jobNumber) {
    errors.push('Job number is required');
  }
  if (!data.jobDetails.clientName) {
    errors.push('Client name is required');
  }

  // Validate arrays are present (even if empty)
  if (!Array.isArray(data.sops)) {
    errors.push('SOPs must be an array');
  }
  if (!Array.isArray(data.guidelines)) {
    errors.push('Guidelines must be an array');
  }

  return errors;
};
