'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Tooltip,
  List,
  ListItem,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AuthorityFormTemplate, AuthorityFormType, RiskLevel } from '../../types/authority';
import FormSectionEditor from './FormSectionEditor';

interface FormTemplateManagerProps {
  templates: AuthorityFormTemplate[];
  onChange: (templates: AuthorityFormTemplate[]) => void;
}

const FORM_TYPES: { value: AuthorityFormType; label: string }[] = [
  { value: 'water_damage', label: 'Water Damage' },
  { value: 'mould_remediation', label: 'Mould Remediation' },
  { value: 'fire_damage', label: 'Fire Damage' },
  { value: 'biohazard_cleanup', label: 'Biohazard Cleanup' },
  { value: 'general_authority', label: 'General Authority' },
  { value: 'commence_authority', label: 'Authority to Commence' },
  { value: 'dispose_authority', label: 'Authority to Dispose' },
  { value: 'satisfaction_certificate', label: 'Customer Satisfaction Certificate' }
];

const RISK_LEVELS: { value: RiskLevel; label: string; color: 'success' | 'info' | 'warning' | 'error' }[] = [
  { value: 'LOW', label: 'Low Risk', color: 'success' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'info' },
  { value: 'HIGH', label: 'High Risk', color: 'warning' },
  { value: 'CRITICAL', label: 'Critical Risk', color: 'error' }
];

const getDefaultRiskLevel = (formType: AuthorityFormType): RiskLevel => {
  switch (formType) {
    case 'dispose_authority':
      return 'CRITICAL';
    case 'fire_damage':
    case 'biohazard_cleanup':
      return 'HIGH';
    case 'commence_authority':
    case 'water_damage':
    case 'mould_remediation':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
};

const FormTemplateManager: React.FC<FormTemplateManagerProps> = ({ templates, onChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AuthorityFormTemplate | null>(null);
  const [openSectionEditor, setOpenSectionEditor] = useState(false);
  const [localTemplates, setLocalTemplates] = useState<AuthorityFormTemplate[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel>('LOW');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLocalTemplates(templates);
  }, [templates]);

  const handleFormTypeChange = (event: any) => {
    const formType = event.target.value as AuthorityFormType;
    const riskLevel = getDefaultRiskLevel(formType);
    setSelectedRiskLevel(riskLevel);
    
    // Update the risk level select value
    const form = formRef.current;
    if (form) {
      const riskLevelSelect = form.querySelector('select[name="riskLevel"]') as HTMLSelectElement;
      if (riskLevelSelect) {
        riskLevelSelect.value = riskLevel;
      }
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setSelectedRiskLevel('LOW');
    setOpenDialog(true);
  };

  const handleEditTemplate = (template: AuthorityFormTemplate) => {
    setEditingTemplate(template);
    setSelectedRiskLevel(template.riskLevel);
    setOpenDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const newTemplates = localTemplates.filter(t => t.id !== templateId);
    setLocalTemplates(newTemplates);
    onChange(newTemplates);
  };

  const handleEditSections = (template: AuthorityFormTemplate) => {
    setEditingTemplate(template);
    setOpenSectionEditor(true);
  };

  const handleSectionsChange = (sections: AuthorityFormTemplate['sections']) => {
    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        sections: sections.map((section, index) => ({
          ...section,
          order: index
        })),
        lastUpdated: new Date().toISOString()
      };
      const newTemplates = localTemplates.map(t =>
        t.id === editingTemplate.id ? updatedTemplate : t
      );
      setLocalTemplates(newTemplates);
      onChange(newTemplates);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formType = formData.get('type') as AuthorityFormType;
    
    const templateData: Omit<AuthorityFormTemplate, 'id'> = {
      type: formType,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      sections: editingTemplate?.sections || [],
      version: formData.get('version') as string,
      lastUpdated: new Date().toISOString(),
      isActive: true,
      riskLevel: formData.get('riskLevel') as RiskLevel || getDefaultRiskLevel(formType)
    };

    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        ...templateData,
        sections: editingTemplate.sections
      };
      const newTemplates = localTemplates.map(t =>
        t.id === editingTemplate.id ? updatedTemplate : t
      );
      setLocalTemplates(newTemplates);
      onChange(newTemplates);
    } else {
      const newTemplate = {
        ...templateData,
        id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sections: []
      };
      const newTemplates = [...localTemplates, newTemplate];
      setLocalTemplates(newTemplates);
      onChange(newTemplates);
    }

    setOpenDialog(false);
  };

  const getRiskLevelChip = (riskLevel: RiskLevel) => {
    const riskInfo = RISK_LEVELS.find(r => r.value === riskLevel);
    return (
      <Chip
        size="small"
        label={riskInfo?.label || riskLevel}
        color={riskInfo?.color || 'default'}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTemplate}
        >
          Create Template
        </Button>
      </Box>

      <List>
        {localTemplates.map((template) => (
          <Paper key={template.id} sx={{ mb: 2 }}>
            <ListItem
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit Sections">
                    <IconButton
                      edge="end"
                      onClick={() => handleEditSections(template)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Template">
                    <IconButton
                      edge="end"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTemplate(template.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" component="div">
                    {template.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={FORM_TYPES.find(t => t.value === template.type)?.label}
                    color="primary"
                    variant="outlined"
                  />
                  {getRiskLevelChip(template.riskLevel)}
                  <Chip
                    size="small"
                    label={template.isActive ? 'Active' : 'Inactive'}
                    color={template.isActive ? 'success' : 'default'}
                  />
                </Stack>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    {template.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Version: {template.version} • Last Updated:{' '}
                    {new Date(template.lastUpdated).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>

      {/* Template Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="template-form"
            ref={formRef}
            onSubmit={handleSaveTemplate}
            sx={{ pt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Form Type</InputLabel>
                  <Select
                    name="type"
                    defaultValue={editingTemplate?.type || ''}
                    label="Form Type"
                    required
                    onChange={handleFormTypeChange}
                  >
                    {FORM_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Risk Level</InputLabel>
                  <Select
                    name="riskLevel"
                    value={selectedRiskLevel}
                    label="Risk Level"
                    required
                    onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevel)}
                  >
                    {RISK_LEVELS.map((risk) => (
                      <MenuItem key={risk.value} value={risk.value}>
                        {risk.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="version"
                  label="Version"
                  defaultValue={editingTemplate?.version || '1.0'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  defaultValue={editingTemplate?.title || ''}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  defaultValue={editingTemplate?.description || ''}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      defaultChecked={editingTemplate?.isActive ?? true}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            type="submit"
            form="template-form"
            variant="contained"
          >
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section Editor Dialog */}
      <Dialog
        open={openSectionEditor}
        onClose={() => setOpenSectionEditor(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Edit Sections - {editingTemplate?.title}
        </DialogTitle>
        <DialogContent>
          {editingTemplate && (
            <FormSectionEditor
              sections={editingTemplate.sections}
              onChange={handleSectionsChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSectionEditor(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormTemplateManager;
