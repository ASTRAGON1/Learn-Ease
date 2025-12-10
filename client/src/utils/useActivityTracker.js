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
      console.log(`[useActivityTracker] Starting activity tracker for ${role}`);
      activityTracker.start(role);
      
      return () => {
        console.log(`[useActivityTracker] Stopping activity tracker`);
        activityTracker.stop();
      };
    }
  }, [role, isAuthenticated]);
  
  return {
    logout: (shouldNavigate = true) => activityTracker.logout(shouldNavigate)
  };
}

export default useActivityTracker;

