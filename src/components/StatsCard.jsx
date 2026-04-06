import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

export default function StatsCard({ title, value, icon: Icon, color = 'primary' }) {
  const theme = useTheme();

  return (
    <Card>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="subtitle2" gutterBottom fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${theme.palette[color].main}20`,
              color: theme.palette[color].main,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
            }}
          >
            {Icon && <Icon fontSize="large" />}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
