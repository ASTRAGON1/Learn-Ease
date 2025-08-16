// AdminPanel.jsx
import React, { useMemo, useState } from "react";
import RainfallChart from "../components/RainfallChartAdmin";
import "./AdminPanel.css";

// ---- Demo Generators ----
function generateLearningPath(name) {
  const topics = Array.from({ length: 8 }).map((_, ti) => ({
    id: `${name}-t${ti + 1}`,
    name: `Topic ${ti + 1}`,
    courses: Array.from({ length: 5 }).map((__, ci) => ({
      id: `${name}-t${ti + 1}-c${ci + 1}`,
      name: `Course ${ci + 1}`,
      lessons: Array.from({ length: 10 }).map((___, li) => ({
        id: `${name}-t${ti + 1}-c${ci + 1}-l${li + 1}`,
        name: `Lesson ${li + 1}`,
      })),
    })),
  }));
  return { id: name.toLowerCase().replace(/\s+/g, "-"), name, topics };
}

const demoEngagement = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i)); // oldest → newest
  return {
    day: d.toLocaleDateString(undefined, { weekday: "short" }),
    value: Math.round(100 + Math.sin(i / 2) * 40 + Math.random() * 30),
  };
});

const demoApplications = [
  {
    id: "app-1",
    name: "Amina Yılmaz",
    email: "amina@le.com",
    category: "Autism",
    submittedAt: "2025-08-01",
    cvUrl: "#",
    description: "8 years experience in special education.",
    status: "pending",
  },
  {
    id: "app-2",
    name: "Omar Hanieh",
    email: "omar@le.com",
    category: "Down Syndrome",
    submittedAt: "2025-08-10",
    cvUrl: "#",
    description: "Speech therapy background.",
    status: "pending",
  },
];

const demoUsers = [
  {
    id: "u1",
    name: "Lina Ahmed",
    role: "student",
    category: "Autism",
    online: true,
    status: "active",
    joinedAt: "2025-06-10",
  },
  {
    id: "u2",
    name: "Mehmet Ali",
    role: "student",
    category: "Down Syndrome",
    online: false,
    status: "active",
    joinedAt: "2025-06-18",
  },
  {
    id: "u3",
    name: "Sara Noor",
    role: "instructor",
    category: "Autism",
    online: false,
    status: "active",
    joinedAt: "2025-05-02",
  },
  {
    id: "u4",
    name: "Yusuf Can",
    role: "instructor",
    category: "Down Syndrome",
    online: true,
    status: "suspended",
    joinedAt: "2025-04-11",
  },
  {
    id: "u5",
    name: "Layla Karim",
    role: "student",
    category: "Autism",
    online: true,
    status: "active",
    joinedAt: "2025-07-20",
  },
];

const demoReports = [
  {
    id: "r1",
    type: "abuse",
    fromRole: "student",
    category: "Autism",
    description: "Inappropriate message in chat",
    createdAt: "2025-08-09",
  },
  {
    id: "r2",
    type: "content",
    fromRole: "instructor",
    category: "Down Syndrome",
    description: "Video encoding issue",
    createdAt: "2025-08-08",
  },
];

const demoFeedback = [
  {
    id: "f1",
    fromRole: "student",
    category: "Autism",
    description: "Loving the new dashboard!",
    visible: false,
  },
  {
    id: "f2",
    fromRole: "instructor",
    category: "Down Syndrome",
    description: "Please add bulk upload for quizzes.",
    visible: false,
  },
];

const demoProfiles = {
  students: [
    { userId: "u1", hours: 42, performance: { avgScore: 86, completionRate: 0.72 } },
    { userId: "u5", hours: 18, performance: { avgScore: 74, completionRate: 0.4 } },
  ],
  instructors: [
    {
      userId: "u3",
      videos: ["Autism Basics.mp4", "Advanced Strategies.mp4"],
      files: ["guide.pdf"],
      quizzes: ["Quiz 1", "Quiz 2"],
    },
    {
      userId: "u4",
      videos: ["Speech Warmups.mp4"],
      files: ["speech-exercises.pdf"],
      quizzes: ["Assessment A"],
    },
  ],
};

// ---- Minimal SVG Line Chart (no external deps) ----
function LineChart({ data, color = "var(--primary)" }) {
  
}


