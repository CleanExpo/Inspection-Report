'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
  Mic as MicIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  PictureAsPdf as ExportIcon,
  Search as SearchIcon,
  Undo as UndoIcon,
  Redo as RedoIcon
} from '@mui/icons-material';

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: {
    key: string;
    description: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  }[];
}

interface KeyboardShortcutsGuideProps {
  open: boolean;
  onClose: () => void;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Recording',
    icon: <MicIcon />,
    shortcuts: [
      { key: 'R', description: 'Start recording', ctrl: true },
      { key: 'S', description: 'Stop recording', ctrl: true },
      { key: 'T', description: 'Toggle transcript', ctrl: true }
    ]
  },
  {
    title: 'Navigation',
    icon: <SearchIcon />,
    shortcuts: [
      { key: 'F', description: 'Focus search', ctrl: true },
      { key: '/', description: 'Show keyboard shortcuts' },
      { key: 'ESC', description: 'Clear selection' }
    ]
  },
  {
    title: 'Editing',
    icon: <EditIcon />,
    shortcuts: [
      { key: 'Z', description: 'Undo', ctrl: true },
      { key: 'Y', description: 'Redo', ctrl: true },
      { key: 'A', description: 'Select all notes', ctrl: true },
      { key: 'Delete', description: 'Delete selected notes' }
    ]
  },
  {
    title: 'Actions',
    icon: <ShareIcon />,
    shortcuts: [
      { key: 'E', description: 'Export selected notes', ctrl: true },
      { key: 'S', description: 'Share selected notes', ctrl: true, shift: true }
    ]
  }
];

const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({
  open,
  onClose
}) => {
  const formatShortcut = (shortcut: ShortcutGroup['shortcuts'][0]): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon />
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {shortcutGroups.map((group, index) => (
            <Grid item xs={12} sm={6} key={group.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {group.icon}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {group.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.shortcuts.map((shortcut, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 0.5
                      }}
                    >
                      <Typography variant="body2">
                        {shortcut.description}
                      </Typography>
                      <Chip
                        label={formatShortcut(shortcut)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Tip: Press '/' at any time to show this shortcuts guide. Keyboard shortcuts are disabled when typing in text fields or editing notes.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsGuide;
