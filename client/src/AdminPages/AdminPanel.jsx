import React, { useMemo, useState, useEffect } from "react";
import "./AdminPanel.css";


// ---- Demo Generators ----
function generateLearningPath(name) {
  const topics = Array.from({ length: 8 }).map((_, ti) => ({
    id: `${name}-t${ti+1}`,
    name: `Topic ${ti + 1}`,
    courses: Array.from({ length: 5 }).map((__, ci) => ({
      id: `${name}-t${ti+1}-c${ci+1}`,
      name: `Course ${ci + 1}`,
      lessons: Array.from({ length: 10 }).map((___, li) => ({
        id: `${name}-t${ti+1}-c${ci+1}-l${li+1}`,
        name: `Lesson ${li + 1}`
      }))
    }))
  }));
  return { id: name.toLowerCase().replace(/\s+/g, "-"), name, topics };
}

const demoEngagement = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  value: Math.round(100 + Math.sin(i / 2) * 40 + Math.random() * 30),
}));

const demoApplications = [
  { id: 'app-1', name: 'Amina Yılmaz', email:'amina@le.com', category: 'Autism', submittedAt: '2025-08-01', cvUrl:'#', description:'8 years experience in special education.', status:'pending' },
  { id: 'app-2', name: 'Omar Hanieh', email:'omar@le.com', category: 'Down Syndrome', submittedAt: '2025-08-10', cvUrl:'#', description:'Speech therapy background.', status:'pending' },
];

const demoUsers = [
  { id: 'u1', name:'Lina Ahmed', role:'student', category:'Autism', online:true, status:'active', joinedAt:'2025-06-10' },
  { id: 'u2', name:'Mehmet Ali', role:'student', category:'Down Syndrome', online:false, status:'active', joinedAt:'2025-06-18' },
  { id: 'u3', name:'Sara Noor', role:'instructor', category:'Autism', online:false, status:'active', joinedAt:'2025-05-02' },
  { id: 'u4', name:'Yusuf Can', role:'instructor', category:'Down Syndrome', online:true, status:'suspended', joinedAt:'2025-04-11' },
  { id: 'u5', name:'Layla Karim', role:'student', category:'Autism', online:true, status:'active', joinedAt:'2025-07-20' },
];

const demoReports = [
  { id: 'r1', type:'abuse', fromRole:'student', category:'Autism', description:'Inappropriate message in chat', createdAt:'2025-08-09' },
  { id: 'r2', type:'content', fromRole:'instructor', category:'Down Syndrome', description:'Video encoding issue', createdAt:'2025-08-08' },
];

const demoFeedback = [
  { id: 'f1', fromRole:'student', category:'Autism', description:'Loving the new dashboard!', visible:false },
  { id: 'f2', fromRole:'instructor', category:'Down Syndrome', description:'Please add bulk upload for quizzes.', visible:false },
];

const demoProfiles = {
  students: [
    { userId:'u1', hours: 42, performance: { avgScore: 86, completionRate: 0.72 } },
    { userId:'u5', hours: 18, performance: { avgScore: 74, completionRate: 0.40 } },
  ],
  instructors: [
    { userId:'u3', videos:['Autism Basics.mp4','Advanced Strategies.mp4'], files:['guide.pdf'], quizzes:['Quiz 1','Quiz 2'] },
    { userId:'u4', videos:['Speech Warmups.mp4'], files:['speech-exercises.pdf'], quizzes:['Assessment A'] },
  ]
};

