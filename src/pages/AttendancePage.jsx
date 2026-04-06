import { useState, useMemo } from 'react';
import { 
  Box, Typography, Card, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, MenuItem,
  CircularProgress, Chip, useTheme
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  ListAlt as ListIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAttendance } from '../hooks/useAttendance';
import { useUsers } from '../hooks/useUsers';
import { exportToCSV } from '../utils/csvExport';
import { formatTime, formatDate } from '../utils/formatters';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

export default function AttendancePage() {
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [userFilter, setUserFilter] = useState('all');
  
  const { logs, loading: logsLoading, error: logsError } = useAttendance(dateFilter);
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const theme = useTheme();

  const loading = logsLoading || usersLoading;
  const error = logsError || usersError;

  // Enhance logs with user names and handle client-side user filter
  const processedLogs = useMemo(() => {
    if (!logs || !users) return [];
    
    let filtered = logs;
    
    // Apply user filter client-side if a specific user is selected
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.rfidUid === userFilter || log.userId === userFilter);
    }
    
    return filtered.map(log => {
      let finalName = 'Unknown User';
      
      // If ESP32 provides a real name directly on the log, prioritize it
      if (log.name && String(log.name).toLowerCase() !== 'unknown') {
        finalName = log.name;
      } else {
        // Fallback to Dashboard's Users table mapping (case-insensitive)
        const user = users.find(u => String(u.rfidUid).toLowerCase() === String(log.rfidUid).toLowerCase());
        if (user) finalName = user.name;
      }

      return {
        ...log,
        userName: finalName
      };
    });
  }, [logs, users, userFilter]);

  const handleExportCSV = () => {
    if (processedLogs.length === 0) return;
    
    const exportData = processedLogs.map(log => ({
      Name: log.userName,
      'RFID UID': log.rfidUid,
      Date: log.date || formatDate(log.timestamp),
      Time: formatTime(log.timestamp),
      Status: log.status
    }));
    
    exportToCSV(exportData, `attendance_${dateFilter || 'all'}.csv`);
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
            Attendance Logs
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View detailed attendance records and export data.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<DownloadIcon />} 
          onClick={handleExportCSV}
          disabled={processedLogs.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      <ErrorAlert error={error} />

      <Card sx={{ mb: 4 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          borderBottom: `1px solid ${theme.palette.divider}` 
        }}>
          <TextField
            type="date"
            label="Date Filter"
            variant="outlined"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <TextField
            select
            label="User Filter"
            variant="outlined"
            size="small"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 250 } }}
          >
            <MenuItem value="all">All Users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.rfidUid}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flexGrow: 1 }} />
          {(dateFilter || userFilter !== 'all') && (
            <Button 
              size="small" 
              onClick={() => {
                setDateFilter(''); 
                setUserFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {processedLogs.length === 0 ? (
          <EmptyState 
            message="No attendance records found for the selected filters." 
            icon={ListIcon} 
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>RFID UID</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>System Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedLogs.map((log) => {
                  const isOut = log.status === 'OUT';
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell fontWeight={500}>{log.userName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {log.rfidUid}
                      </TableCell>
                      <TableCell fontWeight={600}>
                        {formatTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.status} 
                          size="small" 
                          color={isOut ? 'warning' : 'success'}
                          icon={isOut ? <LogoutIcon fontSize="small" /> : <LoginIcon fontSize="small" />}
                          sx={{ minWidth: 80, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
