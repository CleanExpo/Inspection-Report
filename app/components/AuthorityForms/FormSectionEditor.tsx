'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { AuthorityFormSection } from '../../types/authority';

interface FormSectionEditorProps {
  sections: AuthorityFormSection[];
  onChange: (sections: AuthorityFormSection[]) => void;
}

const FormSectionEditor = ({ sections, onChange }: FormSectionEditorProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<AuthorityFormSection | null>(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const generateSectionId = (title: string) => {
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = `section_${sanitizedTitle}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('Generated section ID:', id);
    return id;
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setEditingSectionIndex(null);
    setOpenDialog(true);
  };

  const handleEditSection = (section: AuthorityFormSection, index: number) => {
    console.log('Editing section:', JSON.stringify({ id: section.id, title: section.title, index }, null, 2));
    setEditingSection(section);
    setEditingSectionIndex(index);
    setOpenDialog(true);
  };

  const handleDeleteSection = (index: number) => {
    console.log('Deleting section at index:', index);
    const newSections = [...sections];
    newSections.splice(index, 1);
    onChange(newSections);
  };

  const handleSaveSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;

    const sectionData: AuthorityFormSection = {
      id: editingSection?.id || generateSectionId(title),
      title,
      description: formData.get('description') as string || undefined,
      fields: editingSection?.fields || [],
      isRequired: formData.get('isRequired') === 'true',
      order: editingSection?.order || sections.length
    };

    console.log('Saving section:', JSON.stringify(sectionData, null, 2));

    const newSections = [...sections];
    if (editingSectionIndex !== null) {
      newSections[editingSectionIndex] = sectionData;
    } else {
      newSections.push(sectionData);
    }

    onChange(newSections);
    setOpenDialog(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    // Create a drag preview
    const dragPreview = document.createElement('div');
    dragPreview.style.position = 'absolute';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.opacity = '0';
    document.body.appendChild(dragPreview);

    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);

    // Update order property
    newSections.forEach((section, index) => {
      section.order = index;
    });

    console.log('Reordered sections:', JSON.stringify(
      newSections.map(s => ({ id: s.id, title: s.title })),
      null,
      2
    ));
    onChange(newSections);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  console.log('Rendering FormSectionEditor with sections:', JSON.stringify(
    sections.map(s => ({ id: s.id, title: s.title })),
    null,
    2
  ));

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Form Sections</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSection}
        >
          Add Section
        </Button>
      </Box>

      <Box sx={{ minHeight: 100 }}>
        {sections.map((section, index) => (
          <Paper
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            sx={{
              mb: 2,
              cursor: 'grab',
              transition: 'all 0.2s ease',
              transform: draggedIndex === index ? 'scale(1.02)' : 'scale(1)',
              opacity: draggedIndex === index ? 0.5 : 1,
              backgroundColor: dropTargetIndex === index 
                ? (theme) => alpha(theme.palette.primary.main, 0.1)
                : 'background.paper',
              borderTop: dropTargetIndex === index ? 2 : 0,
              borderTopColor: 'primary.main',
              borderTopStyle: 'dashed',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.1)
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'action.active',
                    cursor: 'grab'
                  }}
                >
                  <DragIndicatorIcon />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" component="div">
                      {section.title}
                    </Typography>
                    {section.isRequired && (
                      <Chip
                        size="small"
                        label="Required"
                        color="primary"
                      />
                    )}
                  </Stack>
                  {section.description && (
                    <Typography variant="body2" color="text.secondary" component="div">
                      {section.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" component="div">
                    {section.fields.length} fields
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit Section">
                    <IconButton
                      size="small"
                      onClick={() => handleEditSection(section, index)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Section">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSection(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More Options">
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSection ? 'Edit Section' : 'Add Section'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="section-form"
            onSubmit={handleSaveSection}
            sx={{ pt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Section Title"
                  defaultValue={editingSection?.title || ''}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  defaultValue={editingSection?.description || ''}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isRequired"
                      defaultChecked={editingSection?.isRequired ?? false}
                    />
                  }
                  label="Required Section"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            type="submit"
            form="section-form"
            variant="contained"
          >
            {editingSection ? 'Save Changes' : 'Add Section'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormSectionEditor;