// ---- Reusable tiny components ----
function StatCard({ title, value, hint }) {
  return (
    <div className="card kpi">
      <div>
        <h3>{title}</h3>
        <h2>{value}</h2>
        {hint && <div className="sub">{hint}</div>}
      </div>
      <span className="badge">{new Date().toLocaleDateString()}</span>
    </div>
  );
}

function Table({ columns, rows, keyField = "id" }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((c) => (
                <td key={c.key}>
                  {typeof c.render === "function"
                    ? c.render(row[c.key], row)
                    : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- API STUBS ----
const api = {
  adminLogin: async () => ({ ok: true, token: "demo", adminName: "Admin" }),
  listInstructorApplications: async () => ({ ok: true, data: demoApplications }),
  decideApplication: async (id, decision) => ({ ok: true, id, decision }),
  listUsers: async () => ({ ok: true, data: demoUsers }),
  suspendUser: async (id) => ({ ok: true, id }),
  reinstateUser: async (id) => ({ ok: true, id }),
  deleteUser: async (id) => ({ ok: true, id }),
  listReports: async () => ({ ok: true, data: demoReports }),
  listFeedback: async () => ({ ok: true, data: demoFeedback }),
  setFeedbackVisibility: async (id, visible) => ({ ok: true, id, visible }),
  getLearningPaths: async () => ({
    ok: true,
    data: [generateLearningPath("Autism"), generateLearningPath("Down Syndrome")],
  }),
  renameTopic: async () => ({ ok: true }),
  renameLesson: async () => ({ ok: true }),
  getSettings: async () => ({ ok: true, data: {} }),
  saveSettings: async (settings) => ({ ok: true, settings }),
  addUser: async (payload) => ({ ok: true, payload }),
  getProfiles: async () => ({ ok: true, data: demoProfiles }),
};

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(true); // keep demo signed-in
  const [adminName, setAdminName] = useState("Admin");
  const [section, setSection] = useState("dashboard");

  // Data state
  const [applications, setApplications] = useState(demoApplications);
  const [users, setUsers] = useState(demoUsers);
  const [reports, setReports] = useState(demoReports);
  const [feedback, setFeedback] = useState(demoFeedback);
  const [learningPaths, setLearningPaths] = useState([
    generateLearningPath("Autism"),
    generateLearningPath("Down Syndrome"),
  ]);
  const [profiles] = useState(demoProfiles);

  const [search, setSearch] = useState("");
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
    category: "all",
  });

  // Dashboard stats
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalInstructors = users.filter((u) => u.role === "instructor").length;
  const onlineUsers = users.filter((u) => u.online && u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended");
  const byCat = useMemo(
    () => ({
      autism: users.filter(u => u.role === "student" && u.category === "Autism").length,
      down: users.filter(u => u.role === "student" && u.category === "Down Syndrome").length,
    }),
    [users]
  );
  

  async function decideApplication(id, decision) {
    const res = await api.decideApplication(id, decision);
    if (!res.ok) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: decision } : a))
    );
    if (decision === "accept") {
      const app = applications.find((a) => a.id === id);
      const newUser = {
        id: `u-${Date.now()}`,
        name: app.name,
        role: "instructor",
        category: app.category,
        online: false,
        status: "active",
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
  }

  async function toggleFeedback(id, visible) {
    const res = await api.setFeedbackVisibility(id, visible);
    if (!res.ok) return;
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, visible } : f)));
  }

  async function handleSuspend(id) {
    const reason = prompt("Reason for suspension?");
    if (reason === null) return;
    const res = await api.suspendUser(id, reason);
    if (!res.ok) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "suspended", online: false } : u))
    );
  }

  async function handleReinstate(id) {
    const res = await api.reinstateUser(id);
    if (!res.ok) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
  }

  async function handleDelete(id) {
    if (!confirm("Delete this account?")) return;
    const res = await api.deleteUser(id);
    if (!res.ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleRenameTopic(pathId, topicId, name) {
    const res = await api.renameTopic(pathId, topicId, name);
    if (!res.ok) return;
    setLearningPaths((prev) =>
      prev.map((p) =>
        p.id === pathId
          ? {
              ...p,
              topics: p.topics.map((t) => (t.id === topicId ? { ...t, name } : t)),
            }
          : p
      )
    );
  }

  async function handleRenameLesson(pathId, topicId, courseId, lessonId, name) {
    const res = await api.renameLesson(pathId, topicId, courseId, lessonId, name);
    if (!res.ok) return;
    setLearningPaths((prev) =>
      prev.map((p) =>
        p.id === pathId
          ? {
              ...p,
              topics: p.topics.map((t) =>
                t.id === topicId
                  ? {
                      ...t,
                      courses: t.courses.map((c) =>
                        c.id === courseId
                          ? {
                              ...c,
                              lessons: c.lessons.map((l) =>
                                l.id === lessonId ? { ...l, name } : l
                              ),
                            }
                          : c
                      ),
                    }
                  : t
              ),
            }
          : p
      )
    );
  }

  function filteredUsers() {
    return users.filter(
      (u) =>
        (userFilters.role === "all" || u.role === userFilters.role) &&
        (userFilters.status === "all" || u.status === userFilters.status) &&
        (userFilters.category === "all" || u.category === userFilters.category) &&
        (!search || u.name.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // --- Section UIs ---
  function Dashboard() {
    const studentsTotal = useMemo(
      () => (profiles.students || []).reduce((s, p) => s + (p.hours || 0), 0),
      [profiles]
    );
    
    const instructorsTotal = useMemo(
      () =>
        (profiles.instructors || []).reduce(
          (s, i) =>
            s +
            (i.videos?.length || 0) +
            (i.files?.length || 0) +
            (i.quizzes?.length || 0),
          0
        ),
      [profiles]
    );
    return (
      <div className="le-content">
        <div className="section-title">
          <div>
            <h2>Overview</h2>
            <div className="sub">Quick KPIs across your platform.</div>
          </div>
        </div>
        <div className="le-grid-3">
          <StatCard title="Total Users" value={totalUsers} hint={`${onlineUsers} online now`} />
          <StatCard title="Students" value={`${totalStudents} (${byCat.autism} Autism / ${byCat.down} Down)`} />
          <StatCard title="Instructors" value={totalInstructors} />
        </div>
        <div className="card">
          <div className="section-title">
            <h2>Total Engagement</h2>
          </div>
          <RainfallChart
            studentsTotal={studentsTotal}
            instructorsTotal={instructorsTotal}
          />
        </div>
        <div className="le-grid-2">
          <div className="card">
            <h3>Online Users</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.online && u.status === "active")
                  .map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td>{u.category}</td>
                      <td>
                        <span className="badge green dot">Online</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>Suspended Users</h3>
            <div className="sub" style={{ marginBottom: 8 }}>
              {suspendedUsers.length} total
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {suspendedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="sub">No suspended users</td>
                  </tr>
                ) : (
                  suspendedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td>{u.category}</td>
                      <td className="action-cell">
                        <button
                          className="btn small success"
                          onClick={() => handleReinstate(u.id)}
                          type="button"
                        >
                          Reinstate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
  }

  function InstructorApplications() {
    const cols = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "category", label: "Category" },
      { key: "submittedAt", label: "Submitted" },
      { key: "cvUrl", label: "CV", render: (v) => <a href={v} target="_blank" rel="noreferrer">View</a> },
      { key: "description", label: "About" },
      {
        key: "status",
        label: "Status",
        render: (v) => (v === "pending" ? <span className="badge purple dot">Pending</span> : v),
      },
    ];
    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Instructor Applications</h2>
        </div>
        <Table
          columns={[
            ...cols,
            {
              key: "actions",
              label: "Actions",
              render: (_, row) => (
                <div className="row">
                  <button className="btn small success" onClick={() => decideApplication(row.id, "accept")} type="button">
                    Accept
                  </button>
                  <button className="btn small danger" onClick={() => decideApplication(row.id, "decline")} type="button">
                    Decline
                  </button>
                </div>
              ),
            },
          ]}
          rows={applications}
        />
      </div>
    );
  }

  function Reports() {
    const cols = [
      { key: "id", label: "ID" },
      { key: "type", label: "Type" },
      { key: "fromRole", label: "From" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description" },
      { key: "createdAt", label: "Date" },
    ];
    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Reports</h2>
        </div>
        <Table columns={cols} rows={reports} />
      </div>
    );
  }

  function Feedback() {
    const cols = [
      { key: "id", label: "ID" },
      { key: "fromRole", label: "From" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description" },
      {
        key: "visible",
        label: "Shown on Landing?",
        render: (v) => (v ? <span className="badge green dot">Shown</span> : <span className="badge">Hidden</span>),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <div className="row">
            {!row.visible && (
              <button className="btn small secondary" onClick={() => toggleFeedback(row.id, true)} type="button">
                Show feedback
              </button>
            )}
            {row.visible && (
              <button className="btn small ghost" onClick={() => toggleFeedback(row.id, false)} type="button">
                Hide
              </button>
            )}
          </div>
        ),
      },
    ];
    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Feedback</h2>
        </div>
        <Table columns={cols} rows={feedback} />
      </div>
    );
  }

  function Users() {
    const cols = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "category", label: "Category" },
      {
        key: "status",
        label: "Status",
        render: (v) =>
          v === "active" ? (
            <span className="badge green dot">Active</span>
          ) : (
            <span className="badge red dot">Suspended</span>
          ),
      },
      {
        key: "online",
        label: "Online",
        render: (v) => (v ? <span className="badge green dot">Online</span> : <span className="badge">Offline</span>),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <div className="row">
            {row.status === "active" && (
              <button className="btn small warn" onClick={() => handleSuspend(row.id)} type="button">
                Suspend
              </button>
            )}
            {row.status === "suspended" && (
              <button className="btn small success" onClick={() => handleReinstate(row.id)} type="button">
                Reinstate
              </button>
            )}
            <button className="btn small danger" onClick={() => handleDelete(row.id)} type="button">
              Delete
            </button>
          </div>
        ),
      },
    ];

    const list = filteredUsers();

    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Users</h2>
        </div>
        <div className="row">
          <input
            className="input"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={userFilters.role}
            onChange={(e) => setUserFilters((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
          </select>
          <select
            value={userFilters.status}
            onChange={(e) => setUserFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={userFilters.category}
            onChange={(e) => setUserFilters((p) => ({ ...p, category: e.target.value }))}
          >
            <option value="all">All categories</option>
            <option value="Autism">Autism</option>
            <option value="Down Syndrome">Down Syndrome</option>
          </select>
        </div>
        <Table columns={cols} rows={list} />
      </div>
    );
  }

  function LearningPaths() {
    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Learning Paths</h2>
        </div>
        <div className="sub">
          Two paths: Autism and Down Syndrome. Each: 8 topics → each topic 5 courses → each course 10 lessons. You can
          rename topics and lessons.
        </div>
        <div className="list" style={{ marginTop: 12 }}>
          {learningPaths.map((path) => (
            <div key={path.id} className="list-item">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row">
                  <span className="badge purple">{path.name}</span>
                </div>
              </div>
              <div style={{ marginTop: 10 }} className="list">
                {path.topics.map((topic) => (
                  <details key={topic.id} className="list-item">
                    <summary className="row" style={{ justifyContent: "space-between" }}>
                      <div className="row">
                        <strong>{topic.name}</strong>
                        <button
                          className="btn small ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            const name = prompt("Rename topic", topic.name);
                            if (name) handleRenameTopic(path.id, topic.id, name);
                          }}
                          type="button"
                        >
                          Rename
                        </button>
                      </div>
                      <span className="sub">{topic.courses.length} courses</span>
                    </summary>
                    <div className="list" style={{ marginTop: 10 }}>
                      {topic.courses.map((course) => (
                        <details key={course.id} className="list-item">
                          <summary className="row" style={{ justifyContent: "space-between" }}>
                            <div className="row">
                              <b>{course.name}</b>
                            </div>
                            <span className="sub">{course.lessons.length} lessons</span>
                          </summary>
                          <div className="list" style={{ marginTop: 8 }}>
                            {course.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="row"
                                style={{ justifyContent: "space-between" }}
                              >
                                <span>{lesson.name}</span>
                                <button
                                  className="btn small ghost"
                                  onClick={() => {
                                    const name = prompt("Rename lesson", lesson.name);
                                    if (name)
                                      handleRenameLesson(
                                        path.id,
                                        topic.id,
                                        course.id,
                                        lesson.id,
                                        name
                                      );
                                  }}
                                  type="button"
                                >
                                  Rename
                                </button>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Profiles() {
    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Profiles</h2>
        </div>
        <div className="le-grid-2">
          <div className="card">
            <h3>Students</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hours Studied</th>
                  <th>Avg Score</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {profiles.students.map((sp) => {
                  const u = users.find((x) => x.id === sp.userId) || { name: sp.userId };
                  return (
                    <tr key={sp.userId}>
                      <td>{u.name}</td>
                      <td>{sp.hours}</td>
                      <td>{sp.performance.avgScore}%</td>
                      <td>{Math.round(sp.performance.completionRate * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>Instructors</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Videos</th>
                  <th>Files</th>
                  <th>Quizzes</th>
                </tr>
              </thead>
              <tbody>
                {profiles.instructors.map((ip) => {
                  const u = users.find((x) => x.id === ip.userId) || { name: ip.userId };
                  return (
                    <tr key={ip.userId}>
                      <td>{u.name}</td>
                      <td>{ip.videos.join(", ") || "—"}</td>
                      <td>{ip.files.join(", ") || "—"}</td>
                      <td>{ip.quizzes.join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ===== SETTINGS (NEW UI/UX) =====
  function Settings() {
    const [tab, setTab] = useState("user"); // 'user' | 'security'

    // local form state (controlled → fixes single-letter focus loss)
    const [form, setForm] = useState({
      // General settings
      language: "English",
      respLimit: 50,
      picLimit: "Default - 4096 Kb (4Mb)",
      dateFormat: "DD/MM/YYYY",
      allowPics: true,
      aiOffOnMaintenance: false,
      allowProfileEdit: true,
      sysUpdate: "Monthly",
      allowSignup: true,
      notifyUsers: true,
      theme: "Light Theme",
      // Account creation
      account: {
        fieldTitle: "",
        fieldDesc: "",
        instructorName: "",
        category: "Autism",
        canUpload: true,
      },
      // Security
      twoFA: true,
      encryptData: true,
      emailAfterLogin: true,
      emailNewDevice: true,
      securityQuestion: true,
      lockoutAttempts: "5",
      encryptionMethod: "AES - Advanced Encryption Standard",
      reportFrequency: "Weekly",
      maintenanceTime: "Every Saturday, 12:00 AM CET",
      passwordPolicy: ["Uppercase Letter", "Lowercase Letter", "Number", "Special Character", "Min 8 chars"],
      storeData: "3 Months",
      suspiciousAction: "Temporarily Block and Alert Admin",
      sessionTimeout: "10 min",
    });

    const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const updateAcc = (k, v) =>
      setForm((p) => ({ ...p, account: { ...p.account, [k]: v } }));

    const saveUser = async () => {
      await api.saveSettings({ type: "user", form });
      alert("Saved.");
    };
    const saveSec = async () => {
      await api.saveSettings({ type: "security", form });
      alert("Saved.");
    };

    return (
      <div className="le-content">
        <div className="section-title">
          <h2>Settings</h2>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={tab === "user" ? "is-active" : ""}
            onClick={() => setTab("user")}
          >
            User Settings
          </button>
          <button
            type="button"
            className={tab === "security" ? "is-active" : ""}
            onClick={() => setTab("security")}
          >
            Security Settings
          </button>
        </div>

        {/* USER SETTINGS */}
        {tab === "user" && (
          <>
            <details className="settings-acc" open>
              <summary className="settings-summary">General settings</summary>
              <div className="settings-grid">
                <div className="field">
                  <label className="field-label">
                    <span>Default Agents’ Language</span>
                  </label>
                  <select value={form.language} onChange={(e) => update("language", e.target.value)}>
                    <option>English</option>
                    <option>French</option>
                    <option>Turkish</option>
                    <option>Arabic</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Users uploading Profile Picture</span>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.allowPics}
                      onChange={(e) => update("allowPics", e.target.checked)}
                    />
                    Allow profile pictures
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Limit of Responses for report and feedback</span>
                  </label>
                  <select
                    value={String(form.respLimit)}
                    onChange={(e) => update("respLimit", Number(e.target.value))}
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} Responses
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Allow students to use AI</span>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.aiOffOnMaintenance}
                      onChange={(e) => update("aiOffOnMaintenance", e.target.checked)}
                    />
                    Disable Ai chat for students if maintenance
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Size Limit for Profile Pictures (in Kb)</span>
                  </label>
                  <select value={form.picLimit} onChange={(e) => update("picLimit", e.target.value)}>
                    <option>Default- 4096 Kb (4Mb)</option>
                    <option>2048 Kb (2Mb)</option>
                    <option>1024 Kb (1Mb)</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Profile Edit</span>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.allowProfileEdit}
                      onChange={(e) => update("allowProfileEdit", e.target.checked)}
                    />
                    Allow users to edit their profile
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Date and Time Format</span>
                  </label>
                  <select value={form.dateFormat} onChange={(e) => update("dateFormat", e.target.value)}>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>System Update Frequency</span>
                  </label>
                  <select value={form.sysUpdate} onChange={(e) => update("sysUpdate", e.target.value)}>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>User Sign up</span>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.allowSignup}
                      onChange={(e) => update("allowSignup", e.target.checked)}
                    />
                    Allow new users to sign up
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Default Theme for Users</span>
                  </label>
                  <select value={form.theme} onChange={(e) => update("theme", e.target.value)}>
                    <option>Light Theme</option>
                    <option>Dark Theme</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Notifications</span>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.notifyUsers}
                      onChange={(e) => update("notifyUsers", e.target.checked)}
                    />
                    Send notifications to users
                  </label>
                </div>
              </div>
            </details>

            <details className="settings-acc" open>
              <summary className="settings-summary">Account Creation</summary>
              <div className="settings-grid">
                <div className="field">
                  <label className="field-label">
                    <span>1. Field Title</span>
                  </label>
                  <input
                    className="input"
                    value={form.account.fieldTitle}
                    onChange={(e) => updateAcc("fieldTitle", e.target.value)}
                    placeholder="Email Address"
                  />
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Instructor’s name</span>
                  </label>
                  <div className="row">
                    <input
                      className="input"
                      value={form.account.instructorName}
                      onChange={(e) => updateAcc("instructorName", e.target.value)}
                      placeholder="Instructor name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Field Description</span>
                  </label>
                  <input
                    className="input"
                    value={form.account.fieldDesc}
                    onChange={(e) => updateAcc("fieldDesc", e.target.value)}
                    placeholder="Add a description"
                  />
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Categorie</span>
                  </label>
                  <select
                    value={form.account.category}
                    onChange={(e) => updateAcc("category", e.target.value)}
                  >
                    <option>Autism</option>
                    <option>Down Syndrome</option>
                  </select>
                </div>
              </div>

              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.account.canUpload}
                    onChange={(e) => updateAcc("canUpload", e.target.checked)}
                  />
                  Give access to upload
                </label>
                <div className="sub">Click to check/uncheck</div>
              </div>

              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn" type="button">Create User</button>
              </div>
            </details>

            <div className="savebar">
              <button className="btn" onClick={saveUser} type="button">Save changes</button>
            </div>
          </>
        )}

        {/* SECURITY SETTINGS */}
        {tab === "security" && (
          <>
            <details className="settings-acc" open>
              <summary className="settings-summary">Authentication & Notifications</summary>
              <div className="settings-grid">
                <div className="field">
                  <label className="field-label">
                    <span>Two Factor Authentication (2FA)</span>
                    <small>Require Two Factor Authentication</small>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.twoFA}
                      onChange={(e) => update("twoFA", e.target.checked)}
                    />
                    Enable 2FA
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Login Notification</span>
                    <small>Get email after login</small>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.emailAfterLogin}
                      onChange={(e) => update("emailAfterLogin", e.target.checked)}
                    />
                    Email after login
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>New Device Notification</span>
                    <small>Get email after login in a new device</small>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.emailNewDevice}
                      onChange={(e) => update("emailNewDevice", e.target.checked)}
                    />
                    Email on new device
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Security Question</span>
                    <small>Enable Security Question for Backup</small>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.securityQuestion}
                      onChange={(e) => update("securityQuestion", e.target.checked)}
                    />
                    Enable
                  </label>
                </div>
              </div>
            </details>

            <details className="settings-acc" open>
              <summary className="settings-summary">Data & Sessions</summary>
              <div className="settings-grid">
                <div className="field">
                  <label className="field-label">
                    <span>Encryption of Stored Data</span>
                    <small>Encrypt Stored Data</small>
                  </label>
                  <label className="switcher">
                    <input
                      type="checkbox"
                      checked={form.encryptData}
                      onChange={(e) => update("encryptData", e.target.checked)}
                    />
                    Encrypt data
                  </label>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Login Attempts before Account Lockout</span>
                  </label>
                  <select
                    value={form.lockoutAttempts}
                    onChange={(e) => update("lockoutAttempts", e.target.value)}
                  >
                    {["3", "5", "7", "10"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Data Encryption Method</span>
                  </label>
                  <select
                    value={form.encryptionMethod}
                    onChange={(e) => update("encryptionMethod", e.target.value)}
                  >
                    <option>AES - Advanced Encryption Standard</option>
                    <option>RSA - Rivest–Shamir–Adleman</option>
                    <option>ChaCha20-Poly1305</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Generate Report for student</span>
                  </label>
                  <select
                    value={form.reportFrequency}
                    onChange={(e) => update("reportFrequency", e.target.value)}
                  >
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Scheduled Maintenance Time</span>
                  </label>
                  <div className="row">
                    <input
                      className="input"
                      value={form.maintenanceTime}
                      onChange={(e) => update("maintenanceTime", e.target.value)}
                      placeholder="Every Saturday, 12:00 AM CET"
                    />
                    <button className="btn ghost" type="button" title="Pick date/time">
                      📅
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Password Policy</span>
                  </label>
                  <div className="chips">
                    {form.passwordPolicy.map((p) => (
                      <span className="chip" key={p}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Store Data for how long</span>
                  </label>
                  <select value={form.storeData} onChange={(e) => update("storeData", e.target.value)}>
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>12 Months</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Action for Suspicious User Activity</span>
                  </label>
                  <select
                    value={form.suspiciousAction}
                    onChange={(e) => update("suspiciousAction", e.target.value)}
                  >
                    <option>Temporarily Block and Alert Admin</option>
                    <option>Require 2FA and Alert Admin</option>
                    <option>Alert Admin Only</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    <span>Session Timeout Management</span>
                  </label>
                  <select
                    value={form.sessionTimeout}
                    onChange={(e) => update("sessionTimeout", e.target.value)}
                  >
                    <option>5 min</option>
                    <option>10 min</option>
                    <option>30 min</option>
                    <option>60 min</option>
                  </select>
                </div>
              </div>
            </details>

            <div className="savebar">
              <button className="btn" onClick={saveSec} type="button">
                Save changes
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- Shell ----
  const NavButton = ({ id, label }) => (
    <button className={section === id ? "is-active" : ""} onClick={() => setSection(id)} type="button">
      {label}
    </button>
  );

  if (!isAuthed) {
    return (
      <div className="login">
        <div className="login-card">
          <div className="le-logo">
            <div className="le-logo-badge">LE</div> LearnEase Admin
          </div>
          <h1>Sign in</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsAuthed(true);
              setAdminName("Admin");
            }}
            className="row"
            style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
          >
            <input className="input" name="email" type="email" placeholder="Email" required defaultValue="admin@learnease.com" />
            <input className="input" name="password" type="password" placeholder="Password" required defaultValue="admin" />
            <button className="btn" type="submit">Login</button>
            <div className="sub">Demo accepts any credentials. Wire api.adminLogin() to enforce real auth.</div>
          </form>
        </div>
      </div>
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
            <input placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="le-user">
            <div className="le-avatar">{adminName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{adminName}</div>
              <div className="sub">Administrator</div>
            </div>
            <button className="btn ghost" onClick={() => setIsAuthed(false)} type="button">
              Logout
            </button>
          </div>
        </div>

        {section === "dashboard" && <Dashboard />}
        {section === "applications" && <InstructorApplications />}
        {section === "reports" && <Reports />}
        {section === "feedback" && <Feedback />}
        {section === "users" && <Users />}
        {section === "learning" && <LearningPaths />}
        {section === "profiles" && <Profiles />}
        {section === "settings" && <Settings />}
      </main>
    </div>
  );
}
