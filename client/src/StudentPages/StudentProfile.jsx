import React, { useMemo, useState } from "react";
import "./StudentProfile.css";
import ProfileLogo from "../assets/ProfileLogo.png";

/* ===== Demo Data (replace with API) ===== */
const demoStudent = {
  id: "st-001",
  name: "Layla Benali",
  age: 10,
  pronouns: "she/her",
  gradeLevel: "Grade 4",
  diagnosis: ["Down Syndrome"],
  avatar: "https://i.pravatar.cc/160?img=47",
  guardian: { name: "Samira Benali", phone: "+213 555 123 456", email: "samira@example.com" },
  emergency: { name: "Youssef Benali", phone: "+213 555 987 654" },
  communication: ["Short phrases", "Visual schedule", "Gesture cues"],
  sensory: {
    likes: ["Soft textures", "Quiet corners", "Weighted cushion"],
    avoid: ["Loud sudden sounds", "Flashing lights", "Strong smells"],
    tools: ["Noise-cancelling headphones", "Fidget ring", "Deep-pressure hug pillow"],
  },
  strategies: [
    "Give 5–10s extra processing time.",
    "Use first/then language: 'First reading, then break.'",
    "Offer 2 clear choices; avoid open-ended overload.",
  ],
  safetyNote: "Carry medical ID band; avoid crowded exits during drills.",
  stars: 124,
  attendancePercent: 92,
  goals: [
    {
      id: "g-read-1",
      title: "Read 10 CVC words independently",
      progress: 70,
      due: "2025-12-01",
      strategies: ["Phonics cards", "Picture cues", "1:1 practice 10 mins/day"],
    },
    {
      id: "g-comm-1",
      title: "Use 'help please' without prompt",
      progress: 55,
      due: "2025-11-10",
      strategies: ["Model phrase", "Visual prompt near ", "Token for attempt"],
    },
    {
      id: "g-soc-1",
      title: "Initiate greeting with peers",
      progress: 30,
      due: "2025-10-20",
      strategies: ["Role-play", "Peer buddy up", "Sticker reinforcement"],
    },
  ],
  courses: [
    { id: "SPEK101-02", title: "Recognizing Emotions — Basics", progress: 82, lastQuiz: 9, totalQuiz: 12, nextDue: "2025-08-28" },
    { id: "SPEK101-05", title: "Asking for Help – Part 1", progress: 67, lastQuiz: 7, totalQuiz: 10, nextDue: "2025-09-03" },
    { id: "NUM101-01", title: "Counting with Objects", progress: 50, lastQuiz: 5, totalQuiz: 10, nextDue: "2025-09-05" },
  ],
  scheduleToday: [
    { time: "09:00", activity: "Warm-up & visual check-in" },
    { time: "09:20", activity: "Literacy — phonics cards" },
    { time: "09:45", activity: "Movement break (sensory path)" },
    { time: "10:00", activity: "Math — counting game" },
    { time: "10:30", activity: "Social story & peer work" },
  ],
  quickPhrases: ["Help please", "Break", "Bathroom", "Yes", "No"],
};

const Tab = {
  Overview: "Overview",
  Goals: "Goals",
  Courses: "Courses",
  Achievements: "Achievements",
  CarePlan: "Care Plan",
  Settings: "Settings",
};

function Ring({ value = 0, label = "" }) {
  return (
    <div className="sp-ring" style={{ "--val": `${value}%` }}>
      <span className="sp-ring-val">{value}%</span>
      <span className="sp-ring-label">{label}</span>
    </div>
  );
}

