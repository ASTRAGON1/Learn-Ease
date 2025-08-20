// CoursePlayer.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CoursePlayer.css";

// one image const
const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop";
const courseInfo = {
  title: "Learn C Fast | Start Coding Quickly | Master The Fundamentals of C",
  rating: 4.4,
  ratingsCount: 3291,
  students: 97018,
  total: "3 hours",
  updated: "May 2021",
  language: "English",
  captions: "English [Auto]",
};

/* tiny icons */
function Star() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3l-6.2 3.4 1.2-6.9L2 8.9l7-1 3-6 3 6 7 1-5 4.9 1.2 6.9z"/></svg>); }
function Users() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M22 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2"/></svg>); }
function Globe() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" stroke="currentColor" strokeWidth="2"/></svg>); }
function UpdateIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 10-3.1 6.8" stroke="currentColor" strokeWidth="2"/><path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2"/></svg>); }
const announcements = [
  {
    id: 1,
    author: "Ali",
    avatar: "https://i.pravatar.cc/40?img=12",
    timeAgo: "4 years ago",
    title: "My GymX software!",
    body: `Hello dear students!  
I hope you are doing well.

I created a Gym management system and I would like you to see it and help me share it. Please share it with your friends and nearby gyms and tell them to share it with nearby gyms.

Here is the youtube link: https://youtu.be/y-CEi891lfw

Thanks a lot!  
Happy programming!`,
    comments: 9,
  },
];
const reviewsMeta = {
  average: 4.4,
  distribution: { 5: 42, 4: 38, 3: 15, 2: 3, 1: 2 }, // percentages
};

