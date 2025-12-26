// API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = {
  adminLogin: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        return { ok: false, error: result.error || 'Login failed' };
      }

      return {
        ok: true,
        token: result.token || "admin_token",
        adminName: result.adminName || "Admin"
      };
    } catch (error) {
      console.error('Error during admin login:', error);
      return { ok: false, error: 'Network error' };
    }
  },
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
  getStudentProfiles: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/student-profiles`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching student profiles:', error);
      return { ok: false, data: [] };
    }
  },
  getInstructorProfiles: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/instructor-profiles`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching instructor profiles:', error);
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
  getLearningPaths: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      return { ok: false, data: [] };
    }
  },
  createPath: async (name, type) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create path' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating path:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  createCourse: async (pathId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create course' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating course:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  createTopic: async (pathId, courseId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create topic' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating topic:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  createLesson: async (pathId, courseId, topicId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics/${topicId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create lesson' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  renameCourse: async (pathId, courseId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to rename course' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error renaming course:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  renameTopic: async (pathId, courseId, topicId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to rename topic' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error renaming topic:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  renameLesson: async (pathId, courseId, topicId, lessonId, name) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to rename lesson' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error renaming lesson:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  bulkImportLearningPaths: async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to import data' };
      }
      const result = await response.json();
      return { ok: true, data: result };
    } catch (error) {
      console.error('Error bulk importing:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deletePath: async (pathId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete path' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting path:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteCourse: async (pathId, courseId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete course' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteTopic: async (pathId, courseId, topicId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics/${topicId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete topic' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting topic:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteLesson: async (pathId, courseId, topicId, lessonId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/learning-paths/${pathId}/courses/${courseId}/topics/${topicId}/lessons/${lessonId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete lesson' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  getSettings: async () => ({ ok: true, data: {} }),
  saveSettings: async (settings) => ({ ok: true, settings }),
  addUser: async (payload) => ({ ok: true, payload }),
  createUser: async (userData) => ({ ok: true, userData }),

  // Achievements API
  getAchievements: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/achievements`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return { ok: false, data: [] };
    }
  },
  createAchievement: async (achievementData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievementData)
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create achievement' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating achievement:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  updateAchievement: async (id, achievementData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievementData)
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to update achievement' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error updating achievement:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteAchievement: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/achievements/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete achievement' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting achievement:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  // Removed toggleAchievementStatus - achievements no longer have isActive field
  bulkImportAchievements: async (achievements) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/achievements/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievements })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to import achievements' };
      }
      return { success: true, data: result, count: result.count };
    } catch (error) {
      console.error('❌ Error bulk importing achievements:', error);
      return { success: false, error: 'Network error: ' + error.message };
    }
  },

  // Diagnostic Test Questions API
  getDiagnosticQuestions: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions`);
      if (!response.ok) {
        return { ok: false, data: [] };
      }
      const result = await response.json();
      return { ok: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching diagnostic questions:', error);
      return { ok: false, data: [] };
    }
  },
  createDiagnosticQuestion: async (questionData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to create question' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error creating question:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  updateDiagnosticQuestion: async (id, questionData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to update question' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error updating question:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  deleteDiagnosticQuestion: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to delete question' };
      }
      return { ok: true };
    } catch (error) {
      console.error('Error deleting question:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  toggleDiagnosticQuestionStatus: async (id, isActive) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) {
        const error = await response.json();
        return { ok: false, error: error.error || 'Failed to toggle question status' };
      }
      const result = await response.json();
      return { ok: true, data: result.data };
    } catch (error) {
      console.error('Error toggling question status:', error);
      return { ok: false, error: 'Network error' };
    }
  },
  bulkImportDiagnosticQuestions: async (questions) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/diagnostic-questions/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      });
      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to import questions' };
      }
      return { success: true, data: result, count: result.count };
    } catch (error) {
      console.error('Error bulk importing questions:', error);
      return { success: false, error: 'Network error: ' + error.message };
    }
  },
};

export default api;

