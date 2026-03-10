import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * Reduces duplication of loading state management
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        return await asyncFn();
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  };
};
