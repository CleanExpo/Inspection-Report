export interface JobDetails {
  jobNumber: string;
  clientName: string;
}

export interface ReportData {
  jobDetails: JobDetails;
  sops: string[];
  guidelines: string[];
}

export interface ReportOptions {
  includeSops: boolean;
  includeGuidelines: boolean;
}
