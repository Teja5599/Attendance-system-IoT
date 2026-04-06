import { useState, useEffect } from 'react';
import { listenToAttendance } from '../services/attendanceService';

export const useAttendance = (dateFilter = null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToAttendance((data, fetchError) => {
      if (fetchError) {
        setError(fetchError);
      } else {
        setLogs(data);
        setError(null);
      }
      setLoading(false);
    }, dateFilter);

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [dateFilter]); // Re-run if the date filter changes

  return { logs, loading, error };
};
