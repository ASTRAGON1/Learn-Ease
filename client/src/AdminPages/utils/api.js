// API STUBS - Replace with real API calls
const api = {
  adminLogin: async (email, password) =>
    ({ ok: !!email && !!password, token: "demo", adminName: "Admin" }),
  listInstructorApplications: async () => ({ ok: true, data: [] }),
  decideApplication: async (id, decision) => ({ ok: true, id, decision }),
  listUsers: async () => ({ ok: true, data: [] }),
  suspendUser: async (id) => ({ ok: true, id }),
  reinstateUser: async (id) => ({ ok: true, id }),
  deleteUser: async (id) => ({ ok: true, id }),
  listReports: async () => ({ ok: true, data: [] }),
  listFeedback: async () => ({ ok: true, data: [] }),
  setFeedbackVisibility: async (id, visible) => ({ ok: true, id, visible }),
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

