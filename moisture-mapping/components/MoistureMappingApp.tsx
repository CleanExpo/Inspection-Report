import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Assignment as ReportIcon,
  Build as ToolsIcon,
  Settings as SettingsIcon,
  Assessment as AnalyticsIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';
import { useLoading, useAsyncOperation } from '../context/LoadingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import MediaManager from './MediaManager';
import FieldNotes from './FieldNotes';
import AdminDashboard from './AdminDashboard';
import LidarMoistureMap from './LidarMoistureMap';
import LidarControls from './LidarControls';
import LidarCrossSection from './LidarCrossSection';
import LidarTimeSeries from './LidarTimeSeries';
import LidarMeasurements from './LidarMeasurements';
import AdvancedReporting from './AdvancedReporting';
import { 
  MediaItem, 
  FieldNote, 
  Report, 
  Technician,
  Notification,
  AppState
} from '../types/shared';
import { 
  LidarScan, 
  CrossSection, 
  Point3D, 
  TimeSeriesData,
  ThermalPoint 
} from '../types/lidar';
import { MoistureReading } from '../types/moisture';
import {
  AdminReport,
  LidarMoistureMapProps,
  LidarControlsProps,
  LidarCrossSectionProps,
  LidarMeasurementsProps,
  LidarTimeSeriesProps,
  MediaManagerProps,
  FieldNotesProps,
  AdminDashboardProps
} from '../types/components';

