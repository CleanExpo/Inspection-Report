"use client";

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useVoiceCommand } from '../contexts/VoiceCommandContext';

interface VoiceCommandStatusProps {
  className?: string;
}

const VoiceCommandStatus: React.FC<VoiceCommandStatusProps> = ({
  className = ""
}) => {
  const {
    state: { isListening, lastCommand, commandHistory, error },
    startListening,
    stopListening,
    clearHistory
  } = useVoiceCommand();

  return (
    <Paper className={`p-4 ${className}`}>
      <Box className="flex items-center justify-between">
        <Typography variant="subtitle1">
          Voice Commands
        </Typography>

        <Box className="flex space-x-2">
          {isListening ? (
            <Tooltip title="Stop Listening">
              <IconButton
                onClick={stopListening}
                color="error"
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Start Listening">
              <IconButton
                onClick={startListening}
                color="primary"
              >
                {isListening ? <CircularProgress size={24} /> : <MicIcon />}
              </IconButton>
            </Tooltip>
          )}

          {commandHistory.length > 0 && (
            <Tooltip title="Clear History">
              <IconButton
                onClick={clearHistory}
                disabled={isListening}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" className="mt-4">
          {error}
        </Alert>
      )}

      <Box className="mt-4">
        <Typography variant="caption" color="textSecondary">
          {isListening ? 'Listening for commands...' : 'Click the microphone to start'}
        </Typography>

        {lastCommand && (
          <Typography variant="body2" className="mt-2">
            Last command: {lastCommand.type}
            {Object.entries(lastCommand.parameters).length > 0 && (
              <span className="text-gray-500">
                {' '}({
                  Object.entries(lastCommand.parameters)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                })
              </span>
            )}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default VoiceCommandStatus;
