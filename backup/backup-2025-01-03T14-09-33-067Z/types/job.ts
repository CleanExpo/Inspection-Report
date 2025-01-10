export interface PowerDetails {
  capacity: number;
  details: string;
}

export interface SafetyDocument {
  id: string;
  type: string;
  status: string;
  date: string;
}

export interface Equipment {
  id: string;
  name: string;
  recommendations: string;
}

export interface Note {
  id?: string;
  content: string;
  timestamp: string;
  author?: string;
}

export interface JobDetails {
  id?: string;
  jobNumber: string;
  clientName: string;
  jobAddress: string;
  powerDetails?: PowerDetails;
  safetyDocuments?: SafetyDocument[];
  sanitisationDetails?: {
    type: string;
    area: string;
    notes: string;
  };
  equipmentRecommendations?: Equipment[];
  clientFeedback?: {
    comments: string;
    rating: number;
  };
  furtherWorks?: {
    description: string;
    priority: string;
  }[];
  photos?: {
    id: string;
    url: string;
    caption: string;
  }[];
  notes?: Note[];
  status?: 'pending' | 'in-progress' | 'completed';
  lastUpdated?: string;
}

export interface ReportData {
  clientName: string;
  jobAddress: string;
  powerDetails?: PowerDetails;
  photos?: {
    id: string;
    url: string;
    caption: string;
  }[];
  notes?: Note[];
}
