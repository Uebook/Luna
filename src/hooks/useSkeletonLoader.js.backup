import { useState, useEffect } from 'react';

/**
 * Custom hook for managing skeleton loading states
 * @param {boolean} initialLoading - Initial loading state
 * @param {number} minLoadingTime - Minimum time to show skeleton (ms)
 * @returns {[boolean, function]} - [loading, setLoading]
 */
export const useSkeletonLoader = (initialLoading = true, minLoadingTime = 500) => {
  const [loading, setLoading] = useState(initialLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!loading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      if (remaining > 0) {
        const timer = setTimeout(() => {
          setLoading(false);
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, startTime, minLoadingTime]);

  const setLoadingState = (value) => {
    if (value === false) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(value);
    }
  };

  return [loading, setLoadingState];
};

export default useSkeletonLoader;