function Stars({ value=5, size=14, color="#c06700" }) {
  return (
    <span style={{ display:"inline-flex", gap:4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
             fill={i < value ? color : "none"} stroke={color} strokeWidth="2">
          <path d="M12 17.3l-6.2 3.4 1.2-6.9L2 8.9l7-1 3-6 3 6 7 1-5 4.9 1.2 6.9z"/>
        </svg>
      ))}
    </span>
  );
}

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { id } = useParams(); // e.g. SPEK101

  const [openIds, setOpenIds] = useState(new Set([]));
  const [playhead, setPlayhead] = useState(5); // seconds (demo)
  const [activeTab, setActiveTab] = useState("overview");

  const sections = useMemo(
    () => [
      {
        id: "sec-1",
        title: "Get Started",
        duration: "1 Hour",
        lessonsCount: 5,
        lessons: [
          { id: "l1", title: "Welcome & overview", time: "05:00", done: true },
          { id: "l2", title: "Setup & tools", time: "12:10", done: false },
          { id: "l3", title: "Project brief", time: "08:40", done: false },
        ],
      },
      {
        id: "sec-2",
        title: "Illustrator Structuros",
        duration: "2 Hour",
        lessonsCount: 3,
        lessons: [
          { id: "l4", title: "Lorem ipsum dolor sit amet", time: "65:00", done: true },
          { id: "l5", title: "Lorem ipsum dolor", time: "25:00", done: false },
          { id: "l6", title: "Lorem ipsum dolor sit amet", time: "30:00", done: false },
        ],
      },
      {
        id: "sec-3",
        title: "Using Illustrator",
        duration: "1 Hour",
        lessonsCount: 4,
        lessons: [
          { id: "l7", title: "Workspace tour", time: "09:30", done: false },
          { id: "l8", title: "Shapes & paths", time: "13:40", done: false },
        ],
      },
      {
        id: "sec-4",
        title: "What is Pandas?",
        duration: "12:54",
        lessonsCount: 5,
        lessons: [{ id: "l9", title: "Series vs DataFrame", time: "12:54", done: false }],
      },
      {
        id: "sec-5",
        title: "Work with Numpy",
        duration: "58:00",
        lessonsCount: 3,
        lessons: [{ id: "l10", title: "Arrays 101", time: "18:20", done: false }],
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const all = sections.flatMap((s) => s.lessons);
    const done = all.filter((l) => l.done).length;
    return { done, total: all.length };
  }, [sections]);

  function toggle(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Inline styles for tabs (scoped)
  const tabsSx = {
    wrap: {
      display: "flex",
      position: "relative",
      gap: 8,
      marginTop: 14,
      background: "#fff",
      border: "1px solid rgba(0,0,0,.08)",
      borderRadius: 12,
      padding: 4,
    },
    tab: (on) => ({
      flex: 1,
      background: "transparent",
      border: "none",
      padding: "10px 12px",
      cursor: "pointer",
      fontWeight: 600,
      color: on ? "#0f172a" : "#6b7280",
      borderRadius: 10,
    }),
    underline: {
      position: "absolute",
      left: 4,
      top: 4,
      bottom: 4,
      width: "calc((100% - 8px)/3)",
      background: "rgba(124,92,255,.12)",
      border: "1px solid rgba(124,92,255,.35)",
      borderRadius: 10,
      transition: "transform .25s ease",
      pointerEvents: "none",
    },
    panel: {
      background: "#fff",
      border: "1px solid rgba(0,0,0,.08)",
      borderRadius: 12,
      padding: 14,
      marginTop: 10,
      lineHeight: 1.5,
    },
    bullets: { margin: "6px 0 0 16px" },
  };

  return (
    <div className="cp-page">
      <div className="cp-shell">
        {/* LEFT: player */}
        <section className="cp-player">
          <header className="cp-topbar">
            <button
              className="cp-icon-btn"
              aria-label="Back"
              onClick={() => navigate("/student-dashboard")}
            >
              <ArrowLeft />
            </button>

            <div className="cp-title-wrap">
              <h1 className="cp-title">{id ? `${id} Course Player` : "Course Player"}</h1>
            </div>

            <button className="cp-icon-btn" aria-label="Settings">
              <Gear />
            </button>
          </header>

          <div className="cp-media">
            <img src={SAMPLE_IMAGE} alt="Classroom" />
            <button className="cp-play" aria-label="Play/Pause">
              <Play />
            </button>

            <div className="cp-controls">
              <span className="cp-time">0:{String(playhead).padStart(2, "0")}</span>
              <input
                className="cp-seek"
                type="range"
                min="0"
                max="100"
                value={playhead}
                onChange={(e) => setPlayhead(Number(e.target.value))}
              />
              <span className="cp-time">03:26</span>
            </div>
          </div>

          {/* TABS UNDER VIDEO */}
          <nav role="tablist" aria-label="Course sections" style={tabsSx.wrap}>
            <button
              role="tab"
              aria-selected={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              style={tabsSx.tab(activeTab === "overview")}
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "announcements"}
              onClick={() => setActiveTab("announcements")}
              style={tabsSx.tab(activeTab === "announcements")}
            >
              Announcements
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
              style={tabsSx.tab(activeTab === "reviews")}
            >
              Reviews
            </button>
            <span
              style={{
                ...tabsSx.underline,
                transform:
                  activeTab === "overview"
                    ? "translateX(0%)"
                    : activeTab === "announcements"
                    ? "translateX(100%)"
                    : "translateX(200%)",
              }}
            />
          </nav>

          <div style={tabsSx.panel}>
           {activeTab === "overview" && (
  <div>
    <h2 style={{margin:"0 0 10px", fontSize: "28px", lineHeight: 1.2}}>
      {courseInfo.title}
    </h2>

    <div style={{display:"flex", gap:"28px", flexWrap:"wrap", marginBottom:16}}>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <Star/><strong>{courseInfo.rating}</strong>
        <span style={{color:"#6b7280"}}>· {courseInfo.ratingsCount.toLocaleString()} ratings</span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <Users/><strong>{courseInfo.students.toLocaleString()}</strong>
        <span style={{color:"#6b7280"}}>Students</span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <Clock/><strong>{courseInfo.total}</strong>
        <span style={{color:"#6b7280"}}>Total</span>
      </div>
    </div>

    <div style={{display:"grid", rowGap:8, color:"#0f172a"}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <UpdateIcon/><span>Last updated <strong>{courseInfo.updated}</strong></span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <Globe/><span>{courseInfo.language} · {courseInfo.captions}</span>
      </div>
    </div>
  </div>
)}

           {activeTab === "announcements" && (
  <div>
    {announcements.map((a) => (
      <div key={a.id} style={{marginBottom:24, borderBottom:"1px solid #eee", paddingBottom:16}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
          <img src={a.avatar} alt={a.author} style={{width:36, height:36, borderRadius:"50%"}}/>
          <div>
            <a href="#" style={{fontWeight:600, color:"#6b46c1"}}>{a.author}</a>
            <div style={{fontSize:13, color:"#6b7280"}}>posted an announcement · {a.timeAgo}</div>
          </div>
        </div>

        <h3 style={{margin:"8px 0", fontSize:18}}>{a.title}</h3>
        <p style={{whiteSpace:"pre-line", marginBottom:12}}>{a.body}</p>

        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{width:32, height:32, borderRadius:"50%", background:"#111", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12}}>AH</div>
          <input placeholder="Enter your comment" style={{flex:1, padding:"6px 10px", border:"1px solid #ccc", borderRadius:6}}/>
        </div>

        <a href="#" style={{fontSize:13, color:"#6b46c1", marginTop:6, display:"inline-block"}}>
          Show comments ({a.comments})
        </a>
      </div>
    ))}
  </div>
)}

{activeTab === "reviews" && (
  <div>
    {/* Student feedback header */}
    <h3 style={{ fontSize:24, margin:"0 0 16px" }}>Student feedback</h3>

    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:24, alignItems:"center" }}>
      {/* Left: average */}
      <div>
        <div style={{ fontSize:64, color:"#c06700", lineHeight:1 }}>{reviewsMeta.average}</div>
        <div style={{ margin:"4px 0" }}><Stars value={4} size={18} /></div>
        <div style={{ color:"#c06700", fontWeight:700 }}>Course Rating</div>
      </div>

      {/* Right: distribution bars */}
      <div style={{ display:"grid", gap:10 }}>
        {[5,4,3,2,1].map(stars => {
          const pct = reviewsMeta.distribution[stars] || 0;
          return (
            <div key={stars} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", alignItems:"center", gap:12 }}>
              {/* bar */}
              <div style={{ height:10, background:"#e5e7eb", borderRadius:8, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:"#9aa0b4" }} />
              </div>
              <Stars value={stars} />
              <a href="#" style={{ color:"#6b46c1", fontSize:14 }}>{pct}%</a>
            </div>
          );
        })}
      </div>
    </div>

    {/* Reviews list header */}
    <h3 style={{ fontSize:24, margin:"28px 0 12px" }}>Reviews</h3>

    {/* Search + filter row */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 44px 220px", gap:12 }}>
      <input placeholder="Search reviews"
             style={{ padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8 }} />
      <button aria-label="Search"
              style={{ border:"none", borderRadius:8, background:"#6d28d9", color:"#fff", display:"grid", placeItems:"center" }}>
        🔍
      </button>
      <select defaultValue="all"
              style={{ padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8 }}>
        <option value="all">All ratings</option>
        <option value="5">5 stars</option>
        <option value="4">4 stars</option>
        <option value="3">3 stars</option>
        <option value="2">2 stars</option>
        <option value="1">1 star</option>
      </select>
    </div>
  </div>
)}

          </div>
        </section>

        {/* RIGHT: contents */}
        <aside className="cp-sidebar">
          <div className="cp-card">
            <div className="cp-card-head">
              <h3>Course Contents</h3>
              <button className="cp-icon-btn cp-sm" aria-label="Calendar">
                <Calendar />
              </button>
            </div>

            <div className="cp-head-progress">
              <span className="cp-head-text">
                {stats.done}/{stats.total} COMPLETED
              </span>
              <div className="cp-head-bar">
                <div
                  style={{
                    width: `${(stats.done / Math.max(1, stats.total)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="cp-accordion cp-pill">
              {sections.map((sec, sIdx) => {
                const open = openIds.has(sec.id);
                return (
                  <div key={sec.id} className={`cp-acc-item ${open ? "cp-open" : ""}`}>
                    <div className="cp-acc-summary">
                      <div className="cp-sum-left">
                        <span className="cp-sum-title">{sec.title}</span>
                        <span className="cp-sum-sub">
                          <Clock /> {sec.duration}
                        </span>
                      </div>
                      <div className="cp-sum-right">
                        <span className="cp-sum-badge">{sec.lessonsCount} Lessons</span>
                        <button
                          className="cp-chev-btn"
                          aria-label={open ? "Collapse section" : "Expand section"}
                          aria-expanded={open}
                          onClick={() => toggle(sec.id)}
                        >
                          <Chevron open={open} />
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className="cp-acc-panel">
                        {sec.lessons.map((l, i) => {
                          const locked = !l.done && i > 0 && sIdx > 0; // demo rule
                          return (
                            <div key={l.id} className={`cp-lesson cp-row ${locked ? "cp-locked" : ""}`}>
                              <span className="cp-row-num">{i + 1}.</span>
                              <span className={`cp-check ${l.done ? "cp-on" : ""}`}>
                                {l.done ? <Check /> : null}
                              </span>
                              <span className="cp-l-title">{l.title}</span>
                              <span className="cp-spacer" />
                              <span className="cp-l-time">{l.time}</span>
                              {locked && (
                                <span className="cp-lock">
                                  <LockIcon />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ======= tiny SVG icons ======= */
function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Gear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 003 15.4 1.65 1.65 0 001.5 14H1a2 2 0 010-4h.09A1.65 1.65 0 003 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 015.44 3.9l.06.06A1.65 1.65 0 007.32 4.3H7.4A1.65 1.65 0 009 3.5V3a2 2 0 014 0v.09a1.65 1.65 0 001.51 1 1.65 1.65 0 001.82-.33l.06-.06A2 2 0 0119.1 5.44l-.06.06a1.65 1.65 0 00-.33 1.82V7.4A1.65 1.65 0 0020.5 9H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Play() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function Calendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function Clock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function Chevron({ open }) {
  return (
    <svg
      className={`cp-chev ${open ? "cp-up" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
