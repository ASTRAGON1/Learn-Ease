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

// Utils
import api from "./utils/api";
import { loadLearningPathsFromCurriculum, demoApplications, demoReports, demoFeedback, demoPeople } from "./utils/constants";

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
    email: "admin@learnease.com",
    password: "admin",
  });
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Data state
  const [applications, setApplications] = useState(demoApplications);
  const [users, setUsers] = useState(demoPeople);
  const [reports, setReports] = useState(demoReports);
  const [feedback, setFeedback] = useState(demoFeedback);
  const [modLog, setModLog] = useState([]); // {id, userId, type, name, reason, at}
  const [learningPaths, setLearningPaths] = useState(() => loadLearningPathsFromCurriculum());
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);

  const [search, setSearch] = useState(""); // Global search for all components except Users
  const [userSearch, setUserSearch] = useState(""); // Separate search for Users component
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
  });

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
    if (!token) {
      setIsAuthed(false);
    }
  }, []);

  // Update localStorage when authenticated
  useEffect(() => {
    if (isAuthed) {
      localStorage.setItem("le_admin_token", "demo");
      localStorage.setItem("le_admin_name", adminName);
    }
  }, [isAuthed, adminName]);

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
    const res = await api.decideApplication(id, decision);
      if (!res.ok) {
        alert("Failed to process application");
        return;
      }
  
    if (decision === "decline") {
      const reason = prompt("Reason for decline?");
        if (reason === null) return;
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
        alert("Failed to update feedback visibility");
        return;
      }
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, visible } : f)));
    } catch (error) {
      console.error("Error toggling feedback:", error);
      alert("An error occurred while updating feedback");
    }
  }

  async function handleSuspend(id) {
    const reason = prompt("Reason for suspension?");
    if (reason === null) return;
    try {
    const res = await api.suspendUser(id, reason);
      if (!res.ok) {
        alert("Failed to suspend user");
        return;
      }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "suspended", online: false } : u))
    );
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("An error occurred while suspending the user");
    }
  }
  
  async function handleReinstate(id) {
    try {
    const res = await api.reinstateUser(id);
      if (!res.ok) {
        alert("Failed to reinstate user");
        return;
      }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
    } catch (error) {
      console.error("Error reinstating user:", error);
      alert("An error occurred while reinstating the user");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this account?")) return;
    try {
    const res = await api.deleteUser(id);
      if (!res.ok) {
        alert("Failed to delete user");
        return;
      }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user");
    }
  }

  async function handleRenameCourse(pathId, courseId, name) {
    try {
      const res = await api.renameCourse(pathId, courseId, name);
      if (!res.ok) {
        alert("Failed to rename course");
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
    } catch (error) {
      console.error("Error renaming course:", error);
      alert("An error occurred while renaming the course");
    }
  }

  async function handleRenameTopic(pathId, courseId, topicId, name) {
    try {
      const res = await api.renameTopic(pathId, courseId, topicId, name);
      if (!res.ok) {
        alert("Failed to rename topic");
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
    } catch (error) {
      console.error("Error renaming topic:", error);
      alert("An error occurred while renaming the topic");
    }
  }

  async function handleRenameLesson(pathId, courseId, topicId, lessonId, name) {
    try {
      const res = await api.renameLesson(pathId, courseId, topicId, lessonId, name);
      if (!res.ok) {
        alert("Failed to rename lesson");
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
    } catch (error) {
      console.error("Error renaming lesson:", error);
      alert("An error occurred while renaming the lesson");
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
                     : section === "settings" || section === "learning"
                     ? "Search not available in this section"
                     : "Search anything..."
                 } 
                 value={section === "users" || section === "settings" || section === "learning" ? "" : search} 
                 onChange={(e) => {
                   if (section !== "users" && section !== "settings" && section !== "learning") {
                     setSearch(e.target.value);
                   }
                 }}
                 disabled={section === "users" || section === "settings" || section === "learning"}
                 style={
                   section === "users" || section === "settings" || section === "learning"
                     ? { opacity: 0.5, cursor: "not-allowed" }
                     : {}
                 }
               />
               <button 
                 className="ld-search-btn" 
                 type="button"
                 disabled={section === "users" || section === "settings" || section === "learning"}
                 style={
                   section === "users" || section === "settings" || section === "learning"
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
    </div>
  );
}

