import { useState, useCallback, useEffect } from 'react';
import type { VoiceNote, VoiceNotesState } from '../types/voice';
import type { PhotoAttachment } from '../types/photo';

interface UseVoiceNotesLogicProps {
  jobNumber: string;
}

const initialState: VoiceNotesState = {
  isRecording: false,
  isProcessing: false,
  isPhotoCaptureOpen: false,
  error: null,
  notification: null,
  filter: {},
  sort: {
    field: 'createdAt',
    direction: 'desc'
  }
};

export const useVoiceNotesLogic = ({ jobNumber }: UseVoiceNotesLogicProps) => {
  const [state, setState] = useState<VoiceNotesState>(initialState);
  const [notes, setNotes] = useState<VoiceNote[]>([]);

  const updateState = useCallback((updates: Partial<VoiceNotesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      updateState({ isRecording: true, error: null });
      // Start recording logic here
    } catch (error) {
      console.error('Error starting recording:', error);
      updateState({
        isRecording: false,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      });
    }
  }, [updateState]);

  const handleStopRecording = useCallback(async () => {
    try {
      updateState({ isRecording: false, isProcessing: true });
      // Stop recording and process audio logic here
      updateState({ isProcessing: false });
    } catch (error) {
      console.error('Error stopping recording:', error);
      updateState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to stop recording'
      });
    }
  }, [updateState]);

  const handleUpdateNote = useCallback(async (noteId: string, updates: Partial<VoiceNote>) => {
    try {
      // Update note logic here
      setNotes(prev => prev.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to update note'
      });
    }
  }, [updateState]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      // Delete note logic here
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete note'
      });
    }
  }, [updateState]);

  const handleAddPhoto = useCallback(async (photo: Omit<PhotoAttachment, 'id'>) => {
    try {
      // Add photo logic here
      updateState({ isPhotoCaptureOpen: false });
    } catch (error) {
      console.error('Error adding photo:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to add photo'
      });
    }
  }, [updateState]);

  const handleUpdatePhoto = useCallback(async (noteId: string, photoId: string, updates: Partial<PhotoAttachment>) => {
    try {
      // Update photo logic here
      setNotes(prev => prev.map(note =>
        note.id === noteId ? {
          ...note,
          photos: note.photos?.map(photo =>
            photo.id === photoId ? { ...photo, ...updates } : photo
          )
        } : note
      ));
    } catch (error) {
      console.error('Error updating photo:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to update photo'
      });
    }
  }, [updateState]);

  const handleDeletePhoto = useCallback(async (noteId: string, photoId: string) => {
    try {
      // Delete photo logic here
      setNotes(prev => prev.map(note =>
        note.id === noteId ? {
          ...note,
          photos: note.photos?.filter(photo => photo.id !== photoId)
        } : note
      ));
    } catch (error) {
      console.error('Error deleting photo:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete photo'
      });
    }
  }, [updateState]);

  const handleOpenPhotoCapture = useCallback(() => {
    updateState({ isPhotoCaptureOpen: true });
  }, [updateState]);

  const handleClosePhotoCapture = useCallback(() => {
    updateState({ isPhotoCaptureOpen: false });
  }, [updateState]);

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Load notes logic here
        // For now, use mock data
        const mockNotes: VoiceNote[] = [
          {
            id: '1',
            content: 'Test note 1',
            createdAt: new Date().toISOString(),
            type: 'observation'
          }
        ];
        setNotes(mockNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
        updateState({
          error: error instanceof Error ? error.message : 'Failed to load notes'
        });
      }
    };

    loadNotes();
  }, [jobNumber, updateState]);

  return {
    state,
    updateState,
    notes,
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    error: state.error,
    isPhotoCaptureOpen: state.isPhotoCaptureOpen,
    handleStartRecording,
    handleStopRecording,
    handleUpdateNote,
    handleDeleteNote,
    handleAddPhoto,
    handleUpdatePhoto,
    handleDeletePhoto,
    handleOpenPhotoCapture,
    handleClosePhotoCapture
  };
};
