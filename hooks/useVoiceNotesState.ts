'use client';
import { useState, useCallback } from 'react';
import { VoiceNote } from '../types/voice';
import { SearchFilters } from '../components/SearchBar';

export interface VoiceNotesState {
  isProcessing: boolean;
  error: string | null;
  selectedNote: VoiceNote | null;
  isEditorOpen: boolean;
  isExportOpen: boolean;
  isShareOpen: boolean;
  isShortcutsOpen: boolean;
  liveTranscript: string;
  showTranscript: boolean;
  searchQuery: string;
  filters: SearchFilters;
  notification: { message: string; severity: 'success' | 'error' } | null;
}

export function useVoiceNotesState() {
  const [state, setState] = useState<VoiceNotesState>({
    isProcessing: false,
    error: null,
    selectedNote: null,
    isEditorOpen: false,
    isExportOpen: false,
    isShareOpen: false,
    isShortcutsOpen: false,
    liveTranscript: '',
    showTranscript: false,
    searchQuery: '',
    filters: {
      types: [],
      severities: [],
      locations: [],
      hasPhotos: false,
      hasAnalysis: false,
      hasCriticalIssues: false
    },
    notification: null
  });

  const [selectedNotes, setSelectedNotes] = useState<VoiceNote[]>([]);

  const updateState = useCallback((updates: Partial<VoiceNotesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
    setState(prev => ({
      ...prev,
      notification: { message, severity }
    }));
  }, []);

  const clearNotification = useCallback(() => {
    setState(prev => ({ ...prev, notification: null }));
  }, []);

  const toggleTranscript = useCallback(() => {
    setState(prev => ({ ...prev, showTranscript: !prev.showTranscript }));
  }, []);

  return {
    state,
    updateState,
    selectedNotes,
    setSelectedNotes,
    showNotification,
    clearNotification,
    toggleTranscript
  };
}
