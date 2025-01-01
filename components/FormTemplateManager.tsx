'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Delete as DeleteIcon,
  FileCopy as FileIcon,
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTemplates, type Template } from '../hooks/useTemplates';
import { validateTemplate } from '../utils/formTemplates';

interface FormTemplateManagerProps {
  formData: any;
}

const FormTemplateManager: React.FC<FormTemplateManagerProps> = ({ formData }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    show: false,
    message: '',
    severity: 'success'
  });

  const {
    loading,
    error,
    uploadTemplate,
    deleteTemplate,
    downloadFilledTemplate
  } = useTemplates({
    onError: (error) => showNotification(error.message, 'error')
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      for (const file of acceptedFiles) {
        const validation = await validateTemplate(file);
        
        if (!validation.isValid) {
          showNotification(validation.message, 'error');
          continue;
        }

        const template = await uploadTemplate(file);
        setTemplates(prev => [...prev, template]);
        showNotification('Template uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadDialogOpen(false);
    }
  }, [uploadTemplate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5242880 // 5MB
  });

  const handleDelete = async (template: Template) => {
    try {
      await deleteTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      showNotification('Template deleted successfully', 'success');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFill = async (template: Template) => {
    if (!formData) {
      showNotification('Please fill in the form data first', 'error');
      return;
    }

    try {
      await downloadFilledTemplate(template, formData);
      showNotification('Template filled and downloaded successfully', 'success');
    } catch (error) {
      console.error('Fill template error:', error);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      severity
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 6000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Form Templates</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Template
        </Button>
      </Box>

      {notification.show && (
        <Alert 
          severity={notification.severity} 
          sx={{ mb: 2 }}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          {notification.message}
        </Alert>
      )}

      <List>
        {templates.map((template) => (
          <ListItem
            key={template.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1
            }}
          >
            <ListItemIcon>
              {template.type === 'pdf' ? <PdfIcon /> : <DocIcon />}
            </ListItemIcon>
            <ListItemText
              primary={template.filename}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {template.type.toUpperCase()} • {formatFileSize(template.size)}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    Uploaded: {new Date(template.uploadedAt).toLocaleString()}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Fill & Download">
                <IconButton
                  edge="end"
                  onClick={() => handleFill(template)}
                  disabled={loading}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(template)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Form Template</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <React.Fragment>
                <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography>
                  {isDragActive
                    ? 'Drop the files here...'
                    : "Drag 'n' drop templates here, or click to select"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supports DOCX and PDF (Max 5MB)
                </Typography>
              </React.Fragment>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FormTemplateManager;
