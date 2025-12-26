// Activity tracker utility to keep users online
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ActivityTracker {
  constructor() {
    this.activityInterval = null;
    this.inactivityTimeout = null;
    this.UPDATE_INTERVAL = 5 * 60 * 1000; // Update every 5 minutes
    this.INACTIVITY_THRESHOLD = 25 * 60 * 1000; // Log out after 25 minutes of inactivity
    this.lastActivity = Date.now();
    this.isTracking = false;
    this.userRole = null;
  }

  // Start tracking user activity
  start(role) {
    if (this.isTracking) return;

    this.userRole = role; // 'student' or 'teacher'
    this.isTracking = true;
    this.lastActivity = Date.now();

    // Update activity immediately
    this.updateActivity();

    // Set up periodic activity updates
    this.activityInterval = setInterval(() => {
      this.updateActivity();
    }, this.UPDATE_INTERVAL);

    // Set up inactivity detection
    this.resetInactivityTimer();

    // Listen for user interactions to reset inactivity timer
    this.setupEventListeners();

    // Handle page unload/close
    this.setupUnloadHandler();
  }

  // Stop tracking
  stop() {
    if (!this.isTracking) return;

    this.isTracking = false;

    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }

    this.removeEventListeners();
  }

  // Update activity on the server
  async updateActivity() {
    if (!this.isTracking || !this.userRole) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.stop();
        return;
      }

      const endpoint = this.userRole === 'student'
        ? '/api/students/auth/activity'
        : '/api/teachers/auth/activity';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If unauthorized, stop tracking
        if (response.status === 401 || response.status === 403) {
          this.stop();
        }
      } else {
      }
    } catch (error) {
      console.error('[ActivityTracker] Error updating activity:', error);
    }
  }

  // Log out the user
  async logout(shouldNavigate = true) {
    if (!this.userRole) return;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const endpoint = this.userRole === 'student'
          ? '/api/students/auth/logout'
          : '/api/teachers/auth/logout';

        // Use sendBeacon for reliable logout on page unload
        const data = new Blob([JSON.stringify({})], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}${endpoint}?token=${encodeURIComponent(token)}`, data);

        // Also try regular fetch
        fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => { }); // Ignore errors
      }
    } catch (error) {
      console.error('[ActivityTracker] Error during logout:', error);
    } finally {
      this.stop();

      if (shouldNavigate) {
        // Clear local storage
        localStorage.removeItem('token');

        // Redirect to login
        window.location.href = '/all-login';
      }
    }
  }

  // Reset inactivity timer
  resetInactivityTimer() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    this.lastActivity = Date.now();

    this.inactivityTimeout = setTimeout(() => {
      this.logout(true);
    }, this.INACTIVITY_THRESHOLD);
  }

  // Setup event listeners for user activity
  setupEventListeners() {
    this.activityHandler = () => {
      this.resetInactivityTimer();
    };

    // Listen for user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, this.activityHandler, { passive: true });
    });
  }

  // Remove event listeners
  removeEventListeners() {
    if (this.activityHandler) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        window.removeEventListener(event, this.activityHandler);
      });
    }
  }

  // Setup unload handler to mark user offline
  setupUnloadHandler() {
    this.unloadHandler = () => {
      // Call logout without navigation
      this.logout(false);
    };

    window.addEventListener('beforeunload', this.unloadHandler);
    window.addEventListener('pagehide', this.unloadHandler);
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;