export default function MoistureMappingApp() {
  const { state, dispatch } = useAppContext();
  const { showNotification, startLoading, stopLoading } = useLoading();
  
  // UI State
  const [selectedTab, setSelectedTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LiDAR view state
  const [view, setView] = useState<'3d' | '2d' | 'slice'>('3d');
  const [overlays, setOverlays] = useState({
    thermal: false,
    moisture: true,
    risk: false
  });
  const [slicePosition, setSlicePosition] = useState(50);
  const [timeIndex, setTimeIndex] = useState(0);
  const [selectedCrossSection, setSelectedCrossSection] = useState<CrossSection | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Memoized derived state
  const activeReport = useMemo(() => 
    state.reports.find(r => r.id === state.activeReport),
    [state.reports, state.activeReport]
  );

  const unreadNotifications = useMemo(() =>
    state.notifications.filter(n => !n.read),
    [state.notifications]
  );

  // Transform reports for AdminDashboard
  const adminReports: AdminReport[] = useMemo(() => 
    state.reports.map(report => ({
      ...report,
      moistureReadings: report.moistureReadings.reduce<AdminReport['moistureReadings']>((acc, reading) => {
        const date = reading.timestamp.split('T')[0];
        const existing = acc.find(r => r.date === date);
        if (existing) {
          existing.average = (existing.average + reading.value) / 2;
          existing.critical = Math.max(existing.critical, reading.value);
        } else {
          acc.push({
            date,
            average: reading.value,
            critical: reading.value
          });
        }
        return acc;
      }, [])
    })),
    [state.reports]
  );

  // Prepare time series data
  const timeSeriesData: TimeSeriesData[] = useMemo(() => 
    state.lidarScans.map(scan => ({
      timestamp: scan.timestamp,
      moistureReadings: scan.moisturePoints,
      thermalData: scan.thermalPoints,
      structuralChanges: scan.structuralRisks?.map(risk => ({
        location: risk.location,
        type: 'moisture-damage',
        value: 1
      }))
    })),
    [state.lidarScans]
  );

  // Data synchronization check
  useEffect(() => {
    const checkDataSync = async () => {
      try {
        startLoading('Checking data synchronization...');
        const lastSync = localStorage.getItem('lastSyncTimestamp');
        const currentTime = new Date().getTime();
        
        if (!lastSync || currentTime - parseInt(lastSync) > 5 * 60 * 1000) {
          showNotification('Synchronizing data...', 'info');
          // Implement your sync logic here
          localStorage.setItem('lastSyncTimestamp', currentTime.toString());
          showNotification('Data synchronized successfully', 'success');
        }
      } catch (error) {
        showNotification('Failed to synchronize data', 'error');
        console.error('Sync error:', error);
      } finally {
        stopLoading();
      }
    };

    checkDataSync();
    const syncInterval = setInterval(checkDataSync, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  // Media operations
  const handleMediaCapture = async (mediaItem: MediaItem) => {
    const execute = useAsyncOperation(
      'media-capture',
      async () => {
        dispatch({ type: 'ADD_MEDIA_ITEM', payload: mediaItem });
        if (activeReport) {
          const updatedReport: Report = {
            ...activeReport,
            mediaItems: [...activeReport.mediaItems, mediaItem],
            mediaCount: activeReport.mediaCount + 1
          };
          dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
        }
      },
      {
        loadingMessage: 'Saving media...',
        successMessage: 'Media saved successfully',
        errorMessage: 'Failed to save media'
      }
    );
    await execute();
  };

  const handleMediaDelete = (id: string) => {
    dispatch({ type: 'DELETE_MEDIA_ITEM', payload: id });
  };

  const handleMediaUpdate = (mediaItem: MediaItem) => {
    dispatch({ type: 'UPDATE_MEDIA_ITEM', payload: mediaItem });
  };

  // Field notes operations
  const handleNoteSave = (note: FieldNote) => {
    dispatch({ type: 'ADD_FIELD_NOTE', payload: note });
  };

  const handleNoteUpdate = (note: FieldNote) => {
    dispatch({ type: 'UPDATE_FIELD_NOTE', payload: note });
  };

  const handleNoteDelete = (id: string) => {
    dispatch({ type: 'DELETE_FIELD_NOTE', payload: id });
  };

  // Moisture readings
  const handleMoistureReading = async (reading: MoistureReading) => {
    const execute = useAsyncOperation(
      'moisture-reading',
      async () => {
        dispatch({ type: 'ADD_MOISTURE_READING', payload: reading });
        if (activeReport) {
          const updatedReport: Report = {
            ...activeReport,
            moistureReadings: [...activeReport.moistureReadings, reading]
          };
          dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
        }
      },
      {
        loadingMessage: 'Saving moisture reading...',
        successMessage: 'Moisture reading saved successfully',
        errorMessage: 'Failed to save moisture reading'
      }
    );
    await execute();
  };

  // Measurement operations
  const handleMeasurementComplete: LidarMeasurementsProps['onMeasurementComplete'] = (measurement) => {
    console.log('Measurement completed:', measurement);
  };

  // Report operations
  const handleReportApprove = (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId);
    if (report) {
      dispatch({ 
        type: 'UPDATE_REPORT', 
        payload: { ...report, status: 'approved' as const } 
      });
    }
  };

  const handleReportReview = (reportId: string, notes: string) => {
    const report = state.reports.find(r => r.id === reportId);
    if (report) {
      dispatch({ 
        type: 'UPDATE_REPORT', 
        payload: { ...report, status: 'review' as const, notes: [...report.notes, notes] } 
      });
    }
  };

  const handleTechnicianNotify = (techId: string, message: string) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notification-${Date.now()}`,
        type: 'info',
        message,
        timestamp: new Date().toISOString(),
        read: false,
        targetId: techId,
        targetType: 'technician'
      }
    });
  };

  const handleReportDownload = (reportId: string) => {
    console.log('Downloading report:', reportId);
  };

  const handleReportPrint = (reportId: string) => {
    console.log('Printing report:', reportId);
  };

  // Export operations
  const handleExport = (format: 'pdf' | 'csv' | 'xlsx') => {
    console.log('Exporting in format:', format);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (reportId: string) => {
    console.log('Sharing report:', reportId);
  };

  // Wrap components with error boundaries
  const renderComponent = (Component: React.ComponentType<any>, props: any) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  // ... (rest of the component remains the same)

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex' }}>
        {/* ... (previous JSX remains the same) ... */}
      </Box>
    </ErrorBoundary>
  );
}
