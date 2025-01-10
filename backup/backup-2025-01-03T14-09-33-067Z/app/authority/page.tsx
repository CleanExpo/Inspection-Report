'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import FormTemplateManager from '../components/AuthorityForms/FormTemplateManager';
import { authorityService } from '../services/authorityService';
import { defaultTemplates } from '../utils/defaultTemplates';
import type { AuthorityFormTemplate } from '../types/authority';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`authority-tabpanel-${index}`}
      aria-labelledby={`authority-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AuthorityPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<AuthorityFormTemplate[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Clear localStorage to ensure we start fresh
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authority_templates');
      }

      const data = await authorityService.getTemplates();
      
      // If no templates exist, create the default templates
      if (data.length === 0) {
        console.log('Creating default templates:', defaultTemplates);
        const createdTemplates = await Promise.all(
          defaultTemplates.map(template => authorityService.createTemplate(template))
        );
        
        setTemplates(createdTemplates);
        setSnackbar({
          open: true,
          message: 'Default authority templates created',
          severity: 'success'
        });
      } else {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load form templates',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplatesChange = async (updatedTemplates: AuthorityFormTemplate[]) => {
    try {
      // Find the template that was added or modified
      const changedTemplate = updatedTemplates.find(newTemplate => {
        const oldTemplate = templates.find(t => t.id === newTemplate.id);
        return !oldTemplate || JSON.stringify(oldTemplate) !== JSON.stringify(newTemplate);
      });

      if (changedTemplate) {
        // If it's a new template (not found in current templates)
        if (!templates.find(t => t.id === changedTemplate.id)) {
          await authorityService.createTemplate(changedTemplate);
          setSnackbar({
            open: true,
            message: 'Template created successfully',
            severity: 'success'
          });
        } else {
          // If it's an update to an existing template
          await authorityService.updateTemplate(changedTemplate.id, changedTemplate);
          setSnackbar({
            open: true,
            message: 'Template updated successfully',
            severity: 'success'
          });
        }
      }

      // Reload templates to ensure we have the latest state
      await loadTemplates();
    } catch (error) {
      console.error('Error updating templates:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update templates',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Authority Forms
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage authority forms and templates
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Form Templates" />
          <Tab label="Active Forms" />
          <Tab label="Form History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <FormTemplateManager
            templates={templates}
            onChange={handleTemplatesChange}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Active forms section coming soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Form history section coming soon
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
