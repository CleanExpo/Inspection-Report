import { MoistureReading } from './moisture';
import { LidarScan, Point3D } from './lidar';

export interface MediaItem {
  id: string;
  type: 'audio' | 'video' | 'photo' | 'document';
  url: string;
  thumbnail?: string;
  title: string;
  timestamp: string;
  duration?: number;
  size: number;
  tags: string[];
  notes?: string;
  location?: Point3D;
  moistureReadings?: MoistureReading[];
  lidarData?: LidarScan;
}

export interface FieldNote {
  id: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'checklist';
  category: string;
  status: 'pending' | 'completed' | 'flagged';
  mediaIds?: string[];
  checklistItems?: ChecklistItem[];
  moistureReadings?: MoistureReading[];
  location?: Point3D;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  required: boolean;
}

export interface Report {
  id: string;
  title: string;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'review' | 'approved';
  timestamp: string;
  mediaCount: number;
  notes: string[];
  flaggedItems: string[];
  mediaItems: MediaItem[];
  fieldNotes: FieldNote[];
  moistureReadings: MoistureReading[];
  lidarScans: LidarScan[];
}

export interface Technician {
  id: string;
  name: string;
  activeJobs: number;
  completedJobs: number;
  certifications: string[];
  status: 'active' | 'onsite' | 'offline';
  currentLocation?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface AppSettings {
  general: {
    theme: 'light' | 'dark' | 'system';
    measurementUnit: 'metric' | 'imperial';
    autoSync: boolean;
    syncInterval: number;
  };
  moisture: {
    warningThreshold: number;
    criticalThreshold: number;
    defaultMaterial: string;
  };
  display: {
    defaultView: '3d' | '2d' | 'slice';
    showThermalOverlay: boolean;
    showStructuralOverlay: boolean;
    animationSpeed: number;
  };
  export: {
    defaultFormat: 'pdf' | 'csv' | 'xlsx';
    includeMeasurements: boolean;
    includePhotos: boolean;
    includeNotes: boolean;
  };
}

export interface AppState {
  reports: Report[];
  technicians: Technician[];
  activeReport: string | null;
  activeTechnician: string | null;
  mediaItems: MediaItem[];
  fieldNotes: FieldNote[];
  moistureReadings: MoistureReading[];
  lidarScans: LidarScan[];
  notifications: Notification[];
  settings: AppSettings;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetType?: 'report' | 'technician' | 'media' | 'note';
}

export type AppAction =
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'DELETE_REPORT'; payload: string }
  | { type: 'SET_ACTIVE_REPORT'; payload: string }
  | { type: 'UPDATE_TECHNICIAN'; payload: Technician }
  | { type: 'SET_ACTIVE_TECHNICIAN'; payload: string }
  | { type: 'ADD_MEDIA_ITEM'; payload: MediaItem }
  | { type: 'UPDATE_MEDIA_ITEM'; payload: MediaItem }
  | { type: 'DELETE_MEDIA_ITEM'; payload: string }
  | { type: 'ADD_FIELD_NOTE'; payload: FieldNote }
  | { type: 'UPDATE_FIELD_NOTE'; payload: FieldNote }
  | { type: 'DELETE_FIELD_NOTE'; payload: string }
  | { type: 'ADD_MOISTURE_READING'; payload: MoistureReading }
  | { type: 'UPDATE_MOISTURE_READING'; payload: MoistureReading }
  | { type: 'DELETE_MOISTURE_READING'; payload: string }
  | { type: 'ADD_LIDAR_SCAN'; payload: LidarScan }
  | { type: 'UPDATE_LIDAR_SCAN'; payload: LidarScan }
  | { type: 'DELETE_LIDAR_SCAN'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings };

export const initialState: AppState = {
  reports: [],
  technicians: [],
  activeReport: null,
  activeTechnician: null,
  mediaItems: [],
  fieldNotes: [],
  moistureReadings: [],
  lidarScans: [],
  notifications: [],
  settings: {
    general: {
      theme: 'system',
      measurementUnit: 'metric',
      autoSync: true,
      syncInterval: 5
    },
    moisture: {
      warningThreshold: 20,
      criticalThreshold: 25,
      defaultMaterial: 'Drywall'
    },
    display: {
      defaultView: '3d',
      showThermalOverlay: true,
      showStructuralOverlay: true,
      animationSpeed: 1
    },
    export: {
      defaultFormat: 'pdf',
      includeMeasurements: true,
      includePhotos: true,
      includeNotes: true
    }
  }
};
