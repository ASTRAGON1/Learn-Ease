// CoursePlayer.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CoursePlayer.css";

const sampleImage =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop";

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { id } = useParams(); // e.g. SPEK101

  // start closed; open what you want by listing ids here
  const [openIds, setOpenIds] = useState(new Set([]));
  const [playhead, setPlayhead] = useState(5); // seconds (demo)

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

  return (
    <div className="cp-page">
      <div className="cp-shell">
        {/* LEFT: player */}
        <section className="cp-player">
          <header className="cp-topbar">
            <button
              className="icon-btn"
              aria-label="Back"
              onClick={() => navigate("/student-dashboard")}
            >
              <ArrowLeft />
            </button>

            <div className="cp-title-wrap">
              <h1 className="cp-title">{id ? `${id} Course Player` : "Course Player"}</h1>
              <p className="cp-meta">9 Lesson&nbsp;&nbsp; 6h 30min</p>
            </div>

            <button className="icon-btn" aria-label="Settings">
              <Gear />
            </button>
          </header>

          <div className="cp-media">
            <img src={sampleImage} alt="Classroom" />
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
        </section>

        {/* RIGHT: contents */}
        <aside className="cp-sidebar">
          <div className="card">
            <div className="card-head">
              <h3>Course Contents</h3>
              <button className="icon-btn sm" aria-label="Calendar">
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

            <div className="cp-accordion pill">
              {sections.map((sec, sIdx) => {
                const open = openIds.has(sec.id);
                return (
                  <div key={sec.id} className={`cp-acc-item ${open ? "open" : ""}`}>
                    <div className="cp-acc-summary">
                      <div className="sum-left">
                        <span className="sum-title">{sec.title}</span>
                        <span className="sum-sub">
                          <Clock /> {sec.duration}
                        </span>
                      </div>
                      <div className="sum-right">
                        <span className="sum-badge">{sec.lessonsCount} Lessons</span>
                        <button
                          className="chev-btn"
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
                            <div
                              key={l.id}
                              className={`cp-lesson row ${locked ? "locked" : ""}`}
                            >
                              <span className="row-num">{i + 1}.</span>
                              <span className={`check ${l.done ? "on" : ""}`}>
                                {l.done ? <Check /> : null}
                              </span>
                              <span className="l-title">{l.title}</span>
                              <span className="spacer" />
                              <span className="l-time">{l.time}</span>
                              {locked && <LockIcon />}
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
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
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
function Dot() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 8 8"
      fill="currentColor"
      style={{ opacity: 0.9 }}
    >
      <circle cx="4" cy="4" r="3.5" />
    </svg>
  );
}
function Chevron({ open }) {
  return (
    <svg
      className={`chev ${open ? "up" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 15l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
function Question() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9a2.5 2.5 0 115 0c0 2-2.5 1.5-2.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}
function Badge({ children }) {
  return <span className="badge">{children}</span>;
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
