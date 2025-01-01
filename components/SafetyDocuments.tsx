'use client';
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Security as SafetyIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  CalendarToday as DateIcon,
  Info as InfoIcon,
  CheckCircle
} from '@mui/icons-material';

interface SafetyDocumentsProps {
  initialData?: {
    JSA: string;
    SWMS: string;
  };
  onUpdate: (data: {
    JSA: string;
    SWMS: string;
  }) => void;
}

interface DocumentInfo {
  type: 'JSA' | 'SWMS';
  title: string;
  description: string;
  required: boolean;
  validityPeriod: number; // in days
  requiredSections: string[];
}

const DOCUMENT_REQUIREMENTS: Record<'JSA' | 'SWMS', DocumentInfo> = {
  JSA: {
    type: 'JSA',
    title: 'Job Safety Analysis',
    description: 'Detailed analysis of job tasks and associated hazards',
    required: true,
    validityPeriod: 90, // 90 days
    requiredSections: [
      'Task Description',
      'Hazard Identification',
      'Risk Assessment',
      'Control Measures',
      'PPE Requirements',
      'Emergency Procedures'
    ]
  },
  SWMS: {
    type: 'SWMS',
    title: 'Safe Work Method Statement',
    description: 'Step-by-step guide for high-risk construction work',
    required: true,
    validityPeriod: 180, // 180 days
    requiredSections: [
      'Project Details',
      'High Risk Activities',
      'Resources Required',
      'Safety Controls',
      'Worker Training',
      'Monitoring Procedures'
    ]
  }
};

const SafetyDocuments: React.FC<SafetyDocumentsProps> = ({
  initialData,
  onUpdate
}) => {
  const [documents, setDocuments] = useState<{
    JSA: { path: string; uploadDate: string } | null;
    SWMS: { path: string; uploadDate: string } | null;
  }>({
    JSA: initialData?.JSA ? { path: initialData.JSA, uploadDate: new Date().toISOString() } : null,
    SWMS: initialData?.SWMS ? { path: initialData.SWMS, uploadDate: new Date().toISOString() } : null
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [showRequirements, setShowRequirements] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    onUpdate({
      JSA: documents.JSA?.path || '',
      SWMS: documents.SWMS?.path || ''
    });
  }, [documents]);

  const handleFileSelect = async (type: 'JSA' | 'SWMS', file: File) => {
    try {
      setUploading(true);
      // Simulate file upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // In a real implementation, you would upload the file to your server here
      // For now, we'll just store the file name
      setDocuments(prev => ({
        ...prev,
        [type]: {
          path: file.name,
          uploadDate: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (type: 'JSA' | 'SWMS') => {
    setDocuments(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const validateDocuments = () => {
    const missing: string[] = [];
    if (!documents.JSA) missing.push('JSA');
    if (!documents.SWMS) missing.push('SWMS');
    return {
      isValid: missing.length === 0,
      missing
    };
  };

  const showDocumentRequirements = (docType: 'JSA' | 'SWMS') => {
    setSelectedDocument(DOCUMENT_REQUIREMENTS[docType]);
    setShowRequirements(true);
  };

  const validation = validateDocuments();

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SafetyIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Safety Documents</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        All safety documents must be current and properly completed before work commences.
        Click the info button to view document requirements.
      </Alert>

      <Grid container spacing={3}>
        {Object.entries(DOCUMENT_REQUIREMENTS).map(([type, info]) => (
          <Grid item xs={12} md={6} key={type}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">{info.title}</Typography>
                <Button
                  size="small"
                  onClick={() => showDocumentRequirements(type as 'JSA' | 'SWMS')}
                  startIcon={<InfoIcon />}
                >
                  Requirements
                </Button>
              </Box>

              {documents[type as 'JSA' | 'SWMS'] ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DocumentIcon color="primary" />
                    <Typography variant="body2">
                      {documents[type as 'JSA' | 'SWMS']?.path}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateIcon fontSize="small" />
                    <Typography variant="caption">
                      Uploaded: {new Date(documents[type as 'JSA' | 'SWMS']?.uploadDate || '').toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(type as 'JSA' | 'SWMS')}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    fullWidth
                    disabled={uploading}
                  >
                    Upload {type}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(type as 'JSA' | 'SWMS', file);
                      }}
                    />
                  </Button>
                  {uploading && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {!validation.isValid && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Missing required documents: {validation.missing.join(', ')}
          </Typography>
        </Alert>
      )}

      {validation.isValid && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            All required safety documents have been uploaded
          </Typography>
        </Alert>
      )}

      <Dialog
        open={showRequirements}
        onClose={() => setShowRequirements(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDocument && (
          <>
            <DialogTitle>
              {selectedDocument.title} Requirements
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" paragraph>
                {selectedDocument.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Document Validity
              </Typography>
              <Typography variant="body2" paragraph>
                Valid for {selectedDocument.validityPeriod} days from the date of approval
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Required Sections
              </Typography>
              <List dense>
                {selectedDocument.requiredSections.map((section, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ValidIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={section} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowRequirements(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default SafetyDocuments;
