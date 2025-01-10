"use client";

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Note as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Photo as PhotoIcon
} from '@mui/icons-material';
import PhotoDisplay from './PhotoDisplay';
import type { InspectionNote } from '../types/inspection';
import type { PhotoAttachment } from '../types/photo';

interface NoteListProps {
  notes: InspectionNote[];
  onUpdateNote?: (noteId: string, updates: Partial<InspectionNote>) => void;
  onDeleteNote?: (noteId: string) => void;
  onUpdatePhoto?: (noteId: string, photoId: string, updates: Partial<PhotoAttachment>) => void;
  onDeletePhoto?: (noteId: string, photoId: string) => void;
  className?: string;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onUpdateNote,
  onDeleteNote,
  onUpdatePhoto,
  onDeletePhoto,
  className = ""
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'observation':
        return <NoteIcon color="primary" />;
      case 'recommendation':
        return <NoteIcon color="secondary" />;
      case 'action':
        return <NoteIcon color="action" />;
      default:
        return <NoteIcon />;
    }
  };

  return (
    <Paper className={`p-4 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Inspection Notes
      </Typography>

      {notes.length === 0 ? (
        <Typography color="textSecondary" className="text-center py-4">
          No notes available
        </Typography>
      ) : (
        <List>
          {notes.map((note) => (
            <ListItem
              key={note.id}
              alignItems="flex-start"
              className="border-b last:border-b-0"
            >
              <ListItemIcon>
                {getTypeIcon(note.type)}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box className="flex justify-between items-start">
                    <Typography variant="subtitle1">
                      {note.author || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(note.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      component="div"
                      variant="body2"
                      color="textPrimary"
                      className="whitespace-pre-line mb-2"
                    >
                      {note.content}
                    </Typography>

                    {note.type && (
                      <Typography
                        variant="caption"
                        className="inline-block px-2 py-0.5 rounded-full bg-gray-100"
                      >
                        {note.type}
                      </Typography>
                    )}

                    {/* Photos Grid */}
                    {note.photos && note.photos.length > 0 && (
                      <Box className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {note.photos.map((photo) => (
                          <PhotoDisplay
                            key={photo.id}
                            photo={photo}
                            options={{
                              showCaption: true,
                              showMetadata: false,
                              allowDelete: !!onDeletePhoto,
                              maxHeight: 200
                            }}
                            onDelete={
                              onDeletePhoto
                                ? () => onDeletePhoto(note.id, photo.id)
                                : undefined
                            }
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />

              {/* Note Actions */}
              {(onUpdateNote || onDeleteNote) && (
                <Box className="flex space-x-2">
                  {onUpdateNote && (
                    <Tooltip title="Edit Note">
                      <IconButton
                        size="small"
                        onClick={() => onUpdateNote(note.id, {})}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {onDeleteNote && (
                    <Tooltip title="Delete Note">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteNote(note.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NoteList;
