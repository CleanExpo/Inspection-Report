import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Assignment as ReportIcon,
  Person as TechnicianIcon,
  Flag as FlagIcon,
  CheckCircle as ApproveIcon,
  Warning as ReviewIcon,
  Schedule as PendingIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotifyIcon
} from '@mui/icons-material';

interface Report {
  id: string;
  title: string;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'review' | 'approved';
  timestamp: string;
  mediaCount: number;
  notes: string[];
  flaggedItems: string[];
  moistureReadings: {
    date: string;
    average: number;
    critical: number;
  }[];
}

interface Technician {
  id: string;
  name: string;
  activeJobs: number;
  completedJobs: number;
  certifications: string[];
  status: 'active' | 'onsite' | 'offline';
}

interface AdminDashboardProps {
  reports: Report[];
  technicians: Technician[];
  onReportApprove: (reportId: string) => void;
  onReportReview: (reportId: string, notes: string) => void;
  onTechnicianNotify: (technicianId: string, message: string) => void;
  onReportDownload: (reportId: string) => void;
  onReportPrint: (reportId: string) => void;
}

export default function AdminDashboard({
  reports,
  technicians,
  onReportApprove,
  onReportReview,
  onTechnicianNotify,
  onReportDownload,
  onReportPrint
}: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [notifyDialog, setNotifyDialog] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

  const handleReviewSubmit = () => {
    if (selectedReport && reviewNotes.trim()) {
      onReportReview(selectedReport.id, reviewNotes);
      setReviewDialog(false);
      setReviewNotes('');
    }
  };

  const handleNotifySubmit = () => {
    if (selectedTechnician && notifyMessage.trim()) {
      onTechnicianNotify(selectedTechnician.id, notifyMessage);
      setNotifyDialog(false);
      setNotifyMessage('');
    }
  };

  const getStatusColor = (status: Report['status'] | Technician['status']) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'success';
      case 'review':
      case 'onsite':
        return 'warning';
      case 'pending':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          centered
        >
          <Tab 
            label={
              <Badge badgeContent={reports.filter(r => r.status === 'pending').length} color="error">
                Reports
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={technicians.filter(t => t.status === 'onsite').length} color="primary">
                Technicians
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper>
              <List>
                {reports.map(report => (
                  <ListItemButton
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    selected={selectedReport?.id === report.id}
                  >
                    <ListItemIcon>
                      <ReportIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={report.title}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption">
                            {new Date(report.timestamp).toLocaleString()}
                          </Typography>
                          <Chip
                            size="small"
                            label={report.status}
                            color={getStatusColor(report.status)}
                          />
                          <Typography variant="caption">
                            {report.technicianName}
                          </Typography>
                        </Stack>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportDownload(report.id);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportPrint(report.id);
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {selectedReport && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Report Details
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Media Files
                      </Typography>
                      <Typography>
                        {selectedReport.mediaCount} items
                      </Typography>
                    </Box>

                    {selectedReport.flaggedItems.length > 0 && (
                      <Alert severity="warning">
                        {selectedReport.flaggedItems.length} items flagged for review
                      </Alert>
                    )}

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Moisture Readings
                      </Typography>
                      {selectedReport.moistureReadings.map((reading, index) => (
                        <Typography key={index} variant="body2">
                          {new Date(reading.date).toLocaleDateString()}: 
                          Avg {reading.average.toFixed(1)}% | 
                          Critical {reading.critical}
                        </Typography>
                      ))}
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <List dense>
                        {selectedReport.notes.map((note, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={note} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions>
                  <Button
                    startIcon={<ApproveIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => onReportApprove(selectedReport.id)}
                    disabled={selectedReport.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    startIcon={<ReviewIcon />}
                    variant="contained"
                    color="warning"
                    onClick={() => setReviewDialog(true)}
                    disabled={selectedReport.status === 'approved'}
                  >
                    Request Review
                  </Button>
                </CardActions>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={2}>
          {technicians.map(technician => (
            <Grid item xs={12} sm={6} md={4} key={technician.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TechnicianIcon fontSize="large" />
                    <Box>
                      <Typography variant="h6">
                        {technician.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={technician.status}
                        color={getStatusColor(technician.status)}
                      />
                    </Box>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Active Jobs: {technician.activeJobs}
                    </Typography>
                    <Typography variant="body2">
                      Completed: {technician.completedJobs}
                    </Typography>
                    <Box>
                      {technician.certifications.map(cert => (
                        <Chip
                          key={cert}
                          label={cert}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions>
                  <Button
                    startIcon={<NotifyIcon />}
                    size="small"
                    onClick={() => {
                      setSelectedTechnician(technician);
                      setNotifyDialog(true);
                    }}
                  >
                    Notify
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)}>
        <DialogTitle>Request Review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReviewSubmit}
            disabled={!reviewNotes.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialog} onClose={() => setNotifyDialog(false)}>
        <DialogTitle>Notify Technician</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifyDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleNotifySubmit}
            disabled={!notifyMessage.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
