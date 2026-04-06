import { useMemo } from 'react';
import { Grid, Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { 
  People as PeopleIcon, 
  Login as LoginIcon, 
  Logout as LogoutIcon,
  CheckCircle as PresentIcon 
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays } from 'date-fns';
import StatsCard from '../components/StatsCard';
import LiveScanFeed from '../components/LiveScanFeed';
import ErrorAlert from '../components/ErrorAlert';
import { useUsers } from '../hooks/useUsers';
import { useAttendance } from '../hooks/useAttendance';

export default function Dashboard() {
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { logs, loading: logsLoading, error: logsError } = useAttendance();

  const loading = usersLoading || logsLoading;
  const error = usersError || logsError;

  // Calculate Stats
  const stats = useMemo(() => {
    if (!logs || !users) return null;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayLogs = logs.filter(log => log.date === todayStr);

    const todayIn = todayLogs.filter(log => log.status === 'IN').length;
    const todayOut = todayLogs.filter(log => log.status === 'OUT').length;
    
    // Unique users present today (have checked IN but not checked OUT? Or just anyone who checked in today)
    const uniquePresentToday = new Set(todayLogs.filter(log => log.status === 'IN').map(l => l.rfidUid)).size;

    return {
      totalUsers: users.length,
      todayIn,
      todayOut,
      uniquePresentToday
    };
  }, [logs, users]);

  // Calculate Chart Data (current week Monday to Sunday)
  const chartData = useMemo(() => {
    if (!logs) return [];
    
    // Get the Monday of the current week (weekStartsOn: 1 means Monday)
    const mondayDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    
    const data = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(mondayDate, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      
      const dayLogs = logs.filter(log => log.date === dateStr && log.status === 'IN');
      const uniqueScans = new Set(dayLogs.map(l => l.rfidUid)).size;
      
      data.push({
        name: format(targetDate, 'EEEE'), // Monday, Tuesday...
        date: format(targetDate, 'MMM dd'),
        count: uniqueScans
      });
    }
    return data;
  }, [logs]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of today's attendance and recent activity.
      </Typography>

      <ErrorAlert error={error} />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={PeopleIcon} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Present Today" 
            value={stats?.uniquePresentToday || 0} 
            icon={PresentIcon} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Total IN Scans" 
            value={stats?.todayIn || 0} 
            icon={LoginIcon} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Total OUT Scans" 
            value={stats?.todayOut || 0} 
            icon={LogoutIcon} 
            color="warning" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Attendance Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 350, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#111827', fontWeight: 600 }}
                      itemStyle={{ color: '#4F46E5' }}
                    />
                    <Bar dataKey="count" name="Unique Attendees" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4F46E5' : '#A5B4FC'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', minHeight: { xs: 400, md: 420 } }}>
            <LiveScanFeed logs={logs} users={users} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
