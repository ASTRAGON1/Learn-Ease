import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./PersonalizedPath.css";
import brand from "../assets/simpleLogo.png";

const cx = ({ isActive }) => "sb-btn" + (isActive ? " active" : "");

function Sidebar() {
  return (
    <aside className="qz-sb">
      <Link to="/personalized" className="sb-brand" aria-label="Home">
        <img src={brand} alt="LearnEase" />
      </Link>

      {/* Cap icon = this page */}
      <NavLink to="/personalized" end className={cx} aria-label="Personalized Path">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M2 10l10-5 10 5-10 5L2 10z" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 12v5c0 .6 3 3 6 3s6-2.4 6-3v-5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>

      {/* Other placeholders */}
      <NavLink to="/messages" className={cx} aria-label="Messages">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" stroke="currentColor" strokeWidth="2"/></svg>
      </NavLink>

      <NavLink to="/live" className={cx} aria-label="Live">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 8a10 10 0 0120 0M5 10a7 7 0 0114 0M8 12a4 4 0 018 0" stroke="currentColor" strokeWidth="2"/></svg>
      </NavLink>

      <div className="sb-spacer" />
      <Link to="/profile" className="sb-user" aria-label="Profile">😊</Link>
    </aside>
  );
}

export default function PersonalizedPath() {
  const stats = [
    { id: "s1", icon: "📚", label: "courses", value: "3/7" },
    { id: "s2", icon: "🧪", label: "quizzes", value: "30/70" },
    { id: "s3", icon: "🧩", label: "prototypes", value: "2" },
    { id: "s4", icon: "⏱", label: "hours learning", value: "2" },
  ];
  const enrolled = [
    { id: "c1", title: "Basic of English Language", progress: 30, badge: "" },
    { id: "c2", title: "Introduction to web development", progress: 10, badge: "" },
    { id: "c3", title: "Basic data-structure and algorithm", progress: 100, badge: "Completed" },
    { id: "c4", title: "Lorem ipsum codor le hala madrid", progress: 85, badge: "" },
  ];
  const featured = [
    { id: "f1", lessons: 5, quizzes: 4, title: "Nibh consectetur leo", desc: "A, sed lectus id rutrum pharetra." },
    { id: "f2", lessons: 5, quizzes: 4, title: "Ultrices facilisis", desc: "Tristique senectus et netus et." },
  ];

  return (
    <div className="pp-layout">
      <Sidebar />

      <div className="pp-content">
        <header className="pp-top">
          <h1>Personalized Path</h1>
          <div className="pp-search">
            <input placeholder="search" />
            <button aria-label="search" className="icon-btn">🔍</button>
          </div>
        </header>

        <div className="pp-grid">
          {/* MAIN */}
          <main className="pp-main">
            {/* Progress */}
            <section className="pp-card pp-progress">
              <div className="pp-progress-head">
                <span>Progress</span>
                <span className="pp-tag">Beginner</span>
              </div>

              <div className="pp-track">
                <div className="pp-clouds">☁️ ☁️</div>
                <div className="pp-trees">🌳 🌳 🌳</div>
                <div className="pp-rail">
                  <div className="pp-rail-fill" style={{ width: "30%" }} />
                  <span className="pp-rail-dot" style={{ left: "30%" }}>30%</span>
                </div>
                <div className="pp-runner">🏃‍♂️</div>
                <div className="pp-trophy">🏆</div>
              </div>
            </section>

            {/* Status */}
            <section className="pp-card pp-status">
              {stats.map(s => (
                <div key={s.id} className="pp-status-item">
                  <div className="pp-status-icon">{s.icon}</div>
                  <div className="pp-status-text">
                    <div className="pp-status-value">{s.value}</div>
                    <div className="pp-status-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* Enrolled + COURSE CATALOG -> /courses */}
            <section>
              <div className="pp-sec-head">
                <h3>Enrolled Courses</h3>
                <Link to="/courses" className="pp-btn primary">
                  <span>📖</span> COURSE CATALOG
                </Link>
              </div>

              <div className="pp-list">
                {enrolled.map(c => (
                  <article key={c.id} className="pp-row">
                    <div className="pp-row-icon">🎓</div>
                    <div className="pp-row-body">
                      <div className="pp-row-title">{c.title}</div>
                      <div className="pp-row-meta">
                        <span>Progress</span>
                        <div className="pp-mini-bar"><div style={{ width: `${c.progress}%` }} /></div>
                      </div>
                    </div>
                    <div className="pp-row-ops">
                      {c.badge && <span className="pp-badge">{c.badge}</span>}
                      <button className="pp-chip">View Certificate</button>
                      <div className="pp-dots">⋯</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          {/* ASIDE */}
          <aside className="pp-aside">
            <section className="pp-card pp-calendar">
              <div className="pp-cal-head"><strong>Sept 2023</strong><div className="pp-cal-nav">‹ ›</div></div>
              <div className="pp-due">
                <div className="pp-due-icon">🌀</div>
                <div className="pp-due-body">
                  <div className="pp-due-title">Due Date</div>
                  <div className="pp-due-date">Oct 02, 2023</div>
                  <p className="pp-due-desc">Nisi, venenatis id cursus volutpat cursus interdum enim mauris.</p>
                </div>
              </div>
            </section>

            <section className="pp-card pp-featured">
              <h3>Featured</h3>
              <div className="pp-feature-list">
                {featured.map(f => (
                  <article key={f.id} className="pp-feature-item">
                    <div className="pp-feature-meta"><span>{f.lessons} lessons</span> • <span>{f.quizzes} quizzes</span></div>
                    <div className="pp-feature-title">{f.title}</div>
                    <p className="pp-feature-desc">{f.desc}</p>
                    <div className="pp-author">👤 Shams Tabrez</div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
