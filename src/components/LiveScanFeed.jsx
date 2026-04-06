import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, Chip } from '@mui/material';
import { Person as PersonIcon, Login as LoginIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { formatTime } from '../utils/formatters';

export default function LiveScanFeed({ logs, users }) {
  const [highlightedId, setHighlightedId] = useState(null);
  const prevLogsLengthRef = useRef(logs?.length || 0);

  // Get the 20 most recent logs
  const recentLogs = [...(logs || [])].slice(0, 20);

  useEffect(() => {
    if (logs && logs.length > prevLogsLengthRef.current && logs.length > 0) {
      // New log added!
      const newLogId = logs[0].id;
      setHighlightedId(newLogId);
      
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
      
      prevLogsLengthRef.current = logs.length;
      return () => clearTimeout(timer);
    }
  }, [logs]);

  const getUserName = (log) => {
    // Check if ESP32 sent a valid name directly in the log
    if (log.name && log.name.toLowerCase() !== 'unknown') {
      return log.name;
    }
    // Fall back to mapping the UID from the dashboard's users database (case-insensitive)
    const user = users.find(u => String(u.rfidUid).toLowerCase() === String(log.rfidUid).toLowerCase());
    return user ? user.name : 'Unknown User';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Live Scans
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: 'success.main',
              animation: 'pulse 1.5s infinite' 
            }} />
            <Typography variant="caption" color="text.secondary">
              Live
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        {recentLogs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No recent scans</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentLogs.map((log) => {
              const isHighlight = log.id === highlightedId;
              const isOut = log.status === 'OUT';
              
              return (
                <ListItem 
                  key={log.id}
                  divider
                  sx={{ 
                    transition: 'background-color 0.5s ease',
                    backgroundColor: isHighlight ? 'action.hover' : 'transparent',
                    px: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isOut ? 'warning.light' : 'success.light' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={getUserName(log)}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTime(log.timestamp)}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={log.status} 
                          color={isOut ? 'warning' : 'success'} 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                          icon={isOut ? <LogoutIcon fontSize="small" /> : <LoginIcon fontSize="small" />}
                        />
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                    {log.rfidUid}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </Card>
  );
}
