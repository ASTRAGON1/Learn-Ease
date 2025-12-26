import { useEffect } from 'react';
import activityTracker from './activityTracker';

/**
 * Custom hook to automatically start/stop activity tracking
 * @param {string} role - User role ('student' or 'teacher')
 * @param {boolean} isAuthenticated - Whether user is authenticated
 */
export function useActivityTracker(role, isAuthenticated = true) {
  useEffect(() => {
    if (isAuthenticated && role) {
      activityTracker.start(role);

      return () => {
        activityTracker.stop();
      };
    }
  }, [role, isAuthenticated]);

  return {
    logout: (shouldNavigate = true) => activityTracker.logout(shouldNavigate)
  };
}

export default useActivityTracker;

