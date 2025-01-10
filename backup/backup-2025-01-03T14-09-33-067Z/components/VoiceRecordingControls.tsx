'use client';
import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  TextFields as TranscriptIcon
} from '@mui/icons-material';

interface VoiceRecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  showTranscript: boolean;
  liveTranscript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleTranscript: () => void;
  onVoiceCommand?: (command: string) => void;
}

const VoiceRecordingControls: React.FC<VoiceRecordingControlsProps> = ({
  isRecording,
  isProcessing,
  duration,
  showTranscript,
  liveTranscript,
  onStartRecording,
  onStopRecording,
  onToggleTranscript,
  onVoiceCommand
}) => {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isRecording && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon color="action" />
            <Typography variant="body2" component="div" color="text.secondary">
              {formatDuration(duration)}
            </Typography>
          </Box>
        )}
        {isProcessing ? (
          <IconButton
            color={isRecording ? 'error' : 'primary'}
            disabled
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        ) : (
          <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
            <IconButton
              color={isRecording ? 'error' : 'primary'}
              onClick={isRecording ? onStopRecording : onStartRecording}
              aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
        )}
        {(!isRecording && !liveTranscript) ? (
          <IconButton
            color={showTranscript ? 'primary' : 'default'}
            disabled
            aria-label="Toggle Live Transcript"
          >
            <TranscriptIcon />
          </IconButton>
        ) : (
          <Tooltip title="Toggle Live Transcript">
            <IconButton
              color={showTranscript ? 'primary' : 'default'}
              onClick={onToggleTranscript}
              aria-label="Toggle Live Transcript"
            >
              <TranscriptIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {isRecording && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={(duration / 60000) * 100}
            color="primary"
          />
        </Box>
      )}
    </>
  );
};

export default VoiceRecordingControls;