function Bar({ value = 0 }) {
  return (
    <div className="sp-bar">
      <div className="sp-bar-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function Chip({ text, tone = "default" }) {
  return <span className={`sp-chip ${tone}`}>{text}</span>;
}

export default function StudentProfile() {
  const [tab, setTab] = useState(Tab.Overview);
  const [profile, setProfile] = useState(demoStudent);
  const [mood, setMood] = useState("🙂");
  const [consent, setConsent] = useState(true);
  const [edit, setEdit] = useState(false);

  const goalsAvg = useMemo(() => {
    if (!profile.goals?.length) return 0;
    return Math.round(profile.goals.reduce((s, g) => s + (g.progress || 0), 0) / profile.goals.length);
  }, [profile.goals]);

  // ===== Fake API handlers (plug your backend) =====
  async function handleSaveProfile() {
    // await fetch("/api/student/update", { method: "POST", body: JSON.stringify(profile) });
    alert("Saved (demo). Connect your API in handleSaveProfile().");
    setEdit(false);
  }
  async function handleResetProfile() {
    setProfile(demoStudent);
    setEdit(false);
  }
  async function handleUploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Upload to your storage, get URL, then:
    const blobURL = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, avatar: blobURL }));
  }

  return (
    <div className="sp-page">
      {/* Header */}
<header className="sp-header">
  <div className="sp-header-inner">
    <button className="sp-back" aria-label="Back" onClick={() => window.history.back()}>←</button>

    <div className="sp-brand">
      <img src={ProfileLogo} alt="NeuroLearn logo" className="sp-logo-img" loading="lazy" />
      <div className="sp-brand-text"></div>
    </div>

    <div className="sp-header-actions">
      <button className="sp-btn ghost" onClick={() => alert("Notify guardian (demo)")}>Notify</button>
      <button className="sp-btn" onClick={() => setTab(Tab.Settings)}>Settings</button>
    </div>
  </div>
</header>

      {/* Layout */}
      <main className="sp-container">
        {/* Sidebar */}
        <aside className="sp-sidebar">
          <div className="sp-card sp-profile-card">
            <div className="sp-avatar-wrap">
              <img src={profile.avatar} alt={`${profile.name} avatar`} className="sp-avatar" />
              <label className="sp-upload">
                <input type="file" accept="image/*" onChange={handleUploadAvatar} />
                Change
              </label>
            </div>
            <h1 className="sp-name">{profile.name}</h1>
            <div className="sp-sub">
              {profile.pronouns} • {profile.age} yrs • {profile.gradeLevel}
            </div>
            <div className="sp-dx">
              {profile.diagnosis.map((d) => (
                <Chip key={d} text={d} tone="accent" />
              ))}
            </div>

            <div className="sp-stats">
              <div>
                <div className="sp-stat-val">{profile.stars}</div>
                <div className="sp-stat-label">Stars</div>
              </div>
              <div>
                <div className="sp-stat-val">{goalsAvg}%</div>
                <div className="sp-stat-label">Goals Avg</div>
              </div>
              <div>
                <div className="sp-stat-val">{profile.attendancePercent}%</div>
                <div className="sp-stat-label">Attendance</div>
              </div>
            </div>

            <div className="sp-card-sec">
              <h4>Guardians</h4>
              <div className="sp-kv">
                <span>Primary</span>
                <span>{profile.guardian.name}</span>
              </div>
              <div className="sp-kv">
                <span>Phone</span>
                <a href={`tel:${profile.guardian.phone}`}>{profile.guardian.phone}</a>
              </div>
              <div className="sp-kv">
                <span>Email</span>
                <a href={`mailto:${profile.guardian.email}`}>{profile.guardian.email}</a>
              </div>
            </div>

            <div className="sp-card-sec">
              <h4>Emergency</h4>
              <div className="sp-kv">
                <span>Contact</span>
                <span>{profile.emergency.name}</span>
              </div>
              <div className="sp-kv">
                <span>Phone</span>
                <a href={`tel:${profile.emergency.phone}`}>{profile.emergency.phone}</a>
              </div>
            </div>
          </div>

            <div className="sp-card">
              <h4>Quick phrases</h4>
              <div className="sp-chips">
                {profile.quickPhrases.map((q) => (
                  <button key={q} className="sp-chip btn" onClick={() => alert(`Speak: ${q}`)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-card">
              <h4>Mood tracker</h4>
              <div className="sp-moods">
                {["😀", "🙂", "😐", "🙁", "😫"].map((m) => (
                  <button
                    key={m}
                    className={`sp-mood ${mood === m ? "active" : ""}`}
                    onClick={() => setMood(m)}
                    aria-label={`Mood ${m}`}
                  >
                    {m}
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="sp-main">
          {/* Tabs */}
          <nav className="sp-tabs">
            {Object.values(Tab).map((t) => (
              <button key={t} className={`sp-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </nav>

          {/* Panels */}
          {tab === Tab.Overview && (
            <div className="sp-grid">
              <div className="sp-card sp-kpis">
                <Ring value={goalsAvg} label="Goals" />
                <Ring
                  value={Math.round(
                    (profile.courses.reduce((s, c) => s + c.progress, 0) / (profile.courses.length || 1))
                  )}
                  label="Courses"
                />
                <Ring value={profile.attendancePercent} label="Attendance" />
                <div className="sp-wallet">
                  <div className="sp-wallet-stars">★</div>
                  <div>
                    <div className="sp-wallet-val">{profile.stars} Stars</div>
                    <div className="sp-wallet-sub">Rewards available in shop</div>
                  </div>
                  <button className="sp-btn ghost" onClick={() => alert("Open Rewards (demo)")}>
                    Redeem
                  </button>
                </div>
              </div>

              <div className="sp-card">
                <h3>Today’s routine</h3>
                <ul className="sp-schedule">
                  {profile.scheduleToday.map((s, i) => (
                    <li key={i}>
                      <span className="time">{s.time}</span>
                      <span className="activity">{s.activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sp-card">
                <h3>Sensory profile</h3>
                <div className="sp-sensory">
                  <div>
                    <h4>Prefers</h4>
                    <div className="sp-chips">
                      {profile.sensory.likes.map((x) => (
                        <Chip key={x} text={x} tone="good" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4>Avoid</h4>
                    <div className="sp-chips">
                      {profile.sensory.avoid.map((x) => (
                        <Chip key={x} text={x} tone="warn" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4>Tools</h4>
                    <div className="sp-chips">
                      {profile.sensory.tools.map((x) => (
                        <Chip key={x} text={x} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sp-card">
                <h3>Support strategies</h3>
                <ul className="sp-list">
                  {profile.strategies.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === Tab.Goals && (
            <div className="sp-list-rows">
              {profile.goals.map((g) => (
                <div key={g.id} className="sp-row">
                  <div className="sp-row-left">
                    <div className="sp-row-title">{g.title}</div>
                    <div className="sp-row-sub">Due {g.due}</div>
                    <Bar value={g.progress} />
                    <div className="sp-chips">
                      {g.strategies.map((st, i) => (
                        <Chip key={i} text={st} />
                      ))}
                    </div>
                  </div>
                  <div className="sp-row-right">
                    <Ring value={g.progress} />
                    <button className="sp-btn ghost" onClick={() => alert("Open evidence (demo)")}>
                      Evidence
                    </button>
                  </div>
                </div>
              ))}
              <button className="sp-btn" onClick={() => alert("Add Goal (demo)")}>Add Goal</button>
            </div>
          )}

          {tab === Tab.Courses && (
            <div className="sp-grid-courses">
              {profile.courses.map((c) => (
                <article key={c.id} className="sp-course">
                  <div className="sp-course-media" aria-hidden>
                    <div className="sp-course-badge">{c.progress}%</div>
                  </div>
                  <div className="sp-course-body">
                    <h4>{c.title}</h4>
                    <div className="sp-course-sub">Last quiz: {c.lastQuiz}/{c.totalQuiz} • Next due {c.nextDue}</div>
                    <Bar value={c.progress} />
                    <div className="sp-course-actions">
                      <button className="sp-btn" onClick={() => alert(`Continue ${c.id} (demo)`)}>
                        Continue
                      </button>
                      <button className="sp-btn ghost" onClick={() => alert("View quizzes (demo)")}>
                        Quizzes
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === Tab.Achievements && (
            <div className="sp-ach-grid">
              {[
                { id: "a1", title: "Routine Rockstar", desc: "Completed a week of routines" },
                { id: "a2", title: "Communication Champ", desc: "Asked for help 5 times" },
                { id: "a3", title: "Sensory Smart", desc: "Used tools independently" },
                { id: "a4", title: "Math Milestone", desc: "Mastered counting to 100" },
              ].map((a) => (
                <div key={a.id} className="sp-ach">
                  <div className="sp-badge">★</div>
                  <div className="sp-ach-title">{a.title}</div>
                  <div className="sp-ach-sub">{a.desc}</div>
                </div>
              ))}
            </div>
          )}

          {tab === Tab.CarePlan && (
            <div className="sp-grid">
              <div className="sp-card">
                <h3>Communication</h3>
                <div className="sp-chips">
                  {profile.communication.map((c) => (
                    <Chip key={c} text={c} />
                  ))}
                </div>
              </div>
              <div className="sp-card">
                <h3>Accommodations</h3>
                <ul className="sp-list">
                  <li>Visual schedule on desk</li>
                  <li>Prefer front-row left seating</li>
                  <li>5-minute movement break every 30 mins</li>
                  <li>Noise-reduced environment during tests</li>
                </ul>
              </div>
              <div className="sp-card">
                <h3>Safety note</h3>
                <p className="sp-note">{profile.safetyNote}</p>
              </div>
            </div>
          )}

          {tab === Tab.Settings && (
            <div className="sp-settings">
              <div className="sp-settings-bar">
                <div className="sp-settings-title">Edit Profile</div>
                {!edit ? (
                  <button className="sp-btn" onClick={() => setEdit(true)}>Edit</button>
                ) : (
                  <div className="sp-settings-actions">
                    <button className="sp-btn ghost" onClick={handleResetProfile}>Reset</button>
                    <button className="sp-btn" onClick={handleSaveProfile}>Save</button>
                  </div>
                )}
              </div>

              <div className={`sp-form ${edit ? "editing" : ""}`}>
                <div className="sp-field">
                  <label>Name</label>
                  <input
                    disabled={!edit}
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="sp-field-grid">
                  <div className="sp-field">
                    <label>Age</label>
                    <input
                      disabled={!edit}
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="sp-field">
                    <label>Grade</label>
                    <input
                      disabled={!edit}
                      value={profile.gradeLevel}
                      onChange={(e) => setProfile((p) => ({ ...p, gradeLevel: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="sp-field">
                  <label>Guardian Email</label>
                  <input
                    disabled={!edit}
                    type="email"
                    value={profile.guardian.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, guardian: { ...p.guardian, email: e.target.value } }))
                    }
                  />
                </div>
                <div className="sp-field">
                  <label>Guardian Phone</label>
                  <input
                    disabled={!edit}
                    value={profile.guardian.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, guardian: { ...p.guardian, phone: e.target.value } }))
                    }
                  />
                </div>

                <div className="sp-switch-row">
                  <div>
                    <div className="sp-switch-title">Share progress with guardians</div>
                    <div className="sp-switch-sub">Weekly email summary</div>
                  </div>
                  <label className="sp-switch">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
