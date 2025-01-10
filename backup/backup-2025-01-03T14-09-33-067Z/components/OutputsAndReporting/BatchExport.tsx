import React, { useState, useCallback } from 'react';
import { generatePDF, downloadBlob, generateFilename, ExportError } from './ExportUtils';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItem,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { Queue, PlayArrow, Stop } from '@mui/icons-material';
import { ExportTheme } from './ExportTheme';

interface ExportDocument {
  id: string;
  title: string;
  contentRef: React.RefObject<HTMLElement>;
  tags?: string[];
  version?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

interface BatchExportProps {
  documents: ExportDocument[];
  theme: ExportTheme;
  onExportComplete?: (results: { id: string; success: boolean; error?: string }[]) => void;
}

interface ExportJob {
  document: ExportDocument;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export const BatchExport: React.FC<BatchExportProps> = ({
  documents,
  theme,
  onExportComplete,
}) => {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [exportQueue, setExportQueue] = useState<ExportJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get unique tags from all documents
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags || []))
  ).sort();

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const processQueue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const results: { id: string; success: boolean; error?: string }[] = [];
    const maxConcurrent = 3; // Process up to 3 documents simultaneously
    const queue = [...exportQueue];

    while (queue.length > 0) {
      const batch = queue.splice(0, maxConcurrent);
      const batchPromises = batch.map(async (job) => {
        try {
          // Update job status
          setExportQueue(current =>
            current.map(j =>
              j.document.id === job.document.id
                ? { ...j, status: 'processing' }
                : j
            )
          );

          if (!job.document.contentRef.current) {
            throw new Error('Content reference is not available');
          }

          // Generate and download PDF
          const blob = await generatePDF(job.document.contentRef.current, {
            theme,
            filename: generateFilename(job.document.title, 'pdf', job.document.version),
            paperSize: job.document.paperSize || 'a4',
            orientation: job.document.orientation || 'portrait'
          });

          // Download the generated PDF
          downloadBlob(
            blob,
            generateFilename(job.document.title, 'pdf', job.document.version)
          );

          // Update job status on success
          setExportQueue(current =>
            current.map(j =>
              j.document.id === job.document.id
                ? { ...j, status: 'completed' }
                : j
            )
          );

          results.push({ id: job.document.id, success: true });
        } catch (err) {
          // Handle export-specific errors
          const error = err instanceof ExportError ? err : new Error('Unknown error occurred');
          
          // Update job status on failure
          setExportQueue(current =>
            current.map(j =>
              j.document.id === job.document.id
                ? { ...j, status: 'failed', error: error.message }
                : j
            )
          );

          results.push({
            id: job.document.id,
            success: false,
            error: error.message,
          });
        }
      });

      await Promise.all(batchPromises);
    }

    setIsProcessing(false);
    onExportComplete?.(results);
  };

  const startExport = useCallback(() => {
    const filteredDocs = documents.filter(doc => {
      if (selectedTags.size === 0) {
        return selectedDocs.has(doc.id);
      }
      return (
        selectedDocs.has(doc.id) &&
        doc.tags?.some(tag => selectedTags.has(tag))
      );
    });

    setExportQueue(
      filteredDocs.map(doc => ({
        document: doc,
        status: 'pending',
      }))
    );
  }, [documents, selectedDocs, selectedTags]);

  const stopExport = () => {
    setIsProcessing(false);
    setExportQueue([]);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Batch Export
      </Typography>

      {/* Tag filters */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {allTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => toggleTag(tag)}
              color={selectedTags.has(tag) ? 'primary' : 'default'}
              variant={selectedTags.has(tag) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Document selection */}
      <List>
        {documents.map(doc => (
          <ListItem
            key={doc.id}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => toggleDocument(doc.id)}
                />
              }
              label={
                <Box>
                  <Typography>{doc.title}</Typography>
                  {doc.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {doc.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Export controls */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrow />}
          onClick={isProcessing ? undefined : processQueue}
          disabled={exportQueue.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Start Export'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Queue />}
          onClick={startExport}
          disabled={selectedDocs.size === 0 || isProcessing}
        >
          Queue Selected ({selectedDocs.size})
        </Button>
        {isProcessing && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Stop />}
            onClick={stopExport}
          >
            Stop
          </Button>
        )}
      </Box>

      {/* Export progress */}
      {exportQueue.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Export Progress
          </Typography>
          <List>
            {exportQueue.map(job => (
              <ListItem
                key={job.document.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ flex: 1 }}>{job.document.title}</Typography>
                  <Chip
                    label={job.status}
                    color={
                      job.status === 'completed'
                        ? 'success'
                        : job.status === 'failed'
                        ? 'error'
                        : 'default'
                    }
                    variant={job.status === 'processing' ? 'outlined' : 'filled'}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default BatchExport;
