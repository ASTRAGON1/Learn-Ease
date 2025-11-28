// AdminPanel.jsx
import React, { useMemo, useState, useEffect } from "react";
import "./AdminPanel.css";

// Components
import AdminLogin from "./components/AdminLogin";
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

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("le_admin_token"));
  const [adminName, setAdminName] = useState(localStorage.getItem("le_admin_name") || "Admin");
  const [section, setSection] = useState("dashboard");

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
    category: "all",
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

  // Shell
  const NavButton = ({ id, label }) => (
    <button className={section === id ? "is-active" : ""} onClick={() => setSection(id)} type="button">
      {label}
    </button>
  );

  if (!isAuthed) {
    return (
      <AdminLogin
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginBusy={loginBusy}
        loginError={loginError}
        onLogin={doLogin}
      />
    );
  }

  return (
    <div className="le-wrap">
      <aside className="le-sidebar">
        <div className="le-logo">
          <div className="le-logo-badge">LE</div> LearnEase
        </div>
        <div className="le-nav">
          <NavButton id="dashboard" label="Dashboard" />
          <NavButton id="applications" label="Instructor Applications" />
          <NavButton id="reports" label="Reports" />
          <NavButton id="feedback" label="Feedback" />
          <NavButton id="users" label="Users" />
          <NavButton id="learning" label="Learning Paths" />
          <NavButton id="profiles" label="Profiles" />
          <NavButton id="settings" label="Settings" />
        </div>
      </aside>

      <main className="le-main">
        <div className="le-topbar">
          <div className="le-search">
            <input 
              placeholder={section === "users" ? "Users have their own search below" : "Search anything..."} 
              value={section === "users" ? "" : search} 
              onChange={(e) => section !== "users" && setSearch(e.target.value)}
              disabled={section === "users"}
              style={section === "users" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            />
          </div>
          <div className="le-user">
            <div className="le-avatar">{adminName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{adminName}</div>
              <div className="sub">Administrator</div>
            </div>
            <button
              className="btn ghost"
              onClick={() => {
                localStorage.removeItem("le_admin_token");
                localStorage.removeItem("le_admin_name");
                setIsAuthed(false);
                setAdminName("Admin");
                setSection("dashboard");
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>

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
            search={search}
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
        {section === "settings" && <Settings search={search} />}
        {section === "instructorProfile" && selectedInstructorId && (
          <InstructorProfile
            id={selectedInstructorId}
            users={users}
            modLog={modLog}
            onBack={() => setSection("profiles")}
            onDeleteUpload={deleteInstructorUpload}
          />
        )}
      </main>
    </div>
  );
}
