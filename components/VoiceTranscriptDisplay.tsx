"use client";

import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';

export interface VoiceTranscriptDisplayProps {
  isRecording: boolean;
  isProcessing: boolean;
  transcript?: string;
  confidence?: number;
  className?: string;
}

const VoiceTranscriptDisplay: React.FC<VoiceTranscriptDisplayProps> = ({
  isRecording,
  isProcessing,
  transcript,
  confidence,
  className = ""
}) => {
  return (
    <Paper className={`p-4 ${className}`}>
      <Typography variant="subtitle2" gutterBottom>
        Transcript
      </Typography>

      <Box className="min-h-[100px] relative">
        {isRecording && (
          <Box className="flex items-center space-x-2 text-red-500">
            <span className="animate-pulse">●</span>
            <Typography>Recording...</Typography>
          </Box>
        )}

        {isProcessing && (
          <Box className="flex items-center space-x-2">
            <CircularProgress size={20} />
            <Typography>Processing audio...</Typography>
          </Box>
        )}

        {!isRecording && !isProcessing && transcript && (
          <Box>
            <Typography>{transcript}</Typography>
            {confidence !== undefined && (
              <Typography variant="caption" color="textSecondary">
                Confidence: {Math.round(confidence * 100)}%
              </Typography>
            )}
          </Box>
        )}

        {!isRecording && !isProcessing && !transcript && (
          <Typography color="textSecondary">
            No transcript available
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default VoiceTranscriptDisplay;
