'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  Divider,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { ClientService } from '../../services/clientService';
import GoogleReviewQR from '../../components/GoogleReviewQR';
import BusinessContactQR from '../../components/BusinessContactQR';
import type { Client, ClientHistory, ClientFormData } from '../../types/client';

const clientService = ClientService.getInstance();
const GOOGLE_REVIEW_LINK = 'https://g.page/r/Cc_0iAGjSNy3EBM/review';

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
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
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

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<ClientHistory[]>([]);
  const [editForm, setEditForm] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tabValue, setTabValue] = useState(0);

  React.useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load clients',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setEditForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        status: client.status
      });
    } else {
      setSelectedClient(null);
      setEditForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        status: 'active'
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenHistory = async (client: Client) => {
    setSelectedClient(client);
    try {
      const history = await clientService.getClientHistory(client.id);
      setClientHistory(history);
      setOpenHistoryDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load client history',
        severity: 'error'
      });
    }
  };

  const handleOpenQR = (client: Client) => {
    setSelectedClient(client);
    setOpenQRDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    setErrors({});
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedClient(null);
    setClientHistory([]);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
    setSelectedClient(null);
  };

  const handleSave = async () => {
    try {
      if (selectedClient) {
        await clientService.updateClient(selectedClient.id, editForm);
        setSnackbar({
          open: true,
          message: 'Client updated successfully',
          severity: 'success'
        });
      } else {
        await clientService.createClient(editForm);
        setSnackbar({
          open: true,
          message: 'Client added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadClients();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      await clientService.deleteClient(clientId);
      setSnackbar({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success'
      });
      loadClients();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete client',
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconButton sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Client Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage client information and inspection history
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Clients" />
          <Tab label="Google Reviews" />
          <Tab label="Business Card" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add New Client
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Inspection</TableCell>
                  <TableCell>Total Inspections</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{client.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{client.phone}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={client.status}
                        color={client.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{client.lastInspection}</TableCell>
                    <TableCell>{client.totalInspections}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View History">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenHistory(client)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Google Review QR">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenQR(client)}
                          color="primary"
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(client)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(client.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <GoogleReviewQR 
              reviewLink={GOOGLE_REVIEW_LINK}
              businessName="DRQ Inspection Services"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Share this QR code with clients to easily collect Google Reviews
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <BusinessContactQR 
              businessName="Disaster Recovery Qld"
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Edit/Add Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedClient ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  error={!!errors.company}
                  helperText={errors.company}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedClient ? 'Save Changes' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography>
              Inspection History - {selectedClient?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {clientHistory.length === 0 ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No inspection history available
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {clientHistory.map((history) => (
                <Paper
                  key={history.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {history.inspectionId} - {history.type} Inspection
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {history.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inspector: {history.inspector}
                  </Typography>
                  <Chip
                    label={history.status}
                    size="small"
                    color={history.status === 'Completed' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog
        open={openQRDialog}
        onClose={handleCloseQRDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon color="primary" />
            <Typography>
              Google Review QR Code - {selectedClient?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <GoogleReviewQR 
            reviewLink={GOOGLE_REVIEW_LINK}
            businessName="DRQ Inspection Services"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRDialog}>Close</Button>
        </DialogActions>
      </Dialog>

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
