// API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = {
  adminLogin: async (email, password) =>
    ({ ok: !!email && !!password, token: "demo", adminName: "Admin" }),
  listInstructorApplications: async () => {
    try {
      const response = await fetch(`${API_URL}/api/applications`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { ok: false, data: [] };
    }
  },
  decideApplication: async (id, decision, reason = '') => {
    try {
      const response = await fetch(`${API_URL}/api/applications/decide/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          decision: decision === 'accept' ? 'accept' : 'decline',
          reason: reason || ''
        })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to process application' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error deciding application:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  listUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { ok: false, data: [] };
    }
  },
  suspendUser: async (id, role) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to suspend user' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  reinstateUser: async (id, role) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}/reinstate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to reinstate user' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error reinstating user:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteUser: async (id, role) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete user' };
      }
      const result = await response.json();
      return { ok: true, message: result.message };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  listReports: async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { ok: false, data: [] };
    }
  },
  listFeedback: async () => {
    try {
      const response = await fetch(`${API_URL}/api/feedback`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      // Map the response to match the expected format
      const feedbacks = (result.data || []).map(f => ({
        id: f._id?.toString() || f.id,
        _id: f._id?.toString() || f.id,
        userName: f.userName,
        topic: f.topic,
        description: f.description,
        rating: f.rating || 5, // Default to 5 if no rating
        show: f.show || false,
        visible: f.show || false, // Keep visible for backward compatibility
        createdAt: f.createdAt,
        reporterId: f.reporterId || f.userId || null,
        fromRole: f.fromRole || f.role || null
      }));
      return { ok: true, data: feedbacks };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return { ok: false, data: [] };
    }
  },
  setFeedbackVisibility: async (id, visible) => {
    try {
      const response = await fetch(`${API_URL}/api/feedback/${id}/show`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show: visible })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to update feedback visibility' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error updating feedback visibility:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  getLearningPaths: async () => ({ ok: true, data: [] }),
  renameCourse: async () => ({ ok: true }),
  renameTopic: async () => ({ ok: true }),
  renameLesson: async () => ({ ok: true }),
  getSettings: async () => ({ ok: true, data: {} }),
  saveSettings: async (settings) => ({ ok: true, settings }),
  addUser: async (payload) => ({ ok: true, payload }),
  createUser: async (userData) => ({ ok: true, userData }),
};

export default api;

