'use client';

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  TextField,
  Button,
  Tooltip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { RequestHistory as RequestHistoryType } from '../../types/api-playground';

interface RequestHistoryProps {
  history: RequestHistoryType[];
  onSelectRequest: (request: RequestHistoryType) => void;
  onClearHistory: () => void;
  onRemoveFromHistory: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
}

export default function RequestHistory({
  history,
  onSelectRequest,
  onClearHistory,
  onRemoveFromHistory,
  onUpdateName,
}: RequestHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (item: RequestHistoryType) => {
    setEditingId(item.id);
    setEditName(item.name || '');
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onUpdateName(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getRequestLabel = (item: RequestHistoryType) => {
    const { request, response } = item;
    const status = response ? `${response.status} ${response.statusText}` : 'No Response';
    return `${request.method} ${request.url} (${status})`;
  };

  if (history.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        p: 2
      }}>
        <Typography color="text.secondary">
          No request history
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size="small"
          startIcon={<ClearAllIcon />}
          onClick={onClearHistory}
          color="error"
        >
          Clear History
        </Button>
      </Box>

      <Paper variant="outlined">
        <List dense disablePadding>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Box>
                    {editingId === item.id ? (
                      <IconButton
                        edge="end"
                        onClick={handleSaveEdit}
                        size="small"
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        edge="end"
                        onClick={() => handleStartEdit(item)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => onRemoveFromHistory(item.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                onClick={() => onSelectRequest(item)}
              >
                <ListItemText
                  primary={
                    editingId === item.id ? (
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          }
                        }}
                        placeholder="Enter request name"
                        autoFocus
                        fullWidth
                      />
                    ) : (
                      item.name || getRequestLabel(item)
                    )
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(item.timestamp)}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
