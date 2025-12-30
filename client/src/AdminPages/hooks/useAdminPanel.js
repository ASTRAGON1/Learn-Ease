
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function useAdminPanel() {
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
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [modLog, setModLog] = useState([]); // {id, userId, type, name, reason, at}
    const [learningPaths, setLearningPaths] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
    const [selectedInstructorId, setSelectedInstructorId] = useState(null);
    const [studentProfiles, setStudentProfiles] = useState([]); // Real student stats
    const [instructorProfiles, setInstructorProfiles] = useState([]); // Real instructor uploads

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
        students: studentProfiles.length > 0 ? studentProfiles : users
            .filter(u => u.role === "student")
            .map(u => ({
                userId: u.id,
                hours: 0,
                performance: { avgScore: 0, completionRate: 0 },
            })),
        instructors: instructorProfiles.length > 0 ? instructorProfiles : users
            .filter(u => u.role === "instructor")
            .map(u => ({
                userId: u.id,
                latestUpload: null
            })),
    }), [users, studentProfiles, instructorProfiles]);

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
                    const res = await api.listInstructorApplications();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setApplications(res.data);
                        } else {
                            setApplications([]);
                        }
                    } else {
                        setApplications([]);
                    }
                } catch (error) {
                    console.error('Error fetching applications:', error);
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
                    const res = await api.listFeedback();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setFeedback(res.data);
                        } else {
                            setFeedback([]);
                        }
                    } else {
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
                    const res = await api.listReports();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            const mappedReports = res.data.map(report => ({
                                ...report,
                                id: report._id || report.id,
                                reporterId: report.userName,
                                createdAt: report.createdAt || report.created_at
                            }));
                            setReports(mappedReports);
                        } else {
                            setReports([]);
                        }
                    } else {
                        setReports([]);
                    }
                } catch (error) {
                    console.error('Error fetching reports:', error);
                    setReports([]);
                }
            };
            fetchReports();

            // Refresh reports every 30 seconds
            const interval = setInterval(fetchReports, 30000);
            return () => clearInterval(interval);
        } else {
            // Reset when not authenticated
            setReports([]);
        }
    }, [isAuthed]);

    // Fetch users (students and teachers) on mount and when authenticated
    useEffect(() => {
        if (isAuthed) {
            const fetchUsers = async () => {
                try {
                    const res = await api.listUsers();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setUsers(res.data);
                        } else {
                            setUsers([]);
                        }
                    } else {
                        setUsers([]);
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                    setUsers([]);
                }
            };
            fetchUsers();

            // Refresh users every 30 seconds
            const interval = setInterval(fetchUsers, 30000);
            return () => clearInterval(interval);
        } else {
            setUsers([]);
        }
    }, [isAuthed]);

    // Fetch learning paths on mount and when authenticated
    useEffect(() => {
        if (isAuthed) {
            const fetchLearningPaths = async () => {
                try {
                    const res = await api.getLearningPaths();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setLearningPaths(res.data);
                        } else {
                            setLearningPaths([]);
                        }
                    } else {
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
                    const res = await api.getAchievements();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setAchievements(res.data);
                        } else {
                            setAchievements([]);
                        }
                    } else {
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
                    const res = await api.getDiagnosticQuestions();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setDiagnosticQuestions(res.data);
                        } else {
                            setDiagnosticQuestions([]);
                        }
                    } else {
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

    // Fetch student profiles on mount and when authenticated
    useEffect(() => {
        if (isAuthed) {
            const fetchStudentProfiles = async () => {
                try {
                    const res = await api.getStudentProfiles();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setStudentProfiles(res.data);
                        } else {
                            setStudentProfiles([]);
                        }
                    } else {
                        setStudentProfiles([]);
                    }
                } catch (error) {
                    console.error('Error fetching student profiles:', error);
                    setStudentProfiles([]);
                }
            };
            fetchStudentProfiles();

            // Refresh student profiles every 30 seconds
            const interval = setInterval(fetchStudentProfiles, 30000);
            return () => clearInterval(interval);
        } else {
            setStudentProfiles([]);
        }
    }, [isAuthed]);

    // Fetch instructor profiles on mount and when authenticated
    useEffect(() => {
        if (isAuthed) {
            const fetchInstructorProfiles = async () => {
                try {
                    const res = await api.getInstructorProfiles();
                    if (res.ok) {
                        if (res.data && Array.isArray(res.data)) {
                            setInstructorProfiles(res.data);
                        } else {
                            setInstructorProfiles([]);
                        }
                    } else {
                        setInstructorProfiles([]);
                    }
                } catch (error) {
                    console.error('Error fetching instructor profiles:', error);
                    setInstructorProfiles([]);
                }
            };
            fetchInstructorProfiles();

            // Refresh instructor profiles every 30 seconds
            const interval = setInterval(fetchInstructorProfiles, 30000);
            return () => clearInterval(interval);
        } else {
            setInstructorProfiles([]);
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

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "success" });
        }, 4000);
    };

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

    // State object
    const state = {
        isAuthed,
        adminName,
        section,
        sidebarCollapsed,
        loginForm,
        loginBusy,
        loginError,
        applications,
        users,
        reports,
        feedback,
        modLog,
        learningPaths,
        achievements,
        diagnosticQuestions,
        selectedInstructorId,
        studentProfiles,
        instructorProfiles,
        search,
        userSearch,
        userFilters,
        deleteConfirmModal,
        toast,
        profiles, // Memoized
    };

    // Actions object
    const actions = {
        setLoginForm,
        setLoginBusy,
        setLoginError,
        doLogin,
        setSection,
        setSidebarCollapsed,
        setSearch,
        setUserSearch,
        setUserFilters,
        setDeleteConfirmModal,
        openInstructor,
        handleSidebarEnter,
        handleSidebarLeave,
        handleLogout,
        decideApplication,
        onReopenApplication,
        toggleFeedback,
        handleSuspend,
        handleReinstate,
        handleDelete,
        confirmDelete,
        handleRenameCourse,
        handleRenameTopic,
        handleRenameLesson,
        handleCreatePath,
        handleCreateCourse,
        handleCreateTopic,
        handleCreateLesson,
        handleBulkImport,
        handleDeletePath,
        handleDeleteCourse,
        handleDeleteTopic,
        handleDeleteLesson,
        handleCreateAchievement,
        handleUpdateAchievement,
        handleDeleteAchievement,
        handleCreateDiagnosticQuestion,
        handleUpdateDiagnosticQuestion,
        handleDeleteDiagnosticQuestion,
        handleToggleDiagnosticQuestionStatus,
        latestUploadFor,
        deleteInstructorUpload
    };

    return { state, actions };
}
