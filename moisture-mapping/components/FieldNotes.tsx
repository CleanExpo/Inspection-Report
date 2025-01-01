import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Assignment as TaskIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

// Define SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'checklist';
  category: string;
  status: 'pending' | 'completed' | 'flagged';
  mediaIds?: string[];
  checklistItems?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  required: boolean;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  category: string;
  items: {
    text: string;
    required: boolean;
  }[];
}

const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'initial-inspection',
    name: 'Initial Moisture Inspection',
    category: 'Inspection',
    items: [
      { text: 'Check for visible water damage', required: true },
      { text: 'Take moisture readings at affected areas', required: true },
      { text: 'Photograph damaged areas', required: true },
      { text: 'Check for musty odors', required: true },
      { text: 'Inspect adjacent rooms', required: true },
      { text: 'Check humidity levels', required: true },
      { text: 'Document source of water if visible', required: true },
      { text: 'Note any pre-existing damage', required: false },
      { text: 'Check for proper ventilation', required: false }
    ]
  },
  {
    id: 'equipment-setup',
    name: 'Equipment Setup',
    category: 'Setup',
    items: [
      { text: 'Position air movers for optimal airflow', required: true },
      { text: 'Set up dehumidifiers', required: true },
      { text: 'Check power requirements', required: true },
      { text: 'Verify equipment operation', required: true },
      { text: 'Document equipment placement', required: true },
      { text: 'Set up containment if needed', required: false }
    ]
  },
  {
    id: 'daily-monitoring',
    name: 'Daily Monitoring',
    category: 'Monitoring',
    items: [
      { text: 'Record moisture readings', required: true },
      { text: 'Check equipment operation', required: true },
      { text: 'Document drying progress', required: true },
      { text: 'Adjust equipment as needed', required: true },
      { text: 'Check humidity levels', required: true },
      { text: 'Note any concerns', required: false }
    ]
  }
];

interface FieldNotesProps {
  onSaveNote: (note: Note) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onMediaRequest?: () => void;
}

export default function FieldNotes({
  onSaveNote,
  onUpdateNote,
  onDeleteNote,
  onMediaRequest
}: FieldNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [templateMenu, setTemplateMenu] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window.SpeechRecognition || window.webkitSpeechRecognition) as new () => SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => (result[0] as SpeechRecognitionAlternative).transcript)
          .join('');
        setRecordingText(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error. Please try again.');
        stopRecording();
      };
    }
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingText('');
      setError(null);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (recordingText.trim()) {
        const newNote: Note = {
          id: `note-${Date.now()}`,
          content: recordingText,
          timestamp: new Date().toISOString(),
          type: 'voice',
          category: 'Field Note',
          status: 'pending'
        };
        setNotes(prev => [...prev, newNote]);
        onSaveNote(newNote);
      }
    }
  };

  const createChecklist = (template: ChecklistTemplate) => {
    const newNote: Note = {
      id: `checklist-${Date.now()}`,
      content: template.name,
      timestamp: new Date().toISOString(),
      type: 'checklist',
      category: template.category,
      status: 'pending',
      checklistItems: template.items.map(item => ({
        id: `item-${Date.now()}-${Math.random()}`,
        text: item.text,
        completed: false,
        required: item.required
      }))
    };
    setNotes(prev => [...prev, newNote]);
    onSaveNote(newNote);
    setTemplateMenu(null);
  };

  const handleChecklistItemToggle = (noteId: string, itemId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId && note.checklistItems) {
        const updatedItems = note.checklistItems.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const allRequiredCompleted = updatedItems.every(item => 
          !item.required || item.completed
        );
        const updatedNote: Note = {
          ...note,
          checklistItems: updatedItems,
          status: allRequiredCompleted ? 'completed' : 'pending'
        };
        onUpdateNote(updatedNote);
        return updatedNote;
      }
      return note;
    }));
  };

  const handleNoteStatusChange = (note: Note, status: 'pending' | 'completed' | 'flagged') => {
    const updatedNote: Note = { ...note, status };
    setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
    onUpdateNote(updatedNote);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    onDeleteNote(id);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Field Notes & Checklists
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Tooltip title={isRecording ? "Stop Recording" : "Start Voice Note"}>
          <IconButton
            color={isRecording ? "error" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Checklist">
          <IconButton onClick={(e) => setTemplateMenu(e.currentTarget)}>
            <TaskIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Media">
          <IconButton onClick={onMediaRequest}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {isRecording && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Recording... {recordingText}
        </Alert>
      )}

      <List>
        {notes.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              bgcolor: note.status === 'completed' ? 'action.selected' : 'background.paper',
              borderLeft: 4,
              borderColor: note.status === 'flagged' ? 'warning.main' : 'transparent'
            }}
          >
            <ListItemIcon>
              {note.type === 'voice' && <MicIcon />}
              {note.type === 'checklist' && <TaskIcon />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body1">
                    {note.content}
                  </Typography>
                  <Chip
                    size="small"
                    label={note.category}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              }
              secondary={
                <>
                  <Typography variant="caption" display="block">
                    {new Date(note.timestamp).toLocaleString()}
                  </Typography>
                  {note.checklistItems && (
                    <List dense>
                      {note.checklistItems.map(item => (
                        <ListItem key={item.id} dense>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={item.completed}
                              onChange={() => handleChecklistItemToggle(note.id, item.id)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            secondary={item.required ? 'Required' : 'Optional'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              }
            />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Mark Complete">
                <IconButton
                  size="small"
                  onClick={() => handleNoteStatusChange(note, 'completed')}
                  color={note.status === 'completed' ? 'success' : 'default'}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Flag for Review">
                <IconButton
                  size="small"
                  onClick={() => handleNoteStatusChange(note, 'flagged')}
                  color={note.status === 'flagged' ? 'warning' : 'default'}
                >
                  <WarningIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={templateMenu}
        open={Boolean(templateMenu)}
        onClose={() => setTemplateMenu(null)}
      >
        {CHECKLIST_TEMPLATES.map(template => (
          <MenuItem
            key={template.id}
            onClick={() => createChecklist(template)}
          >
            <ListItemIcon>
              <TaskIcon />
            </ListItemIcon>
            <ListItemText
              primary={template.name}
              secondary={template.category}
            />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

// Add type definitions for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
