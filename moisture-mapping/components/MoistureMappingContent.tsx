'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Grid
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

import RoomDetails from './RoomDetails';
import RoomControls from './RoomControls';
import MoistureReadingsSection from './MoistureReadingsSection';
import DryingProgressSection from './DryingProgressSection';
import OfflineStatus from './OfflineStatus';
import { MoistureSketchGrid } from './MoistureSketchGrid';
import { MoistureReading, calculateDryingProgressData } from '../types/moisture';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

interface MoistureMappingState {
  uploadedImage: string | null;
  isProcessing: boolean;
  roomId: string;
  roomName: string;
  roomDescription: string;
  moistureReadings: MoistureReading[];
  currentInspectionDay: number;
  selectedMaterial: string;
  currentReading: number | undefined;
  error: string;
  finalizedDays: number[];
  activeTab: number;
  searchTerm: string;
  filterMaterial: string;
}

export default function MoistureMappingContent() {
  const [state, setState] = useState<MoistureMappingState>({
    uploadedImage: null,
    isProcessing: false,
    roomId: uuidv4(),
    roomName: '',
    roomDescription: '',
    moistureReadings: [],
    currentInspectionDay: 1,
    selectedMaterial: '',
    currentReading: undefined,
    error: '',
    finalizedDays: [],
    activeTab: 0,
    searchTerm: '',
    filterMaterial: ''
  });

  const { getAllReadings } = useOfflineStorage();
  const initialLoadRef = useRef(false);

  const updateState = useCallback((updates: Partial<MoistureMappingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadReadings = async () => {
      if (!initialLoadRef.current) {
        try {
          const readings = await getAllReadings();
          if (mounted && readings.length > 0) {
            const maxDay = Math.max(...readings.map((r: MoistureReading) => r.inspectionDay));
            updateState({
              moistureReadings: readings,
              currentInspectionDay: maxDay
            });
          }
        } catch (error) {
          console.error('Error loading readings:', error);
          if (mounted) {
            updateState({ error: 'Failed to load moisture readings' });
          }
        }
        initialLoadRef.current = true;
      }
    };

    loadReadings();
    return () => { mounted = false; };
  }, [getAllReadings, updateState]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      updateState({ isProcessing: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({
          uploadedImage: reader.result as string,
          isProcessing: false
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      updateState({
        isProcessing: false,
        error: 'Failed to process image'
      });
    }
  }, [updateState]);

  const readingsByDay = state.moistureReadings.reduce((acc, reading) => {
    const day = reading.inspectionDay;
    if (!acc[day]) acc[day] = [];
    acc[day].push(reading);
    return acc;
  }, {} as { [key: number]: MoistureReading[] });

  const dryingProgressData = calculateDryingProgressData(state.moistureReadings);
  const isDayFinalized = state.finalizedDays.includes(state.currentInspectionDay);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WaterDropIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          Moisture Mapping System
        </Typography>
        <OfflineStatus />
      </Box>

      {state.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => updateState({ error: '' })}
        >
          {state.error}
        </Alert>
      )}

      <RoomDetails
        roomName={state.roomName}
        roomDescription={state.roomDescription}
        onRoomNameChange={(e) => updateState({ roomName: e.target.value })}
        onRoomDescriptionChange={(e) => updateState({ roomDescription: e.target.value })}
      />

      <Grid container spacing={3}>
        {/* Room Sketch Area */}
        <Grid item xs={12} md={8}>
          <MoistureSketchGrid 
            roomId={state.roomId}
            currentInspectionDay={state.currentInspectionDay}
          />
        </Grid>

        {/* Controls */}
        <Grid item xs={12} md={4}>
          <RoomControls
            activeTab={state.activeTab}
            onTabChange={(newValue) => updateState({ activeTab: newValue })}
            onPhotoCapture={(photoData) => updateState({ uploadedImage: photoData })}
            onImageUpload={handleImageUpload}
            isProcessing={state.isProcessing}
            uploadedImage={state.uploadedImage}
          />
        </Grid>

        {/* Drying Progress */}
        <Grid item xs={12}>
          <DryingProgressSection
            progress={dryingProgressData}
            readings={state.moistureReadings}
          />
        </Grid>

        {/* Moisture Readings */}
        <Grid item xs={12}>
          <MoistureReadingsSection
            currentInspectionDay={state.currentInspectionDay}
            isDayFinalized={isDayFinalized}
            selectedMaterial={state.selectedMaterial}
            currentReading={state.currentReading}
            searchTerm={state.searchTerm}
            filterMaterial={state.filterMaterial}
            readingsByDay={readingsByDay}
            onAddReading={(reading) => updateState({ 
              moistureReadings: [...state.moistureReadings, reading] 
            })}
            onMaterialSelect={(material) => updateState({ selectedMaterial: material })}
            onValueChange={(value) => updateState({ currentReading: value })}
            onSearchChange={(value) => updateState({ searchTerm: value })}
            onFilterChange={(value) => updateState({ filterMaterial: value })}
            onFinalizeDay={() => updateState({ 
              finalizedDays: [...state.finalizedDays, state.currentInspectionDay] 
            })}
            onStartNewDay={() => updateState({ 
              currentInspectionDay: state.currentInspectionDay + 1 
            })}
          />
        </Grid>
      </Grid>
    </>
  );
}
