"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface VoiceMacro {
  id: string;
  name: string;
  commands: VoiceCommand[];
  createdAt: string;
}

interface VoiceCommand {
  type: string;
  parameters: Record<string, string>;
}

interface VoiceMacrosProps {
  macros?: VoiceMacro[];
  onExecute?: (macro: VoiceMacro) => Promise<void>;
  onDelete?: (macroId: string) => Promise<void>;
  className?: string;
}

const VoiceMacros: React.FC<VoiceMacrosProps> = ({
  macros = [],
  onExecute,
  onDelete,
  className = ""
}) => {
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async (macro: VoiceMacro) => {
    try {
      setActiveMacro(macro.id);
      setError(null);
      await onExecute?.(macro);
    } catch (error) {
      console.error('Error executing macro:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute macro');
    } finally {
      setActiveMacro(null);
    }
  };

  const handleDelete = async (macroId: string) => {
    try {
      setError(null);
      await onDelete?.(macroId);
    } catch (error) {
      console.error('Error deleting macro:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete macro');
    }
  };

  const formatCommand = (command: VoiceCommand): string => {
    const params = Object.entries(command.parameters)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `${command.type}${params ? ` (${params})` : ''}`;
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Voice Macros
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {macros.length === 0 ? (
        <Typography color="textSecondary" className="text-center py-4">
          No macros available
        </Typography>
      ) : (
        <List>
          {macros.map((macro) => (
            <ListItem
              key={macro.id}
              secondaryAction={
                <Box className="flex space-x-2">
                  <IconButton
                    edge="end"
                    onClick={() => handleExecute(macro)}
                    disabled={!!activeMacro}
                  >
                    {activeMacro === macro.id ? (
                      <CircularProgress size={24} />
                    ) : (
                      <PlayIcon />
                    )}
                  </IconButton>
                  {onDelete && (
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(macro.id)}
                      disabled={!!activeMacro}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemText
                primary={macro.name}
                secondary={
                  <Box component="span" className="block space-y-1">
                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(macro.createdAt).toLocaleString()}
                    </Typography>
                    <List dense>
                      {macro.commands.map((command, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={formatCommand(command)}
                            className="text-sm"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default VoiceMacros;
