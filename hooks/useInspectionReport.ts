import { useState, useCallback } from 'react';
import type { InspectionReport, InspectionStatus } from '../types/inspection';
import type { AuthorityFormData } from '../types/authority';

const defaultReport: Partial<InspectionReport> = {
  status: 'draft',
  notes: [],
  images: [],
  authorityForms: {
    authorityToWork: false,
    authorityToDrill: false,
    authorityToDispose: false,
    workAuthority: undefined,
    drillAuthority: undefined,
    disposeAuthority: undefined
  }
};

interface UseInspectionReportProps {
  jobNumber: string;
}

export const useInspectionReport = ({ jobNumber }: UseInspectionReportProps) => {
  const [report, setReport] = useState<Partial<InspectionReport>>(defaultReport);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Here you would typically:
      // 1. Fetch report from API
      // 2. Transform data if needed
      // 3. Handle any business logic

      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReport({
        ...defaultReport,
        jobNumber,
        inspectionDate: new Date().toISOString(),
        inspector: 'John Smith',
        location: '',
        images: [],
        notes: [],
        authorityForms: {
          authorityToWork: false,
          authorityToDrill: false,
          authorityToDispose: false
        }
      });
    } catch (error) {
      console.error('Error loading report:', error);
      setError(error instanceof Error ? error.message : 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  }, [jobNumber]);

  const updateReport = useCallback(async (updates: Partial<InspectionReport>) => {
    try {
      setError(null);
      // Here you would typically:
      // 1. Validate updates
      // 2. Send to API
      // 3. Handle response

      setReport(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to update report');
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (status: InspectionStatus) => {
    await updateReport({ status });
  }, [updateReport]);

  const saveAuthorityForm = useCallback(async (
    type: 'workAuthority' | 'drillAuthority' | 'disposeAuthority',
    data: AuthorityFormData
  ) => {
    try {
      setError(null);
      // Here you would typically:
      // 1. Validate form data
      // 2. Send to API
      // 3. Handle response

      const authorityKey = type.replace('Authority', 'ToWork') as keyof typeof defaultReport.authorityForms;

      setReport(prev => {
        if (!prev.authorityForms) return prev;

        return {
          ...prev,
          authorityForms: {
            ...prev.authorityForms,
            [type]: data,
            [authorityKey]: true
          }
        };
      });
    } catch (error) {
      console.error('Error saving authority form:', error);
      setError(error instanceof Error ? error.message : 'Failed to save authority form');
      throw error;
    }
  }, []);

  return {
    report,
    isLoading,
    error,
    loadReport,
    updateReport,
    updateStatus,
    saveAuthorityForm
  };
};
