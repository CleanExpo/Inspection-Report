import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import AdvancedReporting from '../components/AdvancedReporting';
import { Report } from '../types/shared';
import { TimeSeriesData } from '../types/lidar';

interface FilterOptions {
  status: ('pending' | 'review' | 'approved')[];
  dateRange: {
    start: string;
    end: string;
  };
  technician: string;
}

export default function ReportsPage() {
  const { state, dispatch } = useAppContext();
  const { showNotification, startLoading, stopLoading } = useLoading();

  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: ['pending', 'review', 'approved'],
    dateRange: {
      start: '',
      end: ''
    },
    technician: ''
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return state.reports
      .filter(report => {
        // Status filter
        if (!filters.status.includes(report.status)) return false;

        // Date range filter
        if (filters.dateRange.start && new Date(report.timestamp) < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && new Date(report.timestamp) > new Date(filters.dateRange.end)) return false;

        // Technician filter
        if (filters.technician && report.technicianId !== filters.technician) return false;

        // Search query
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return (
            report.title.toLowerCase().includes(searchLower) ||
            report.technicianName.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.reports, filters, searchQuery]);

  // Prepare time series data for selected report
  const reportTimeSeriesData: TimeSeriesData[] = useMemo(() => {
    if (!selectedReport) return [];
    return selectedReport.lidarScans.map(scan => ({
      timestamp: scan.timestamp,
      moistureReadings: scan.moisturePoints,
      thermalData: scan.thermalPoints,
      structuralChanges: scan.structuralRisks?.map(risk => ({
        location: risk.location,
        type: 'moisture-damage',
        value: 1
      }))
    }));
  }, [selectedReport]);

  // Handle report actions
  const handleExport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    try {
      startLoading(`Exporting report as ${format.toUpperCase()}...`);
      // Implement export logic
      showNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showNotification('Failed to export report', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      startLoading('Deleting report...');
      dispatch({ type: 'DELETE_REPORT', payload: reportId });
      showNotification('Report deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete report', 'error');
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Inspection Reports</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {/* Open filter dialog */}}
            >
              Filters
            </Button>
          </Stack>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Readings</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.technicianName}</TableCell>
                    <TableCell>
                      {new Date(report.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        color={
                          report.status === 'approved'
                            ? 'success'
                            : report.status === 'review'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{report.moistureReadings.length}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReport(report);
                              setDetailsOpen(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {/* Handle edit */}}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(report.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>

        {/* Report Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {selectedReport?.title}
            <Typography variant="subtitle2" color="text.secondary">
              {selectedReport?.technicianName} - {new Date(selectedReport?.timestamp || '').toLocaleString()}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Stack spacing={3}>
                <AdvancedReporting
                  reports={[selectedReport]}
                  moistureReadings={selectedReport.moistureReadings}
                  timeSeriesData={reportTimeSeriesData}
                  onExport={handleExport}
                  onPrint={() => window.print()}
                  onShare={() => {/* Handle share */}}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
}
