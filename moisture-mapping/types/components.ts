import { 
  MediaItem, 
  FieldNote, 
  Report, 
  Technician 
} from './shared';
import { 
  LidarScan, 
  CrossSection, 
  Point3D,
  MoisturePoint3D,
  ThermalPoint,
  TimeSeriesData as LidarTimeSeriesData
} from './lidar';
import { MoistureReading } from './moisture';

// Component-specific interfaces
export interface AdminReport extends Omit<Report, 'moistureReadings'> {
  moistureReadings: {
    date: string;
    average: number;
    critical: number;
  }[];
}

export interface LidarMoistureMapProps {
  readings: MoistureReading[];
  onMoistureReading: (reading: MoistureReading) => void;
}

export interface LidarControlsProps {
  onViewChange: (view: '3d' | '2d' | 'slice') => void;
  onToggleOverlay: (overlay: 'thermal' | 'moisture' | 'risk') => void;
  onSlicePositionChange: (position: number) => void;
  onTimeChange: (index: number) => void;
  activeOverlays: {
    thermal: boolean;
    moisture: boolean;
    risk: boolean;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
}

export interface LidarCrossSectionProps {
  crossSection: CrossSection;
  showMoisture: boolean;
  showThermal: boolean;
  onPointClick: (point: Point3D) => void;
}

export interface LidarMeasurementsProps {
  onMeasurementStart: (type: 'distance' | 'area' | 'volume') => void;
  onMeasurementComplete: (measurement: {
    type: 'distance' | 'area' | 'volume';
    value: number;
    unit: string;
    points: Point3D[];
  }) => void;
  activePoints: Point3D[];
  isMetric: boolean;
}

export interface LidarTimeSeriesProps {
  data: LidarTimeSeriesData[];
  currentIndex: number;
  onTimeChange: (index: number) => void;
  showMoisture: boolean;
  showThermal: boolean;
  showStructural: boolean;
}

export interface MediaManagerProps {
  onMediaCapture: (media: MediaItem) => void;
  onMediaDelete: (id: string) => void;
  onMediaUpdate: (media: MediaItem) => void;
}

export interface FieldNotesProps {
  onSaveNote: (note: FieldNote) => void;
  onUpdateNote: (note: FieldNote) => void;
  onDeleteNote: (id: string) => void;
  onMediaRequest?: () => void;
}

export interface AdminDashboardProps {
  reports: AdminReport[];
  technicians: Technician[];
  onReportApprove: (reportId: string) => void;
  onReportReview: (reportId: string, notes: string) => void;
  onTechnicianNotify: (technicianId: string, message: string) => void;
  onReportDownload: (reportId: string) => void;
  onReportPrint: (reportId: string) => void;
}

// Re-export types from lidar.ts to ensure consistency
export type { LidarTimeSeriesData };
