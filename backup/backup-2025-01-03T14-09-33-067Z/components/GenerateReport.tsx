"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import type { InspectionReport, InspectionNote } from '../types/inspection';

interface GenerateReportProps {
  report: InspectionReport;
  className?: string;
}

const GenerateReport: React.FC<GenerateReportProps> = ({
  report,
  className = ""
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Here you would typically:
      // 1. Format all report data
      // 2. Generate PDF/Word document
      // 3. Save or download the file

      const reportContent = `
INSPECTION REPORT
================

Job Number: ${report.jobNumber}
Inspector: ${report.inspector}
Location: ${report.location}
Date: ${formatDate(report.inspectionDate)}
Status: ${report.status}

Notes:
------
${report.notes?.map(note => 
  `${formatDate(note.createdAt)} (${note.type || 'General'}): ${note.content}`
).join('\n\n') || 'No notes available'}

${report.submittedAt ? `Submitted: ${formatDate(report.submittedAt)}` : ''}
${report.approvedAt ? `Approved: ${formatDate(report.approvedAt)}` : ''}
${report.rejectedAt ? `Rejected: ${formatDate(report.rejectedAt)}
Rejection Reason: ${report.rejectionReason}` : ''}
      `.trim();

      // For now, just create a text file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-report-${report.jobNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Paper className={`p-6 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Report Preview
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="space-y-4">
        {/* Report Header */}
        <Box>
          <Typography variant="subtitle1">Job #{report.jobNumber}</Typography>
          <Typography variant="body2" color="textSecondary">
            {formatDate(report.inspectionDate)}
          </Typography>
        </Box>

        <Divider />

        {/* Notes Section */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Notes
          </Typography>
          <List>
            {report.notes?.map((note, index) => (
              <ListItem key={note.id} divider={index < (report.notes?.length || 0) - 1}>
                <ListItemText
                  primary={
                    <Box className="flex justify-between">
                      <Typography variant="body2">
                        {note.type || 'General'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(note.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={note.content}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        {/* Actions */}
        <Box className="flex justify-end pt-4">
          <Button
            variant="contained"
            color="primary"
            startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default GenerateReport;
