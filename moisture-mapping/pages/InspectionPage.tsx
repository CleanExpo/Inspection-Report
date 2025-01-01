import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  ViewInAr as View3DIcon,
  Map as MapIcon,
  Camera as CameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import LidarMoistureMap from '../components/LidarMoistureMap';
import LidarControls from '../components/LidarControls';
import LidarCrossSection from '../components/LidarCrossSection';
import LidarTimeSeries from '../components/LidarTimeSeries';
import LidarMeasurements from '../components/LidarMeasurements';
import MediaManager from '../components/MediaManager';
import FieldNotes from '../components/FieldNotes';
import { 
  MediaItem, 
  FieldNote 
} from '../types/shared';
import { 
  TimeSeriesData,
  LidarScan 
} from '../types/lidar';
import { MoistureReading } from '../types/moisture';

export default function InspectionPage() {
  const { state, dispatch } = useAppContext();
  const { showNotification, startLoading, stopLoading } = useLoading();

  // View state
  const [view, setView] = useState<'3d' | '2d' | 'slice'>('3d');
  const [overlays, setOverlays] = useState({
    thermal: false,
    moisture: true,
    risk: false
  });
  const [slicePosition, setSlicePosition] = useState(50);
  const [timeIndex, setTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Prepare time series data
  const timeSeriesData: TimeSeriesData[] = state.lidarScans.map(scan => ({
    timestamp: scan.timestamp,
    moistureReadings: scan.moisturePoints,
    thermalData: scan.thermalPoints,
    structuralChanges: scan.structuralRisks?.map(risk => ({
      location: risk.location,
      type: 'moisture-damage',
      value: 1
    }))
  }));

  // Handle moisture reading
  const handleMoistureReading = async (reading: MoistureReading) => {
    try {
      startLoading('Saving moisture reading...');
      dispatch({ type: 'ADD_MOISTURE_READING', payload: reading });
      showNotification('Moisture reading saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save moisture reading', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  // Handle media capture
  const handleMediaCapture = async (media: MediaItem) => {
    try {
      startLoading('Saving media...');
      dispatch({ type: 'ADD_MEDIA_ITEM', payload: media });
      showNotification('Media saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save media', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  // Handle field notes
  const handleNoteSave = async (note: FieldNote) => {
    try {
      startLoading('Saving note...');
      dispatch({ type: 'ADD_FIELD_NOTE', payload: note });
      showNotification('Note saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save note', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Active Inspection</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => {/* Handle save inspection */}}
            >
              Save Inspection
            </Button>
            <Tooltip title="Add Reading">
              <IconButton onClick={() => {/* Handle add reading */}}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Take Photo">
              <IconButton onClick={() => {/* Handle take photo */}}>
                <CameraIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Inspection Area */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* LiDAR Map */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Moisture Map
                </Typography>
                <LidarMoistureMap
                  readings={state.moistureReadings}
                  onMoistureReading={handleMoistureReading}
                />
                <Divider sx={{ my: 2 }} />
                <LidarControls
                  onViewChange={setView}
                  onToggleOverlay={(overlay) => setOverlays(prev => ({
                    ...prev,
                    [overlay]: !prev[overlay as keyof typeof prev]
                  }))}
                  onSlicePositionChange={setSlicePosition}
                  onTimeChange={setTimeIndex}
                  activeOverlays={overlays}
                  isPlaying={isPlaying}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                />
              </Paper>

              {/* Time Series */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Moisture Trends
                </Typography>
                <LidarTimeSeries
                  data={timeSeriesData}
                  currentIndex={timeIndex}
                  onTimeChange={setTimeIndex}
                  showMoisture={overlays.moisture}
                  showThermal={overlays.thermal}
                  showStructural={overlays.risk}
                />
              </Paper>
            </Stack>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Measurements */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Measurements
                </Typography>
                <LidarMeasurements
                  onMeasurementStart={() => {}}
                  onMeasurementComplete={() => {}}
                  activePoints={[]}
                  isMetric={true}
                />
              </Paper>

              {/* Media */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Media & Notes
                </Typography>
                <MediaManager
                  onMediaCapture={handleMediaCapture}
                  onMediaDelete={(id) => dispatch({ type: 'DELETE_MEDIA_ITEM', payload: id })}
                  onMediaUpdate={(media) => dispatch({ type: 'UPDATE_MEDIA_ITEM', payload: media })}
                />
                <Divider sx={{ my: 2 }} />
                <FieldNotes
                  onSaveNote={handleNoteSave}
                  onUpdateNote={(note) => dispatch({ type: 'UPDATE_FIELD_NOTE', payload: note })}
                  onDeleteNote={(id) => dispatch({ type: 'DELETE_FIELD_NOTE', payload: id })}
                  onMediaRequest={() => {/* Handle media request */}}
                />
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}
