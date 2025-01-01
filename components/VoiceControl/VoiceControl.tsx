import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useVoiceCommands, VoiceCommand, VoiceReadingInput } from '@/utils/voiceCommands';
import styles from '@/styles/MoistureMapping.module.css';

interface VoiceControlProps {
  onAddReading: (reading: VoiceReadingInput) => void;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onAddEquipment: () => void;
  onMeasure: () => void;
  onUndo: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSwitchTool: (tool: string) => void;
  onSetMaterial: (material: string) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  onAddReading,
  onStartDrawing,
  onStopDrawing,
  onAddEquipment,
  onMeasure,
  onUndo,
  onSave,
  onCancel,
  onSwitchTool,
  onSetMaterial,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const {
    startListening,
    stopListening,
    registerCommand,
    setReadingInputHandler,
    getAvailableCommands,
  } = useVoiceCommands();

  // Register command handlers
  useEffect(() => {
    const commands: [VoiceCommand, () => void, string][] = [
      ['START_DRAWING', onStartDrawing, 'Starting drawing mode'],
      ['STOP_DRAWING', onStopDrawing, 'Stopping drawing mode'],
      ['ADD_EQUIPMENT', onAddEquipment, 'Adding equipment'],
      ['MEASURE', onMeasure, 'Starting measurement'],
      ['UNDO', onUndo, 'Undoing last action'],
      ['SAVE', onSave, 'Saving changes'],
      ['CANCEL', onCancel, 'Canceling action'],
    ];

    commands.forEach(([command, handler, feedback]) => {
      registerCommand(command, () => {
        setLastCommand(command);
        handler();
      }, feedback);
    });

    // Register reading input handler
    setReadingInputHandler((reading) => {
      setLastCommand('ADD_READING');
      onAddReading(reading);
    });
  }, [
    registerCommand,
    setReadingInputHandler,
    onAddReading,
    onStartDrawing,
    onStopDrawing,
    onAddEquipment,
    onMeasure,
    onUndo,
    onSave,
    onCancel,
  ]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  return (
    <Box className={styles.voiceControl}>
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title={isListening ? 'Stop voice control' : 'Start voice control'}>
          <IconButton
            onClick={toggleListening}
            color={isListening ? 'primary' : 'default'}
            className={styles.voiceButton}
          >
            <Badge
              variant="dot"
              color="error"
              invisible={!isListening}
            >
              {isListening ? <MicIcon /> : <MicOffIcon />}
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Show voice commands">
          <IconButton
            onClick={() => setShowHelp(!showHelp)}
            className={styles.helpButton}
          >
            <HelpIcon />
          </IconButton>
        </Tooltip>
        {lastCommand && (
          <Typography
            variant="caption"
            color="textSecondary"
            className={styles.lastCommand}
          >
            Last command: {lastCommand}
          </Typography>
        )}
      </Box>

      <Collapse in={showHelp}>
        <Paper className={styles.helpPanel}>
          <Typography variant="subtitle2" gutterBottom>
            Available Voice Commands:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Start/Stop Drawing"
                secondary='Say "start drawing" or "stop drawing"'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Add Reading"
                secondary='Say "add reading of [value]" or "add reading"'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Add Equipment"
                secondary='Say "add equipment", "add dehumidifier", etc.'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Measurements"
                secondary='Say "measure" or "start measurement"'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Undo/Save/Cancel"
                secondary='Say "undo", "save", or "cancel"'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Switch Tools"
                secondary='Say "switch to [tool name]"'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Set Material"
                secondary='Say "set material to [material type]"'
              />
            </ListItem>
          </List>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default VoiceControl;