// ---- Minimal SVG Line Chart (no external deps) ----
function LineChart({ data, color = "var(--primary)" }) {
  const padding = 18;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = data.map((d, i) => {
    const x = padding + (i * (100 - padding*2)) / (data.length - 1);
    const y = padding + (100 - padding*2) * (1 - (d.value - min) / (max - min || 1));
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <g className="chart-grid">
          {[0,25,50,75,100].map((y,i)=> (
            <line key={i} x1="0" x2="100" y1={y} y2={y} />
          ))}
        </g>
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        {data.map((d,i)=>{
          const [x,y] = points.split(" ")[i].split(",");
          return <circle key={i} cx={x} cy={y} r="1.4" fill={color} />
        })}
      </svg>
    </div>
  );
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

function Table({ columns, rows, keyField = 'id' }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[keyField]}>
              {columns.map(c => (
                <td key={c.key}>{typeof c.render === 'function' ? c.render(row[c.key], row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- API STUBS (replace bodies with real fetch calls) ----
const api = {
  // Auth
  adminLogin: async (email, password) => {
    // return fetch('/api/admin/login', {method:'POST', body: JSON.stringify({email,password})})
    return { ok: true, token: 'demo-token', adminName: 'Admin' };
  },
  // Dashboard
  getStats: async () => ({ ok: true }),
  // Applications
  listInstructorApplications: async () => ({ ok: true, data: demoApplications }),
  decideApplication: async (id, decision) => ({ ok: true, id, decision }), // decision: 'accept'|'decline'
  // Users
  listUsers: async (q) => ({ ok: true, data: demoUsers }),
  suspendUser: async (id, reason) => ({ ok: true, id, reason }),
  reinstateUser: async (id) => ({ ok: true, id }),
  deleteUser: async (id) => ({ ok: true, id }),
  // Reports
  listReports: async () => ({ ok: true, data: demoReports }),
  // Feedback
  listFeedback: async () => ({ ok: true, data: demoFeedback }),
  setFeedbackVisibility: async (id, visible) => ({ ok: true, id, visible }),
  // Learning paths
  getLearningPaths: async () => ({ ok: true, data: [generateLearningPath('Autism'), generateLearningPath('Down Syndrome')] }),
  renameTopic: async (pathId, topicId, name) => ({ ok: true, pathId, topicId, name }),
  renameLesson: async (pathId, topicId, courseId, lessonId, name) => ({ ok: true }),
  // Settings
  getSettings: async () => ({ ok: true, data: { language:'en', dateFormat:'YYYY-MM-DD', timeFormat:'24h', twoFA:false } }),
  saveSettings: async (settings) => ({ ok: true, settings }),
  addUser: async (payload) => ({ ok: true, payload }),
  // Profiles
  getProfiles: async () => ({ ok: true, data: demoProfiles }),
};

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [section, setSection] = useState('dashboard');

  // Data state
  const [applications, setApplications] = useState(demoApplications);
  const [users, setUsers] = useState(demoUsers);
  const [reports, setReports] = useState(demoReports);
  const [feedback, setFeedback] = useState(demoFeedback);
  const [learningPaths, setLearningPaths] = useState([generateLearningPath('Autism'), generateLearningPath('Down Syndrome')]);
  const [settings, setSettings] = useState({ language:'en', dateFormat:'YYYY-MM-DD', timeFormat:'24h', twoFA:false });
  const [profiles, setProfiles] = useState(demoProfiles);

  const [search, setSearch] = useState('');
  const [userFilters, setUserFilters] = useState({ role:'all', status:'all', category:'all' });

  // Dashboard stats
  const totalUsers = users.length;
  const totalStudents = users.filter(u=>u.role==='student').length;
  const totalInstructors = users.filter(u=>u.role==='instructor').length;
  const onlineUsers = users.filter(u=>u.online && u.status==='active').length;
  const suspendedUsers = users.filter(u=>u.status==='suspended');
  const byCat = useMemo(()=>({
    autism: users.filter(u=>u.category==='Autism').length,
    down: users.filter(u=>u.category==='Down Syndrome').length
  }), [users]);

  // Handlers
  async function handleLogin(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const res = await api.adminLogin(email, password);
    if (res.ok) { setIsAuthed(true); setAdminName(res.adminName || 'Admin'); }
  }

  async function decideApplication(id, decision) {
    const res = await api.decideApplication(id, decision);
    if (!res.ok) return;
    setApplications(prev => prev.map(a => a.id===id ? { ...a, status: decision } : a));
    if (decision === 'accept') {
      const app = applications.find(a=>a.id===id);
      const newUser = { id: `u-${Date.now()}`, name: app.name, role:'instructor', category: app.category, online:false, status:'active', joinedAt: new Date().toISOString().slice(0,10) };
      setUsers(prev => [newUser, ...prev]);
    }
  }

  async function toggleFeedback(id, visible) {
    const res = await api.setFeedbackVisibility(id, visible);
    if (!res.ok) return;
    setFeedback(prev => prev.map(f => f.id===id ? { ...f, visible } : f));
  }

  async function handleSuspend(id) {
    const reason = prompt('Reason for suspension?');
    if (reason === null) return;
    const res = await api.suspendUser(id, reason);
    if (!res.ok) return;
    setUsers(prev => prev.map(u => u.id===id ? { ...u, status:'suspended', online:false } : u));
  }

  async function handleReinstate(id) {
    const res = await api.reinstateUser(id);
    if (!res.ok) return;
    setUsers(prev => prev.map(u => u.id===id ? { ...u, status:'active' } : u));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this account?')) return;
    const res = await api.deleteUser(id);
    if (!res.ok) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function handleRenameTopic(pathId, topicId, name) {
    const res = await api.renameTopic(pathId, topicId, name);
    if (!res.ok) return;
    setLearningPaths(prev => prev.map(p => p.id===pathId ? {
      ...p,
      topics: p.topics.map(t => t.id===topicId ? { ...t, name } : t)
    } : p));
  }

  async function handleRenameLesson(pathId, topicId, courseId, lessonId, name) {
    const res = await api.renameLesson(pathId, topicId, courseId, lessonId, name);
    if (!res.ok) return;
    setLearningPaths(prev => prev.map(p => p.id===pathId ? {
      ...p,
      topics: p.topics.map(t => t.id===topicId ? {
        ...t,
        courses: t.courses.map(c => c.id===courseId ? {
          ...c,
          lessons: c.lessons.map(l => l.id===lessonId ? { ...l, name } : l)
        } : c)
      } : t)
    } : p));
  }

  function filteredUsers() {
    return users.filter(u => (
      (userFilters.role==='all' || u.role===userFilters.role) &&
      (userFilters.status==='all' || u.status===userFilters.status) &&
      (userFilters.category==='all' || u.category===userFilters.category) &&
      (!search || u.name.toLowerCase().includes(search.toLowerCase()))
    ));
  }

  // --- Section UIs ---
  function Dashboard() {
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
            <h2>Total Engagement (last 14 days)</h2>
          </div>
          <LineChart data={demoEngagement} />
        </div>
        <div className="le-grid-2">
          <div className="card">
            <h3>Online Users</h3>
            <table className="table">
              <thead><tr><th>Name</th><th>Role</th><th>Category</th><th>Status</th></tr></thead>
              <tbody>
                {users.filter(u=>u.online && u.status==='active').map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td><td>{u.role}</td><td>{u.category}</td>
                    <td><span className="badge green dot">Online</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>Suspended Users</h3>
            <div className="sub" style={{marginBottom:8}}>{suspendedUsers.length} total</div>
            <ul>
              {suspendedUsers.map(u => (
                <li key={u.id} className="row" style={{justifyContent:'space-between'}}>
                  <span>{u.name} · {u.role} · {u.category}</span>
                  <button className="btn small success" onClick={()=>handleReinstate(u.id)}>Reinstate</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function InstructorApplications() {
    const cols = [
      { key:'name', label:'Name' },
      { key:'email', label:'Email' },
      { key:'category', label:'Category' },
      { key:'submittedAt', label:'Submitted' },
      { key:'cvUrl', label:'CV', render:(v)=> <a href={v} target="_blank">View</a> },
      { key:'description', label:'About' },
      { key:'status', label:'Status', render:(v)=> v==='pending'?<span className="badge purple dot">Pending</span>:v }
    ];
    return (
      <div className="le-content">
        <div className="section-title"><h2>Instructor Applications</h2></div>
        <Table columns={[...cols, { key:'actions', label:'Actions', render:(_,row)=> (
          <div className="row">
            <button className="btn small success" onClick={()=>decideApplication(row.id,'accept')}>Accept</button>
            <button className="btn small danger" onClick={()=>decideApplication(row.id,'decline')}>Decline</button>
          </div>
        ) }]} rows={applications} />
      </div>
    );
  }

  function Reports() {
    const cols = [
      { key:'id', label:'ID' },
      { key:'type', label:'Type' },
      { key:'fromRole', label:'From' },
      { key:'category', label:'Category' },
      { key:'description', label:'Description' },
      { key:'createdAt', label:'Date' },
    ];
    return (
      <div className="le-content">
        <div className="section-title"><h2>Reports</h2></div>
        <Table columns={cols} rows={reports} />
      </div>
    );
  }

  function Feedback() {
    const cols = [
      { key:'id', label:'ID' },
      { key:'fromRole', label:'From' },
      { key:'category', label:'Category' },
      { key:'description', label:'Description' },
      { key:'visible', label:'Shown on Landing?', render:(v)=> v? <span className="badge green dot">Shown</span> : <span className="badge">Hidden</span> },
      { key:'actions', label:'Actions', render:(_,row)=> (
        <div className="row">
          {!row.visible && <button className="btn small secondary" onClick={()=>toggleFeedback(row.id, true)}>Show feedback</button>}
          {row.visible && <button className="btn small ghost" onClick={()=>toggleFeedback(row.id, false)}>Hide</button>}
        </div>
      )},
    ];
    return (
      <div className="le-content">
        <div className="section-title"><h2>Feedback</h2></div>
        <Table columns={cols} rows={feedback} />
      </div>
    );
  }

  function Users() {
    const cols = [
      { key:'name', label:'Name' },
      { key:'role', label:'Role' },
      { key:'category', label:'Category' },
      { key:'status', label:'Status', render:(v)=> v==='active'?<span className="badge green dot">Active</span>:<span className="badge red dot">Suspended</span> },
      { key:'online', label:'Online', render:(v)=> v?<span className="badge green dot">Online</span>:<span className="badge">Offline</span> },
      { key:'actions', label:'Actions', render:(_,row)=> (
        <div className="row">
          {row.status==='active' && <button className="btn small warn" onClick={()=>handleSuspend(row.id)}>Suspend</button>}
          {row.status==='suspended' && <button className="btn small success" onClick={()=>handleReinstate(row.id)}>Reinstate</button>}
          <button className="btn small danger" onClick={()=>handleDelete(row.id)}>Delete</button>
        </div>
      )},
    ];

    const list = filteredUsers();

    return (
      <div className="le-content">
        <div className="section-title"><h2>Users</h2></div>
        <div className="row">
          <input className="input" placeholder="Search by name..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select value={userFilters.role} onChange={e=>setUserFilters(p=>({...p, role:e.target.value}))}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
          </select>
          <select value={userFilters.status} onChange={e=>setUserFilters(p=>({...p, status:e.target.value}))}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={userFilters.category} onChange={e=>setUserFilters(p=>({...p, category:e.target.value}))}>
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
        <div className="section-title"><h2>Learning Paths</h2></div>
        <div className="sub">Two paths: Autism and Down Syndrome. Each: 8 topics → each topic 5 courses → each course 10 lessons.
        You can rename topics and lessons.</div>
        <div className="list" style={{marginTop:12}}>
          {learningPaths.map(path => (
            <div key={path.id} className="list-item">
              <div className="row" style={{justifyContent:'space-between'}}>
                <div className="row"><span className="badge purple">{path.name}</span></div>
              </div>
              <div style={{marginTop:10}} className="list">
                {path.topics.map(topic => (
                  <details key={topic.id} className="list-item">
                    <summary className="row" style={{justifyContent:'space-between'}}>
                      <div className="row">
                        <strong>{topic.name}</strong>
                        <button className="btn small ghost" onClick={(e)=>{
                          e.preventDefault();
                          const name = prompt('Rename topic', topic.name);
                          if (name) handleRenameTopic(path.id, topic.id, name);
                        }}>Rename</button>
                      </div>
                      <span className="sub">{topic.courses.length} courses</span>
                    </summary>
                    <div className="list" style={{marginTop:10}}>
                      {topic.courses.map(course => (
                        <details key={course.id} className="list-item">
                          <summary className="row" style={{justifyContent:'space-between'}}>
                            <div className="row"><b>{course.name}</b></div>
                            <span className="sub">{course.lessons.length} lessons</span>
                          </summary>
                          <div className="list" style={{marginTop:8}}>
                            {course.lessons.map(lesson => (
                              <div key={lesson.id} className="row" style={{justifyContent:'space-between'}}>
                                <span>{lesson.name}</span>
                                <button className="btn small ghost" onClick={()=>{
                                  const name = prompt('Rename lesson', lesson.name);
                                  if (name) handleRenameLesson(path.id, topic.id, course.id, lesson.id, name);
                                }}>Rename</button>
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
        <div className="section-title"><h2>Profiles</h2></div>
        <div className="le-grid-2">
          <div className="card">
            <h3>Students</h3>
            <table className="table">
              <thead><tr><th>Name</th><th>Hours Studied</th><th>Avg Score</th><th>Completion</th></tr></thead>
              <tbody>
                {profiles.students.map(sp => {
                  const u = users.find(x=>x.id===sp.userId) || { name: sp.userId };
                  return (
                    <tr key={sp.userId}>
                      <td>{u.name}</td>
                      <td>{sp.hours}</td>
                      <td>{sp.performance.avgScore}%</td>
                      <td>{Math.round(sp.performance.completionRate*100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>Instructors</h3>
            <table className="table">
              <thead><tr><th>Name</th><th>Videos</th><th>Files</th><th>Quizzes</th></tr></thead>
              <tbody>
                {profiles.instructors.map(ip => {
                  const u = users.find(x=>x.id===ip.userId) || { name: ip.userId };
                  return (
                    <tr key={ip.userId}>
                      <td>{u.name}</td>
                      <td>{ip.videos.join(', ') || '—'}</td>
                      <td>{ip.files.join(', ') || '—'}</td>
                      <td>{ip.quizzes.join(', ') || '—'}</td>
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

  function Settings() {
    const [local, setLocal] = useState(settings);
    useEffect(()=> setLocal(settings), [settings]);

    function reset() { setLocal(settings); }
    async function save() {
      const res = await api.saveSettings(local);
      if (res.ok) setSettings(local);
    }

    // Quick add user form (from Settings)
    const [newUser, setNewUser] = useState({ name:'', role:'student', category:'Autism' });
    async function addUser() {
      if (!newUser.name) return;
      const res = await api.addUser(newUser);
      if (!res.ok) return;
      const id = `u-${Date.now()}`;
      setUsers(prev => [{ id, name:newUser.name, role:newUser.role, category:newUser.category, online:false, status:'active', joinedAt:new Date().toISOString().slice(0,10) }, ...prev]);
      setNewUser({ name:'', role:'student', category:'Autism' });
    }

    return (
      <div className="le-content">
        <div className="section-title"><h2>Settings</h2></div>
        <div className="le-grid-2">
          <div className="card">
            <h3>General</h3>
            <div className="row">
              <div>
                <div className="sub">Language</div>
                <select value={local.language} onChange={e=>setLocal(p=>({...p, language:e.target.value}))}>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                  <option value="tr">Turkish</option>
                </select>
              </div>
              <div>
                <div className="sub">Date Format</div>
                <select value={local.dateFormat} onChange={e=>setLocal(p=>({...p, dateFormat:e.target.value}))}>
                  <option>YYYY-MM-DD</option>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>
              <div>
                <div className="sub">Time Format</div>
                <select value={local.timeFormat} onChange={e=>setLocal(p=>({...p, timeFormat:e.target.value}))}>
                  <option value="24h">24h</option>
                  <option value="12h">12h</option>
                </select>
              </div>
            </div>
            <div className="row" style={{marginTop:10}}>
              <label className="badge"><input type="checkbox" checked={local.twoFA} onChange={e=>setLocal(p=>({...p, twoFA:e.target.checked}))} /> Enable 2FA</label>
            </div>
            <div className="row" style={{marginTop:14}}>
              <button className="btn success" onClick={save}>Save</button>
              <button className="btn ghost" onClick={reset}>Reset</button>
            </div>
          </div>
          <div className="card">
            <h3>Add User (Quick)</h3>
            <div className="row">
              <input className="input" placeholder="Full name" value={newUser.name} onChange={e=>setNewUser(p=>({...p, name:e.target.value}))} />
              <select value={newUser.role} onChange={e=>setNewUser(p=>({...p, role:e.target.value}))}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
              <select value={newUser.category} onChange={e=>setNewUser(p=>({...p, category:e.target.value}))}>
                <option>Autism</option>
                <option>Down Syndrome</option>
              </select>
              <button className="btn" onClick={addUser}>Add</button>
            </div>
            <div className="sub" style={{marginTop:8}}>Users are active automatically when accepted as instructors.</div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Shell ----
  const NavButton = ({ id, label }) => (
    <button className={section===id?"is-active":""} onClick={()=>setSection(id)}>{label}</button>
  );

  if (!isAuthed) {
    return (
      <div className="login">
        <div className="login-card">
          <div className="le-logo"><div className="le-logo-badge">LE</div> LearnEase Admin</div>
          <h1>Sign in</h1>
          <form onSubmit={handleLogin} className="row" style={{flexDirection:'column', alignItems:'stretch', gap:10}}>
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
        <div className="le-logo"><div className="le-logo-badge">LE</div> LearnEase</div>
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
            <input placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="le-user">
            <div className="le-avatar">{adminName.slice(0,2).toUpperCase()}</div>
            <div>
              <div style={{fontWeight:700}}>{adminName}</div>
              <div className="sub">Administrator</div>
            </div>
            <button className="btn ghost" onClick={()=>setIsAuthed(false)}>Logout</button>
          </div>
        </div>

        {section==='dashboard' && <Dashboard />}
        {section==='applications' && <InstructorApplications />}
        {section==='reports' && <Reports />}
        {section==='feedback' && <Feedback />}
        {section==='users' && <Users />}
        {section==='learning' && <LearningPaths />}
        {section==='profiles' && <Profiles />}
        {section==='settings' && <Settings />}
      </main>
    </div>
  );
}
