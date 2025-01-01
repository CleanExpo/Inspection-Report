"use client";

import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

export interface VoiceNotesToolbarProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenPhotoCapture: () => void;
  className?: string;
}

const VoiceNotesToolbar: React.FC<VoiceNotesToolbarProps> = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onOpenPhotoCapture,
  className = ""
}) => {
  return (
    <Box className={`flex items-center space-x-2 ${className}`}>
      {isRecording ? (
        <Tooltip title="Stop Recording">
          <IconButton
            onClick={onStopRecording}
            color="error"
            disabled={isProcessing}
          >
            <StopIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Start Recording">
          <IconButton
            onClick={onStartRecording}
            color="primary"
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : <MicIcon />}
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Take Photo">
        <IconButton
          onClick={onOpenPhotoCapture}
          disabled={isRecording || isProcessing}
        >
          <CameraIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default VoiceNotesToolbar;
