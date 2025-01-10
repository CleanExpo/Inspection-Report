"use client";

import React from 'react';
import { Paper } from '@mui/material';
import { VoiceNote } from '../types/voice';
import type { PhotoAttachment } from '../types/photo';
import { useVoiceNotesLogic } from '../hooks/useVoiceNotesLogic';
import VoiceNotesToolbar from './VoiceNotesToolbar';
import VoiceTranscriptDisplay from './VoiceTranscriptDisplay';
import NoteList from './NoteList';
import PhotoCapture from './PhotoCapture';

interface VoiceNotesProps {
  jobNumber: string;
  className?: string;
}

const VoiceNotes: React.FC<VoiceNotesProps> = ({
  jobNumber,
  className = ""
}) => {
  const {
    notes,
    isRecording,
    isProcessing,
    error,
    isPhotoCaptureOpen,
    handleStartRecording,
    handleStopRecording,
    handleUpdateNote,
    handleDeleteNote,
    handleAddPhoto,
    handleUpdatePhoto,
    handleDeletePhoto,
    handleOpenPhotoCapture,
    handleClosePhotoCapture
  } = useVoiceNotesLogic({ jobNumber });

  return (
    <Paper className={`p-6 ${className}`}>
      <VoiceNotesToolbar
        isRecording={isRecording}
        isProcessing={isProcessing}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onOpenPhotoCapture={handleOpenPhotoCapture}
        className="mb-4"
      />

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      <VoiceTranscriptDisplay
        isRecording={isRecording}
        isProcessing={isProcessing}
        className="mt-6"
      />

      <NoteList
        notes={notes}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onUpdatePhoto={handleUpdatePhoto}
        onDeletePhoto={handleDeletePhoto}
        className="mt-6"
      />

      {isPhotoCaptureOpen && (
        <PhotoCapture
          onCapture={handleAddPhoto}
          onClose={handleClosePhotoCapture}
        />
      )}
    </Paper>
  );
};

export default VoiceNotes;
