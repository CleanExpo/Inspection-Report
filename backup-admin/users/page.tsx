'use client';

import React, { useState, useRef } from 'react';
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
  Alert,
  Snackbar,
  FormHelperText,
  InputAdornment,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { UserRole, ROLE_DESCRIPTIONS, ROLE_COLORS, PASSWORD_PROTECTED_ROLES } from '@/app/types/auth';
import { AuthService } from '@/app/services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  password?: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'manager', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'technician', status: 'inactive' },
];

const initialFormState: UserFormData = {
  name: '',
  email: '',
  role: 'technician',
  status: 'active',
  password: '',
};

const roleFeatures = {
  developer: [
    { feature: 'Development Tools', access: true },
    { feature: 'System Configuration', access: true },
    { feature: 'User Management', access: true },
    { feature: 'Template Management', access: true },
    { feature: 'Report Generation', access: true },
    { feature: 'Data Deletion', access: true },
    { feature: 'API Access', access: true },
    { feature: 'Database Management', access: true }
  ],
  manager: [
    { feature: 'Development Tools', access: false },
    { feature: 'System Configuration', access: true },
    { feature: 'User Management', access: true },
    { feature: 'Template Management', access: true },
    { feature: 'Report Generation', access: true },
    { feature: 'Data Deletion', access: true },
    { feature: 'API Access', access: true },
    { feature: 'Database Management', access: false }
  ],
  admin: [
    { feature: 'Development Tools', access: false },
    { feature: 'System Configuration', access: false },
    { feature: 'User Management', access: true },
    { feature: 'Template Management', access: false },
    { feature: 'Report Generation', access: true },
    { feature: 'Data Deletion', access: false },
    { feature: 'API Access', access: false },
    { feature: 'Database Management', access: false }
  ],
  technician: [
    { feature: 'Development Tools', access: false },
    { feature: 'System Configuration', access: false },
    { feature: 'User Management', access: false },
    { feature: 'Template Management', access: false },
    { feature: 'Report Generation', access: true },
    { feature: 'Data Deletion', access: false },
    { feature: 'API Access', access: false },
    { feature: 'Database Management', access: false }
  ]
} as const;

// Initialize AuthService
const authService = AuthService.getInstance();

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UserFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showPassword, setShowPassword] = useState(false);
  const [roleInfoAnchorEl, setRoleInfoAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState<UserRole | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleRoleInfoClick = (event: React.MouseEvent<HTMLElement>, role: UserRole) => {
    setRoleInfoAnchorEl(event.currentTarget);
    setSelectedRoleInfo(role);
  };

  const handleRoleInfoClose = () => {
    setRoleInfoAnchorEl(null);
    setSelectedRoleInfo(null);
  };

  const validateForm = async (): Promise<boolean> => {
    const errors: Partial<UserFormData> = {};
    
    if (!editForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Invalid email format';
    }

    if (PASSWORD_PROTECTED_ROLES.includes(editForm.role)) {
      if (!editForm.password) {
        errors.password = 'Password is required for this role';
      } else if (!authService.validatePassword(editForm.password)) {
        errors.password = 'Password does not meet requirements';
      } else {
        const isValidPassword = await authService.verifyRolePassword(editForm.role, editForm.password);
        if (!isValidPassword) {
          errors.password = 'Invalid password for this role';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setEditForm({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setSelectedUser(null);
      setEditForm(initialFormState);
    }
    setFormErrors({});
    setOpenDialog(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormErrors({});
    setShowPassword(false);
  };

  const handleSave = async () => {
    if (!await validateForm()) {
      return;
    }

    try {
      if (selectedUser) {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...editForm }
            : user
        ));
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          status: editForm.status
        };
        setUsers([...users, newUser]);
        setSnackbar({
          open: true,
          message: 'User added successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = (userId: string) => {
    try {
      setUsers(users.filter(user => user.id !== userId));
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setEditForm(prev => ({
      ...prev,
      role: newRole,
      password: '',
    }));
    setFormErrors(prev => ({
      ...prev,
      password: undefined,
    }));
  };

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
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage technicians, managers, and admin access
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Users ({users.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New User
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      sx={{ 
                        bgcolor: ROLE_COLORS[user.role],
                        color: 'white',
                      }}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleRoleInfoClick(e, user.role)}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              inputRef={nameInputRef}
              autoFocus
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={(e) => handleRoleInfoClick(e, editForm.role)}
                      edge="end"
                    >
                      <InfoIcon />
                    </IconButton>
                  </InputAdornment>
                }
              >
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="technician">Technician</MenuItem>
              </Select>
              <FormHelperText>
                {ROLE_DESCRIPTIONS[editForm.role]}
              </FormHelperText>
            </FormControl>
            {PASSWORD_PROTECTED_ROLES.includes(editForm.role) && (
              <TextField
                label="Role Password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={editForm.password || ''}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                error={!!formErrors.password}
                helperText={formErrors.password || authService.getRolePasswordRequirements(editForm.role)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedUser ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(roleInfoAnchorEl)}
        anchorEl={roleInfoAnchorEl}
        onClose={handleRoleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {selectedRoleInfo && (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: ROLE_COLORS[selectedRoleInfo],
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {selectedRoleInfo.charAt(0).toUpperCase() + selectedRoleInfo.slice(1)} Role
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {ROLE_DESCRIPTIONS[selectedRoleInfo]}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {roleFeatures[selectedRoleInfo].map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {feature.access ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature.feature}
                    secondary={feature.access ? 'Full Access' : 'No Access'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Popover>

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
};

export default UserManagement;
