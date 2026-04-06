import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ message = 'No data available', icon: Icon = InboxIcon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
}
