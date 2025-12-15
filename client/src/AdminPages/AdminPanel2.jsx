// AdminPanel2.jsx - New Admin Panel using Instructor Dashboard Design
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel2.css";

// Components
import AdminLogin2 from "./components/AdminLogin2";
import Dashboard from "./components/Dashboard";
import InstructorApplications from "./components/InstructorApplications";
import Reports from "./components/Reports";
import Feedback from "./components/Feedback";
import Users from "./components/Users";
import LearningPaths from "./components/LearningPaths";
import Profiles from "./components/Profiles";
import InstructorProfile from "./components/InstructorProfile";
import Settings from "./components/Settings";
import AchievementsAndTests from "./components/AchievementsAndTests";

// Utils
import api from "./utils/api";
import { demoApplications, demoReports, demoFeedback, demoPeople } from "./utils/constants";

// Icons
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";

export default function AdminPanel2() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("le_admin_token"));
  const [adminName, setAdminName] = useState(localStorage.getItem("le_admin_name") || "Admin");
  const [section, setSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Login state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Data state
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState(demoPeople);
  const [reports, setReports] = useState(demoReports);
  const [feedback, setFeedback] = useState([]);
  const [modLog, setModLog] = useState([]); // {id, userId, type, name, reason, at}
  const [learningPaths, setLearningPaths] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);

  const [search, setSearch] = useState(""); // Global search for all components except Users
  const [userSearch, setUserSearch] = useState(""); // Separate search for Users component
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
  });

  // Delete confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    userId: null,
    userName: '',
    userRole: ''
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const profiles = useMemo(() => ({
    students: users
      .filter(u => u.role === "student")
      .map(u => ({
        userId: u.id,
        hours: u.student?.hours ?? 0,
        performance: u.student?.performance ?? { avgScore: 0, completionRate: 0 },
      })),
    instructors: users
      .filter(u => u.role === "instructor")
      .map(u => ({
        userId: u.id,
        videos: u.instructor?.uploads?.videos ?? [],
        files: u.instructor?.uploads?.files ?? [],
        quizzes: u.instructor?.uploads?.quizzes ?? [],
      })),
  }), [users]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("le_admin_token");
    const name = localStorage.getItem("le_admin_name");
    if (token) {
      setIsAuthed(true);
      if (name) {
        setAdminName(name);
      }
    }
  }, []);

  // Update localStorage when authenticated
  useEffect(() => {
    if (isAuthed) {
      localStorage.setItem("le_admin_token", "admin_authenticated");
      localStorage.setItem("le_admin_name", adminName);
    }
  }, [isAuthed, adminName]);

  // Fetch applications on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchApplications = async () => {
        try {
          console.log('Fetching applications from API...');
          const res = await api.listInstructorApplications();
          console.log('Applications API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} applications:`, res.data);
              setApplications(res.data);
            } else {
              console.log('No applications data, setting empty array');
              setApplications([]);
            }
          } else {
            console.warn('Failed to fetch applications:', res);
            // Set empty array if API fails
            setApplications([]);
          }
        } catch (error) {
          console.error('Error fetching applications:', error);
          // Set empty array on error
          setApplications([]);
        }
      };
      fetchApplications();
      
      // Refresh applications every 30 seconds
      const interval = setInterval(fetchApplications, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset to empty when not authenticated
      setApplications([]);
    }
  }, [isAuthed]);

  // Fetch feedback on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchFeedback = async () => {
        try {
          console.log('Fetching feedback from API...');
          const res = await api.listFeedback();
          console.log('Feedback API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} feedback items:`, res.data);
              setFeedback(res.data);
            } else {
              console.log('No feedback data, setting empty array');
              setFeedback([]);
            }
          } else {
            console.warn('Failed to fetch feedback:', res);
            setFeedback([]);
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
          setFeedback([]);
        }
      };
      fetchFeedback();
      
      // Refresh feedback every 30 seconds
      const interval = setInterval(fetchFeedback, 30000);
      return () => clearInterval(interval);
    } else {
      setFeedback([]);
    }
  }, [isAuthed]);

  // Fetch reports on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchReports = async () => {
        try {
          console.log('Fetching reports from API...');
          const res = await api.listReports();
          console.log('Reports API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} reports:`, res.data);
              // Map reports to include reporterId for user lookup
              const mappedReports = res.data.map(report => ({
                ...report,
                id: report._id || report.id,
                reporterId: report.userName, // Use userName to find user
                createdAt: report.createdAt || report.created_at
              }));
              setReports(mappedReports);
            } else {
              console.log('No reports data, setting empty array');
              setReports([]);
            }
          } else {
            console.warn('Failed to fetch reports:', res);
            // Keep demo data if API fails
            setReports(demoReports);
          }
        } catch (error) {
          console.error('Error fetching reports:', error);
          // Keep demo data on error
          setReports(demoReports);
        }
      };
      fetchReports();
      
      // Refresh reports every 30 seconds
      const interval = setInterval(fetchReports, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset to demo data when not authenticated
      setReports(demoReports);
    }
  }, [isAuthed]);

  // Fetch users (students and teachers) on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchUsers = async () => {
        try {
          console.log('Fetching users from API...');
          const res = await api.listUsers();
          console.log('Users API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} users:`, res.data);
              setUsers(res.data);
            } else {
              console.log('No users data, setting empty array');
              setUsers([]);
            }
          } else {
            console.warn('Failed to fetch users:', res);
            setUsers(demoPeople);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          setUsers(demoPeople);
        }
      };
      fetchUsers();
      
      // Refresh users every 30 seconds
      const interval = setInterval(fetchUsers, 30000);
      return () => clearInterval(interval);
    } else {
      setUsers(demoPeople);
    }
  }, [isAuthed]);

  // Fetch learning paths on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchLearningPaths = async () => {
        try {
          console.log('Fetching learning paths from API...');
          const res = await api.getLearningPaths();
          console.log('Learning paths API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} learning paths:`, res.data);
              setLearningPaths(res.data);
            } else {
              console.log('No learning paths data, setting empty array');
              setLearningPaths([]);
            }
          } else {
            console.warn('Failed to fetch learning paths:', res);
            setLearningPaths([]);
          }
        } catch (error) {
          console.error('Error fetching learning paths:', error);
          setLearningPaths([]);
        }
      };
      fetchLearningPaths();
      
      // Refresh learning paths every 30 seconds
      const interval = setInterval(fetchLearningPaths, 30000);
      return () => clearInterval(interval);
    } else {
      setLearningPaths([]);
    }
  }, [isAuthed]);

  // Fetch achievements on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchAchievements = async () => {
        try {
          console.log('Fetching achievements from API...');
          const res = await api.getAchievements();
          console.log('Achievements API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} achievements:`, res.data);
              setAchievements(res.data);
            } else {
              console.log('No achievements data, setting empty array');
              setAchievements([]);
            }
          } else {
            console.warn('Failed to fetch achievements:', res);
            setAchievements([]);
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
          setAchievements([]);
        }
      };
      fetchAchievements();
      
      // Refresh achievements every 30 seconds
      const interval = setInterval(fetchAchievements, 30000);
      return () => clearInterval(interval);
    } else {
      setAchievements([]);
    }
  }, [isAuthed]);

  // Fetch diagnostic questions on mount and when authenticated
  useEffect(() => {
    if (isAuthed) {
      const fetchDiagnosticQuestions = async () => {
        try {
          console.log('Fetching diagnostic questions from API...');
          const res = await api.getDiagnosticQuestions();
          console.log('Diagnostic questions API response:', res);
          if (res.ok) {
            if (res.data && Array.isArray(res.data)) {
              console.log(`Setting ${res.data.length} diagnostic questions:`, res.data);
              setDiagnosticQuestions(res.data);
            } else {
              console.log('No diagnostic questions data, setting empty array');
              setDiagnosticQuestions([]);
            }
          } else {
            console.warn('Failed to fetch diagnostic questions:', res);
            setDiagnosticQuestions([]);
          }
        } catch (error) {
          console.error('Error fetching diagnostic questions:', error);
          setDiagnosticQuestions([]);
        }
      };
      fetchDiagnosticQuestions();
      
      // Refresh diagnostic questions every 30 seconds
      const interval = setInterval(fetchDiagnosticQuestions, 30000);
      return () => clearInterval(interval);
    } else {
      setDiagnosticQuestions([]);
    }
  }, [isAuthed]);

  // Helper functions
  function latestUploadFor(userId) {
    try {
      const u = users.find(x => x.id === userId);
      const up = u?.instructor?.uploads;
      if (!up) return "—";
      const lastVideo = up.videos && Array.isArray(up.videos) && up.videos.length ? up.videos[up.videos.length - 1] : undefined;
      const lastFile = up.files && Array.isArray(up.files) && up.files.length ? up.files[up.files.length - 1] : undefined;
      return lastVideo || lastFile || "—";
    } catch (error) {
      console.error("Error getting latest upload:", error);
      return "—";
    }
  }

  function deleteInstructorUpload(userId, type, idx, reason) {
    try {
      let removedName = "";

      setUsers(prev =>
        prev.map(u => {
          if (u.id !== userId) return u;

          const prevInf = u.instructor || { uploads: { videos: [], files: [], quizzes: [] } };
          const prevUploads = prevInf.uploads || { videos: [], files: [], quizzes: [] };
          const arr = Array.isArray(prevUploads[type]) ? [...prevUploads[type]] : [];
          if (idx < 0 || idx >= arr.length) return u;

          const removed = arr.splice(idx, 1)[0];
          removedName = String(removed ?? "");

          return {
            ...u,
            instructor: {
              ...prevInf,
              uploads: { ...prevUploads, [type]: arr },
            },
          };
        })
      );

      setModLog(prev => [
        {
          id: `ml-${Date.now()}`,
          userId,
          type,
          name: removedName,
          reason: reason || "",
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error deleting instructor upload:", error);
      alert("An error occurred while deleting the upload");
    }
  }

  // API handlers
  async function doLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginBusy(true);
    try {
      const res = await api.adminLogin(loginForm.email, loginForm.password);
      if (!res?.ok) { setLoginError("Invalid credentials"); return; }
      setAdminName(res.adminName || "Admin");
      setIsAuthed(true);
      setSection("dashboard");
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoginBusy(false);
    }
  }

  async function decideApplication(id, decision) {
    try {
      // For decline, get reason first
      let reason = '';
      if (decision === "decline") {
        reason = prompt("Reason for decline?");
        if (reason === null) return;
      }

      const res = await api.decideApplication(id, decision, reason);
      if (!res.ok) {
        alert(res.error || "Failed to process application");
        return;
      }
  
      // Update local state
      if (decision === "decline") {
        setApplications(prev =>
          prev.map(a =>
            a.id === id ? {
              ...a,
              status: "declined",
              declinedReason: reason,
              declinedAt: new Date().toISOString().slice(0, 10)
            } : a
          )
        );
        alert("Application declined.");
        return;
      }
  
      // If accepted, update status
      setApplications(prev =>
        prev.map(a => (a.id === id ? { ...a, status: "accepted" } : a))
      );
  
      const app = applications.find(a => a.id === id);
      if (!app) return;
      if (users.some(u => u.name === app.name && u.role === "instructor")) return;
  
      const defaultSkills =
        app.category === "Autism"
          ? ["Autism", "ABA", "Speech Therapy"]
          : ["Down Syndrome", "Early Intervention"];
  
      const newUser = {
        id: `u-${Date.now()}`,
        name: app.name,
        role: "instructor",
        category: app.category,
        online: false,
        status: "active",
        joinedAt: new Date().toISOString().slice(0, 10),
        headline: "",
        location: "",
        bio: app.description || "",
        description: app.description || "",
        instructor: {
          uploads: { videos: [], files: [], quizzes: [] },
          cvUrl: app.cvUrl || "",
          likes: 0,
          followers: 0,
          rating: 0,
          skills: defaultSkills,
          contactEmail: app.email || "",
        },
      };
  
      setUsers(prev => [newUser, ...prev]);
      alert("Application accepted. Instructor can now upload content and generate quizzes.");
    } catch (error) {
      console.error("Error processing application:", error);
      alert("An error occurred while processing the application");
    }
  }

  function onReopenApplication(id) {
    setApplications(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: "pending", declinedReason: undefined, declinedAt: undefined }
          : a
      )
    );
  }

  async function toggleFeedback(id, visible) {
    try {
      const res = await api.setFeedbackVisibility(id, visible);
      if (!res.ok) {
        alert(res.error || "Failed to update feedback visibility");
        return;
      }
      // Update both show and visible for backward compatibility
      setFeedback((prev) => prev.map((f) => 
        (f.id === id || f._id === id) ? { ...f, show: visible, visible } : f
      ));
    } catch (error) {
      console.error("Error toggling feedback:", error);
      alert("An error occurred while updating feedback");
    }
  }

  async function handleSuspend(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
      showToast("User not found", "error");
      return;
    }
    
    const reason = prompt("Reason for suspension?");
    if (reason === null) return;
    
    try {
      const res = await api.suspendUser(id, user.role);
      if (!res.ok) {
        showToast(res.error || "Failed to suspend user", "error");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "suspended", online: false } : u))
      );
      showToast("User suspended successfully", "success");
    } catch (error) {
      console.error("Error suspending user:", error);
      showToast("An error occurred while suspending the user", "error");
    }
  }
  
  async function handleReinstate(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
      showToast("User not found", "error");
      return;
    }
    
    try {
      const res = await api.reinstateUser(id, user.role);
      if (!res.ok) {
        showToast(res.error || "Failed to reinstate user", "error");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
      showToast("User reinstated successfully", "success");
    } catch (error) {
      console.error("Error reinstating user:", error);
      showToast("An error occurred while reinstating the user", "error");
    }
  }

  // Show toast notification helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  async function handleDelete(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
      showToast("User not found", "error");
      return;
    }
    
    // Show confirmation modal
    setDeleteConfirmModal({
      show: true,
      userId: id,
      userName: user.name || 'Unknown',
      userRole: user.role
    });
  }

  async function confirmDelete() {
    const { userId, userRole } = deleteConfirmModal;
    
    // Close modal
    setDeleteConfirmModal({ show: false, userId: null, userName: '', userRole: '' });
    
    try {
      const res = await api.deleteUser(userId, userRole);
      if (!res.ok) {
        showToast(res.error || "Failed to delete user", "error");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(res.message || "User deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("An error occurred while deleting the user", "error");
    }
  }

  async function handleRenameCourse(pathId, courseId, name) {
    try {
      const res = await api.renameCourse(pathId, courseId, name);
      if (!res.ok) {
        alert(res.error || "Failed to rename course");
        return;
      }
      setLearningPaths((prev) =>
        prev.map((p) =>
          p.id === pathId
            ? {
                ...p,
                courses: p.courses.map((c) => (c.id === courseId ? { ...c, name } : c)),
              }
            : p
        )
      );
      showToast("Course renamed successfully", "success");
    } catch (error) {
      console.error("Error renaming course:", error);
      showToast("An error occurred while renaming the course", "error");
    }
  }

  async function handleRenameTopic(pathId, courseId, topicId, name) {
    try {
      const res = await api.renameTopic(pathId, courseId, topicId, name);
      if (!res.ok) {
        alert(res.error || "Failed to rename topic");
        return;
      }
      setLearningPaths((prev) =>
        prev.map((p) =>
          p.id === pathId
            ? {
                ...p,
                courses: p.courses.map((c) =>
                  c.id === courseId
                    ? {
                        ...c,
                        topics: c.topics.map((t) => (t.id === topicId ? { ...t, name } : t)),
                      }
                    : c
                ),
              }
            : p
        )
      );
      showToast("Topic renamed successfully", "success");
    } catch (error) {
      console.error("Error renaming topic:", error);
      showToast("An error occurred while renaming the topic", "error");
    }
  }

  async function handleRenameLesson(pathId, courseId, topicId, lessonId, name) {
    try {
      const res = await api.renameLesson(pathId, courseId, topicId, lessonId, name);
      if (!res.ok) {
        alert(res.error || "Failed to rename lesson");
        return;
      }
      setLearningPaths((prev) =>
        prev.map((p) =>
          p.id === pathId
            ? {
                ...p,
                courses: p.courses.map((c) =>
                  c.id === courseId
                    ? {
                        ...c,
                        topics: c.topics.map((t) =>
                          t.id === topicId
                            ? {
                                ...t,
                                lessons: t.lessons.map((l) =>
                                  l.id === lessonId ? { ...l, name } : l
                                ),
                              }
                            : t
                        ),
                      }
                    : c
                ),
              }
            : p
        )
      );
      showToast("Lesson renamed successfully", "success");
    } catch (error) {
      console.error("Error renaming lesson:", error);
      showToast("An error occurred while renaming the lesson", "error");
    }
  }

  async function handleCreatePath(name, type) {
    try {
      const res = await api.createPath(name, type);
      if (!res.ok) {
        showToast(res.error || "Failed to create path", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Path created successfully", "success");
    } catch (error) {
      console.error("Error creating path:", error);
      showToast("An error occurred while creating the path", "error");
    }
  }

  async function handleCreateCourse(pathId, name) {
    try {
      const res = await api.createCourse(pathId, name);
      if (!res.ok) {
        showToast(res.error || "Failed to create course", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Course created successfully", "success");
    } catch (error) {
      console.error("Error creating course:", error);
      showToast("An error occurred while creating the course", "error");
    }
  }

  async function handleCreateTopic(pathId, courseId, name) {
    try {
      const res = await api.createTopic(pathId, courseId, name);
      if (!res.ok) {
        showToast(res.error || "Failed to create topic", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Topic created successfully", "success");
    } catch (error) {
      console.error("Error creating topic:", error);
      showToast("An error occurred while creating the topic", "error");
    }
  }

  async function handleCreateLesson(pathId, courseId, topicId, name) {
    try {
      const res = await api.createLesson(pathId, courseId, topicId, name);
      if (!res.ok) {
        showToast(res.error || "Failed to create lesson", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Lesson created successfully", "success");
    } catch (error) {
      console.error("Error creating lesson:", error);
      showToast("An error occurred while creating the lesson", "error");
    }
  }

  async function handleBulkImport(data) {
    try {
      const res = await api.bulkImportLearningPaths(data);
      if (!res.ok) {
        showToast(res.error || "Failed to import data", "error");
        return { success: false, error: res.error };
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Bulk import completed successfully", "success");
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Error bulk importing:", error);
      showToast("An error occurred during bulk import", "error");
      return { success: false, error: error.message };
    }
  }

  async function handleDeletePath(pathId) {
    try {
      const res = await api.deletePath(pathId);
      if (!res.ok) {
        showToast(res.error || "Failed to delete path", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Path deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting path:", error);
      showToast("An error occurred while deleting the path", "error");
    }
  }

  async function handleDeleteCourse(pathId, courseId) {
    try {
      const res = await api.deleteCourse(pathId, courseId);
      if (!res.ok) {
        showToast(res.error || "Failed to delete course", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Course deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting course:", error);
      showToast("An error occurred while deleting the course", "error");
    }
  }

  async function handleDeleteTopic(pathId, courseId, topicId) {
    try {
      const res = await api.deleteTopic(pathId, courseId, topicId);
      if (!res.ok) {
        showToast(res.error || "Failed to delete topic", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Topic deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting topic:", error);
      showToast("An error occurred while deleting the topic", "error");
    }
  }

  async function handleDeleteLesson(pathId, courseId, topicId, lessonId) {
    try {
      const res = await api.deleteLesson(pathId, courseId, topicId, lessonId);
      if (!res.ok) {
        showToast(res.error || "Failed to delete lesson", "error");
        return;
      }
      // Refresh learning paths
      const fetchRes = await api.getLearningPaths();
      if (fetchRes.ok) {
        setLearningPaths(fetchRes.data || []);
      }
      showToast("Lesson deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      showToast("An error occurred while deleting the lesson", "error");
    }
  }
  
  async function handleCreateAchievement(achievementData) {
    try {
      const res = await api.createAchievement(achievementData);
      if (!res.ok) {
        showToast(res.error || "Failed to create achievement", "error");
        return;
      }
      // Refresh achievements
      const fetchRes = await api.getAchievements();
      if (fetchRes.ok) {
        setAchievements(fetchRes.data || []);
      }
      showToast("Achievement created successfully", "success");
    } catch (error) {
      console.error("Error creating achievement:", error);
      showToast("An error occurred while creating the achievement", "error");
    }
  }

  async function handleUpdateAchievement(id, achievementData) {
    try {
      const res = await api.updateAchievement(id, achievementData);
      if (!res.ok) {
        showToast(res.error || "Failed to update achievement", "error");
        return;
      }
      // Refresh achievements
      const fetchRes = await api.getAchievements();
      if (fetchRes.ok) {
        setAchievements(fetchRes.data || []);
      }
      showToast("Achievement updated successfully", "success");
    } catch (error) {
      console.error("Error updating achievement:", error);
      showToast("An error occurred while updating the achievement", "error");
    }
  }

  async function handleDeleteAchievement(id) {
    try {
      const res = await api.deleteAchievement(id);
      if (!res.ok) {
        showToast(res.error || "Failed to delete achievement", "error");
        return;
      }
      setAchievements((prev) => prev.filter((a) => (a._id || a.id) !== id));
      showToast("Achievement deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      showToast("An error occurred while deleting the achievement", "error");
    }
  }

  // Removed handleToggleAchievementStatus - achievements no longer have isActive status

  
  // Diagnostic Questions Handlers
  async function handleCreateDiagnosticQuestion(questionData) {
    try {
      const res = await api.createDiagnosticQuestion(questionData);
      if (!res.ok) {
        showToast(res.error || "Failed to create question", "error");
        return;
      }
      // Refresh questions
      const fetchRes = await api.getDiagnosticQuestions();
      if (fetchRes.ok) {
        setDiagnosticQuestions(fetchRes.data || []);
      }
      showToast("Question created successfully", "success");
    } catch (error) {
      console.error("Error creating question:", error);
      showToast("An error occurred while creating the question", "error");
    }
  }

  async function handleUpdateDiagnosticQuestion(id, questionData) {
    try {
      const res = await api.updateDiagnosticQuestion(id, questionData);
      if (!res.ok) {
        showToast(res.error || "Failed to update question", "error");
        return;
      }
      // Refresh questions
      const fetchRes = await api.getDiagnosticQuestions();
      if (fetchRes.ok) {
        setDiagnosticQuestions(fetchRes.data || []);
      }
      showToast("Question updated successfully", "success");
    } catch (error) {
      console.error("Error updating question:", error);
      showToast("An error occurred while updating the question", "error");
    }
  }

  async function handleDeleteDiagnosticQuestion(id) {
    try {
      const res = await api.deleteDiagnosticQuestion(id);
      if (!res.ok) {
        showToast(res.error || "Failed to delete question", "error");
        return;
      }
      setDiagnosticQuestions((prev) => prev.filter((q) => (q._id || q.id) !== id));
      showToast("Question deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting question:", error);
      showToast("An error occurred while deleting the question", "error");
    }
  }

  async function handleToggleDiagnosticQuestionStatus(id, isActive) {
    try {
      const res = await api.toggleDiagnosticQuestionStatus(id, isActive);
      if (!res.ok) {
        showToast(res.error || "Failed to toggle question status", "error");
        return;
      }
      setDiagnosticQuestions((prev) =>
        prev.map((q) => ((q._id || q.id) === id ? { ...q, isActive } : q))
      );
      showToast(`Question ${isActive ? 'enabled' : 'disabled'} successfully`, "success");
    } catch (error) {
      console.error("Error toggling question status:", error);
      showToast("An error occurred while toggling question status", "error");
    }
  }

  
  function openInstructor(id) {
    setSelectedInstructorId(id);
    setSection("instructorProfile");
  }

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  const handleLogout = () => {
    // Clear all admin-related data
    localStorage.removeItem("le_admin_token");
    localStorage.removeItem("le_admin_name");
    setIsAuthed(false);
    setAdminName("Admin");
    setSection("dashboard");
    // Force navigation to ensure login page is shown
    navigate("/admin", { replace: true });
  };

  // Sidebar items
  const sidebarItems = [
    { 
      key: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      onClick: () => setSection("dashboard")
    },
    { 
      key: "applications", 
      label: "Applications", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      onClick: () => setSection("applications")
    },
    { 
      key: "reports", 
      label: "Reports", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      ),
      onClick: () => setSection("reports")
    },
    { 
      key: "feedback", 
      label: "Feedback", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      onClick: () => setSection("feedback")
    },
    { 
      key: "users", 
      label: "Users", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      onClick: () => setSection("users")
    },
    { 
      key: "learning", 
      label: "Learning Paths", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      onClick: () => setSection("learning")
    },
    { 
      key: "achievements-tests", 
      label: "Achievements & Tests", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      ),
      onClick: () => setSection("achievements-tests")
    },
    { 
      key: "profiles", 
      label: "Profiles", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      onClick: () => setSection("profiles")
    },
    { 
      key: "settings", 
      label: "Settings", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
        </svg>
      ),
      onClick: () => setSection("settings")
    },
  ];

  if (!isAuthed) {
    return (
      <AdminLogin2
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginBusy={loginBusy}
        loginError={loginError}
        onLogin={doLogin}
      />
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar with Hover Animation */}
      <aside 
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          {/* Logo */}
          <div className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase Admin"
            />
          </div>

          {/* Navigation Items */}
          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={section === item.key ? "active" : ""}>
                <button onClick={item.onClick} className="ld-sidebar-link">
                  <span className="ld-sidebar-icon-wrapper">
                    {item.icon}
                  </span>
                  <span className="ld-sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="ld-sidebar-footer">
            <button 
              className="ld-sidebar-link ld-sidebar-logout"
              onClick={handleLogout}
            >
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Top Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <h1 className="ld-welcome">
              Admin <span className="ld-brand">Dashboard</span>
            </h1>
          </div>
           <div className="ld-header-center">
             <div className="ld-search-container">
               <input 
                 className="ld-search-input"
                 type="text"
                 placeholder={
                   section === "users" 
                     ? "Users have their own search below" 
                     : section === "settings" || section === "learning" || section === "achievements-tests"
                     ? "Search not available in this section"
                     : "Search anything..."
                 } 
                value={section === "users" || section === "settings" || section === "learning" || section === "achievements-tests" ? "" : search} 
                onChange={(e) => {
                  if (section !== "users" && section !== "settings" && section !== "learning" && section !== "achievements-tests") {
                    setSearch(e.target.value);
                  }
                }}
                disabled={section === "users" || section === "settings" || section === "learning" || section === "achievements-tests"}
                style={
                  section === "users" || section === "settings" || section === "learning" || section === "achievements-tests"
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
               />
               <button 
                className="ld-search-btn" 
                type="button"
                disabled={section === "users" || section === "settings" || section === "learning" || section === "achievements-tests"}
                style={
                  section === "users" || section === "settings" || section === "learning" || section === "achievements-tests"
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <circle cx="11" cy="11" r="8"></circle>
                   <path d="m21 21-4.35-4.35"></path>
                 </svg>
               </button>
             </div>
           </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button className="ld-profile-trigger">
                <div className="ld-profile-avatar-wrapper">
                  <div className="ld-profile-avatar">{adminName.slice(0, 2).toUpperCase()}</div>
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{adminName}</div>
                  <div className="ld-profile-email">Administrator</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ld-content">
          {section === "dashboard" && (
            <Dashboard 
              users={users} 
              profiles={profiles} 
              onReinstate={handleReinstate} 
              search={search} 
              onOpenInstructor={openInstructor}
              applications={applications}
              reports={reports}
              feedbacks={feedback}
              onNavigate={setSection}
            />
          )}
          {section === "applications" && (
            <InstructorApplications
              applications={applications}
              users={users}
              search={search}
              onDecideApplication={decideApplication}
              onReopenApplication={onReopenApplication}
              onOpenInstructor={openInstructor}
            />
          )}
          {section === "reports" && <Reports reports={reports} users={users} search={search} onOpenInstructor={openInstructor} />}
          {section === "feedback" && (
            <Feedback
              feedback={feedback}
              users={users}
              search={search}
              onToggleVisibility={toggleFeedback}
              onOpenInstructor={openInstructor}
            />
          )}
          {section === "users" && (
            <Users
              users={users}
              search={userSearch}
              userFilters={userFilters}
              onSearchChange={setUserSearch}
              onFilterChange={setUserFilters}
              onSuspend={handleSuspend}
              onReinstate={handleReinstate}
              onDelete={handleDelete}
            />
          )}
          {section === "learning" && (
            <LearningPaths
              learningPaths={learningPaths}
              onRenameCourse={handleRenameCourse}
              onRenameTopic={handleRenameTopic}
              onRenameLesson={handleRenameLesson}
              onCreatePath={handleCreatePath}
              onCreateCourse={handleCreateCourse}
              onCreateTopic={handleCreateTopic}
              onCreateLesson={handleCreateLesson}
              onBulkImport={handleBulkImport}
              onDeletePath={handleDeletePath}
              onDeleteCourse={handleDeleteCourse}
              onDeleteTopic={handleDeleteTopic}
              onDeleteLesson={handleDeleteLesson}
            />
          )}
          {section === "achievements-tests" && (
            <AchievementsAndTests
              achievements={achievements}
              onCreateAchievement={handleCreateAchievement}
              onUpdateAchievement={handleUpdateAchievement}
              onDeleteAchievement={handleDeleteAchievement}
              diagnosticQuestions={diagnosticQuestions}
              onCreateQuestion={handleCreateDiagnosticQuestion}
              onUpdateQuestion={handleUpdateDiagnosticQuestion}
              onDeleteQuestion={handleDeleteDiagnosticQuestion}
              onToggleQuestionStatus={handleToggleDiagnosticQuestionStatus}
            />
          )}
          {section === "profiles" && (
            <Profiles
              profiles={profiles}
              users={users}
              search={search}
              onOpenInstructor={openInstructor}
              latestUploadFor={latestUploadFor}
            />
          )}
          {section === "settings" && <Settings />}
          {section === "instructorProfile" && selectedInstructorId && (
            <InstructorProfile
              id={selectedInstructorId}
              users={users}
              modLog={modLog}
              onBack={() => setSection("profiles")}
              onDeleteUpload={deleteInstructorUpload}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirmModal({ show: false, userId: null, userName: '', userRole: '' })}>
          <div className="admin-modal-content admin-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-warning">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="admin-modal-title">Delete User Account?</h3>
            <p className="admin-modal-message">
              Are you sure you want to permanently delete <strong>{deleteConfirmModal.userName}</strong>'s {deleteConfirmModal.userRole === 'instructor' ? 'teacher' : 'student'} account? This action cannot be undone and all data will be lost.
            </p>
            
            <div className="admin-modal-actions">
              <button 
                className="admin-modal-btn admin-modal-btn-secondary" 
                onClick={() => setDeleteConfirmModal({ show: false, userId: null, userName: '', userRole: '' })}
              >
                Cancel
              </button>
              <button 
                className="admin-modal-btn admin-modal-btn-danger" 
                onClick={confirmDelete}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <div className="admin-toast-content">
            {toast.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span className="admin-toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

