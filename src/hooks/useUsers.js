import { useState, useEffect } from 'react';
import { listenToUsers } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToUsers((data, fetchError) => {
      if (fetchError) {
        setError(fetchError);
      } else {
        setUsers(data);
        setError(null);
      }
      setLoading(false);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  return { users, loading, error };
};
