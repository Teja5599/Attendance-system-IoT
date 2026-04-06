import { format } from 'date-fns';

export const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  try {
    return format(new Date(Number(timestamp)), 'MMM dd, yyyy');
  } catch (error) {
    return '-';
  }
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  try {
    return format(new Date(Number(timestamp)), 'hh:mm:ss a');
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  try {
    return format(new Date(Number(timestamp)), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return '-';
  }
};
