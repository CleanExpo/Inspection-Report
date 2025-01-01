'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DroppableStateSnapshot,
  DraggableStateSnapshot
} from 'react-beautiful-dnd';
import type { AuthorityFormField, AuthorityFormFieldType } from '../../types/authority';

interface FormFieldEditorProps {
  fields: AuthorityFormField[];
  onChange: (fields: AuthorityFormField[]) => void;
}

const FIELD_TYPES: { value: AuthorityFormFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'select', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
  { value: 'signature', label: 'Signature' },
  { value: 'photo', label: 'Photo Upload' },
  { value: 'table', label: 'Table' }
];

export default function FormFieldEditor({ fields, onChange }: FormFieldEditorProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState<AuthorityFormField | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setEditingFieldIndex(null);
    setOpenDialog(true);
  };

  const handleEditField = (field: AuthorityFormField, index: number) => {
    setEditingField(field);
    setEditingFieldIndex(index);
    setOpenDialog(true);
  };

  const handleDeleteField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onChange(newFields);
  };

  const handleSaveField = (formData: FormData) => {
    const fieldData: AuthorityFormField = {
      id: editingField?.id || `field_${Date.now()}`,
      type: formData.get('type') as AuthorityFormFieldType,
      label: formData.get('label') as string,
      placeholder: formData.get('placeholder') as string || undefined,
      helpText: formData.get('helpText') as string || undefined,
      isRequired: formData.get('isRequired') === 'true',
      order: editingField?.order || fields.length,
      options: formData.get('type') === 'select' || formData.get('type') === 'radio'
        ? (formData.get('options') as string).split('\n').filter(Boolean)
        : undefined,
      validation: {
        pattern: formData.get('pattern') as string || undefined,
        minLength: Number(formData.get('minLength')) || undefined,
        maxLength: Number(formData.get('maxLength')) || undefined,
        min: Number(formData.get('min')) || undefined,
        max: Number(formData.get('max')) || undefined
      }
    };

    const newFields = [...fields];
    if (editingFieldIndex !== null) {
      newFields[editingFieldIndex] = fieldData;
    } else {
      newFields.push(fieldData);
    }

    onChange(newFields);
    setOpenDialog(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newFields = [...fields];
    const [reorderedField] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, reorderedField);

    // Update order property
    newFields.forEach((field, index) => {
      field.order = index;
    });

    onChange(newFields);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Form Fields</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddField}
        >
          Add Field
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                >
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ mb: 2 }}
                    >
                      <ListItem
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                edge="end"
                                onClick={() => handleEditField(field, index)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteField(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            <IconButton {...provided.dragHandleProps}>
                              <DragIndicatorIcon />
                            </IconButton>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {field.label}
                              </Typography>
                              <Chip
                                size="small"
                                label={FIELD_TYPES.find(t => t.value === field.type)?.label}
                                color="primary"
                                variant="outlined"
                              />
                              {field.isRequired && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1
                                  }}
                                >
                                  Required
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {field.helpText && (
                                <Typography variant="body2" color="text.secondary">
                                  {field.helpText}
                                </Typography>
                              )}
                              {field.options && (
                                <Typography variant="caption" color="text.secondary">
                                  Options: {field.options.join(', ')}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingField ? 'Edit Field' : 'Add Field'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="field-form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleSaveField(new FormData(e.target as HTMLFormElement));
            }}
            sx={{ pt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    name="type"
                    defaultValue={editingField?.type || ''}
                    label="Field Type"
                    required
                  >
                    {FIELD_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="label"
                  label="Field Label"
                  defaultValue={editingField?.label || ''}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="placeholder"
                  label="Placeholder Text"
                  defaultValue={editingField?.placeholder || ''}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="helpText"
                  label="Help Text"
                  defaultValue={editingField?.helpText || ''}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              {(editingField?.type === 'select' || editingField?.type === 'radio') && (
                <Grid item xs={12}>
                  <TextField
                    name="options"
                    label="Options (one per line)"
                    defaultValue={editingField?.options?.join('\n') || ''}
                    fullWidth
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isRequired"
                      defaultChecked={editingField?.isRequired ?? false}
                    />
                  }
                  label="Required Field"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Validation Rules
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="pattern"
                      label="Validation Pattern (Regex)"
                      defaultValue={editingField?.validation?.pattern || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="minLength"
                      label="Minimum Length"
                      type="number"
                      defaultValue={editingField?.validation?.minLength || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="maxLength"
                      label="Maximum Length"
                      type="number"
                      defaultValue={editingField?.validation?.maxLength || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="min"
                      label="Minimum Value"
                      type="number"
                      defaultValue={editingField?.validation?.min || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="max"
                      label="Maximum Value"
                      type="number"
                      defaultValue={editingField?.validation?.max || ''}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            type="submit"
            form="field-form"
            variant="contained"
          >
            {editingField ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
