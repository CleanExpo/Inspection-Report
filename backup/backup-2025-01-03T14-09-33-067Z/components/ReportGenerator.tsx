"use client";

import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import type { InspectionReport, InspectionNote } from '../types/inspection';

interface ReportGeneratorProps {
  report: InspectionReport;
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  report,
  className = ""
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNotes = (notes: InspectionNote[] = []) => {
    return notes.map(note =>
      `${formatDate(note.createdAt)} (${note.type || 'General'}): ${note.content}`
    ).join('\n\n');
  };

  const generateReport = async () => {
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
${formatNotes(report.notes)}

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
        Report Generator
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="flex justify-between items-center">
        <Typography variant="body2" color="textSecondary">
          Generate a detailed report for job #{report.jobNumber}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={generateReport}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ReportGenerator;
