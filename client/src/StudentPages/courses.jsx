import React, { useMemo, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Courses.css";
import cover from "../assets/quizpic.png";
import brand from "../assets/simpleLogo.png";

/* ---- demo data ---- */
const DATA = [
  { id: "c1", title: "Speaking I", desc: "Build basic speaking confidence.", author: "Shams Tabrez", lessons: 12, quizzes: 7, category: "Speaking",   level: "Beginner",    cover, featured: true  },
  { id: "c2", title: "Emotion Recognition", desc: "Understand expressions and tone.", author: "Shams Tabrez", lessons: 5,  quizzes: 4, category: "Emotions",   level: "Beginner",    cover, featured: false },
  { id: "c3", title: "Conversation Skills", desc: "Practice daily dialogs.", author: "Shams Tabrez", lessons: 6,  quizzes: 5, category: "Speaking",   level: "Intermediate", cover, featured: true  },
  { id: "c4", title: "Vocabulary Builder", desc: "Grow your word bank fast.", author: "Shams Tabrez", lessons: 8,  quizzes: 4, category: "Vocabulary", level: "All",         cover, featured: false },
  { id: "c5", title: "Listening Drills", desc: "Sharpen your ears.", author: "Shams Tabrez", lessons: 5,  quizzes: 3, category: "Listening",  level: "All",         cover, featured: false },
  { id: "c6", title: "Public Speaking Basics", desc: "Present with clarity.", author: "Shams Tabrez", lessons: 7,  quizzes: 4, category: "Speaking",   level: "Beginner",    cover, featured: true  },
];

/* ---------- sidebar ---------- */
const linkClass = ({ isActive }) => "sb-btn" + (isActive ? " active" : "");

function Sidebar() {
  return (
    <aside className="qz-sb">
      {/* Logo -> Personalized Path hub */}
      <Link to="/personalized" className="sb-brand" aria-label="Home">
        <img src={brand} alt="LearnEase" />
      </Link>

      <NavLink to="/personalized" className={linkClass} aria-label="Personalized Path">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M2 10l10-5 10 5-10 5L2 10z" stroke="currentColor" strokeWidth="2" />
          <path d="M6 12v5c0 .6 3 3 6 3s6-2.4 6-3v-5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </NavLink>

      <NavLink to="/ideas" className={linkClass} aria-label="Ideas">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 18h6M10 21h4M12 3a7 7 0 00-4 12c.7.7 1 1.5 1 3h6c0-1.5.3-2.3 1-3a7 7 0 00-4-12z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </NavLink>

      <NavLink to="/messages" className={linkClass} aria-label="Messages">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </NavLink>

      <NavLink to="/live" className={linkClass} aria-label="Live">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M2 8a10 10 0 0120 0M5 10a7 7 0 0114 0M8 12a4 4 0 018 0" stroke="currentColor" strokeWidth="2" />
        </svg>
      </NavLink>

      <div className="sb-spacer" />
      <Link to="/profile" className="sb-user" aria-label="Profile">😊</Link>
    </aside>
  );
}

/* ---------- course card ---------- */
function CourseCard({ item }) {
  return (
    <article className={`crs-card ${item.featured ? "dark" : ""}`}>
      <div className="crs-cover">
        <img src={item.cover} alt="" />
        {item.featured && <span className="crs-pill">Featured</span>}
      </div>

      <div className="crs-body">
        <h3 className="crs-title">{item.title}</h3>
        <p className="crs-desc">{item.desc}</p>

        <div className="crs-meta">
          <span>{item.lessons} lessons</span>
          <span className="dot">•</span>
          <span>{item.quizzes} quizzes</span>
        </div>

        <div className="crs-footer">
          <div className="crs-author">👤 {item.author}</div>
          <div className="crs-level">
            {item.category} • {item.level}
          </div>
        </div>

        <div className="crs-actions-row">
          <button className="crs-btn ghost">Details</button>
          <button className="crs-btn primary">Enroll</button>
        </div>
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function Courses({ embedded = false, onBack }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");

  // Build tags safely (trim categories)
  const tags = useMemo(() => {
    const cats = Array.from(new Set(DATA.map(d => (d.category || "").trim())));
    return ["All", ...cats];
  }, []);

  // Filter with trimmed category + search term
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DATA.filter(d => {
      const cat = (d.category || "").trim();
      const okTag = tag === "All" || cat === tag;
      const okText =
        term === "" ||
        d.title.toLowerCase().includes(term) ||
        d.desc.toLowerCase().includes(term);
      return okTag && okText;
    });
  }, [q, tag]);

  return (
    <div className={embedded ? "crs-embedded" : "qz-layout"}>
      {!embedded && <Sidebar />}

      <div className="qz-content">
        <div className="crs-page">
          <header className="crs-head">
            <div>
              <h1>Course Catalog</h1>
              <p className="crumbs">My Courses / catalog</p>
            </div>

            <div className="crs-actions">
              {embedded && (
                <button
                  className="icon-btn back"
                  aria-label="Back"
                  onClick={() => onBack?.()}
                  title="Back"
                >
                  ←
                </button>
              )}
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search"
                className="crs-search"
              />
              <button className="icon-btn" aria-label="Search">🔍</button>
            </div>
          </header>

          <div className="crs-tags">
            {tags.map((t) => (
              <button
                key={t}
                className={`crs-tag ${tag === t ? "active" : ""}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <section className="crs-grid">
            {list.map((item) => (
              <CourseCard key={item.id} item={item} />
            ))}
            {!list.length && (
              <div className="crs-empty">No courses match your search.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
