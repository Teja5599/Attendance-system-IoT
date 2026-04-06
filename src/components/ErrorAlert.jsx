import { Alert, Snackbar } from '@mui/material';

export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%', boxShadow: 3 }}>
        {typeof error === 'string' ? error : error.message || 'An unexpected error occurred'}
      </Alert>
    </Snackbar>
  );
}
