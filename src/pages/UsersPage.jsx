import { useState } from 'react';
import { 
  Box, Typography, Card, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  CircularProgress, Chip, InputAdornment, useTheme
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  CreditCard as RfidIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useUsers } from '../hooks/useUsers';
import { addUser, updateUser, deleteUser } from '../services/userService';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';

export default function UsersPage() {
  const { users, loading, error } = useUsers();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', rfidUid: '', role: 'user' });

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.rfidUid || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({ name: user.name, rfidUid: user.rfidUid, role: user.role || 'user' });
    } else {
      setCurrentUser(null);
      setFormData({ name: '', rfidUid: '', role: 'user' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.rfidUid) {
      setActionError("Name and RFID UID are required.");
      return;
    }

    setActionLoading(true);
    let result;
    
    if (currentUser) {
      result = await updateUser(currentUser.id, formData);
    } else {
      result = await addUser(formData.name, formData.rfidUid, formData.role);
    }

    setActionLoading(false);
    
    if (result.success) {
      handleCloseDialog();
    } else {
      setActionError(result.error);
    }
  };

  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    
    setActionLoading(true);
    const result = await deleteUser(currentUser.id);
    setActionLoading(false);
    
    if (result.success) {
      setDeleteDialogOpen(false);
      setCurrentUser(null);
    } else {
      setActionError(result.error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Users Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage users and assign RFID cards.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <ErrorAlert error={error || actionError} onClose={() => setActionError(null)} />

      <Card>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            placeholder="Search by name or RFID..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>
        
        {filteredUsers.length === 0 ? (
          <EmptyState 
            message={searchQuery ? "No users match your search" : "No users found in the system. Add one to get started."} 
            icon={PeopleIcon} 
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>RFID UID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Added Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell fontWeight={500}>{user.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RfidIcon color="action" fontSize="small" />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {user.rfidUid}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role || 'user'} 
                        size="small" 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        variant={user.role === 'admin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(user)} size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(user)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              autoFocus
              required
            />
            <TextField
              label="RFID UID"
              fullWidth
              value={formData.rfidUid}
              onChange={(e) => setFormData({...formData, rfidUid: e.target.value})}
              helperText="e.g. A1:B2:C3:D4 (Matches the format sent by ESP32)"
              required
            />
            <TextField
              label="Role"
              fullWidth
              select
              SelectProps={{ native: true }}
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            disabled={actionLoading || !formData.name || !formData.rfidUid}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Save User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
