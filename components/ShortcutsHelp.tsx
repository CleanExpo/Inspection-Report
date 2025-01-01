'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { ShortcutAction } from '../hooks/useKeyboardShortcuts';

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutAction[];
}

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  shortcutGroups: ShortcutGroup[];
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  open,
  onClose,
  shortcutGroups
}) => {
  const formatShortcut = (shortcut: ShortcutAction): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
        {shortcutGroups.map((group, groupIndex) => (
          <React.Fragment key={group.title}>
            {groupIndex > 0 && <Divider sx={{ my: 2 }} />}
            <Typography variant="subtitle1" gutterBottom>
              {group.title}
            </Typography>
            <List dense>
              {group.shortcuts.map((shortcut, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={shortcut.description}
                    secondary={
                      <Chip
                        label={formatShortcut(shortcut)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: 'monospace',
                          mt: 0.5
                        }}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </React.Fragment>
        ))}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Note: Keyboard shortcuts are disabled when typing in text fields or editing notes.
            Press '/' at any time to show this help dialog.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsHelp;
