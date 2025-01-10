'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Button,
  useTheme
} from '@mui/material';
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Mic as MicIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  VolumeUp as SpeakIcon
} from '@mui/icons-material';
import { VOICE_COMMANDS, QUICK_COMMANDS } from '../config/voiceCommands';

interface VoiceCommandHelpProps {
  onExecuteExample?: (command: string) => void;
}

const VoiceCommandHelp: React.FC<VoiceCommandHelpProps> = ({
  onExecuteExample
}) => {
  const [open, setOpen] = useState(false);
  const [expandedCommand, setExpandedCommand] = useState<string | false>(false);
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedCommand(isExpanded ? panel : false);
  };

  const speakExample = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-AU';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Tooltip title="Voice Command Help">
        <IconButton onClick={handleOpen} color="primary">
          <HelpIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '60vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MicIcon color="primary" />
              Voice Commands
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use these voice commands to quickly add notes, record measurements, and more.
            Click the play button to try an example, or the speaker to hear it spoken.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Commands
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {QUICK_COMMANDS.map((cmd) => (
                <Chip
                  key={cmd.phrase}
                  label={cmd.phrase}
                  color="primary"
                  variant="outlined"
                  onClick={() => onExecuteExample?.(cmd.template)}
                />
              ))}
            </Box>
          </Box>

          {VOICE_COMMANDS.map((command) => (
            <Accordion
              key={command.name}
              expanded={expandedCommand === command.name}
              onChange={handleAccordionChange(command.name)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="subtitle1">{command.name}</Typography>
                  <Chip
                    label={command.triggers[0]}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {command.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Trigger Phrases:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {command.triggers.map((trigger) => (
                    <Chip
                      key={trigger}
                      label={trigger}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                {command.parameters && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Parameters:
                    </Typography>
                    <List dense>
                      {command.parameters.map((param) => (
                        <ListItem key={param.name}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                  {param.name}
                                </Typography>
                                <Chip
                                  label={param.required ? 'Required' : 'Optional'}
                                  size="small"
                                  color={param.required ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={param.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                <Typography variant="subtitle2" gutterBottom>
                  Examples:
                </Typography>
                <List dense>
                  {command.examples.map((example, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box>
                          <Tooltip title="Try this example">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => onExecuteExample?.(example)}
                            >
                              <PlayIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hear this example">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => speakExample(example)}
                            >
                              <SpeakIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            "{example}"
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceCommandHelp;
