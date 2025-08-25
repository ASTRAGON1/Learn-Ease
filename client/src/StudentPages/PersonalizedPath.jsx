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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 10l10-5 10 5-10 5L2 10z" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 12v5c0 .6 3 3 6 3s6-2.4 6-3v-5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>

      {/* Other placeholders */}
      <NavLink to="/messages" className={cx} aria-label="Messages">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>

      <NavLink to="/live" className={cx} aria-label="Live">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 8a10 10 0 0120 0M5 10a7 7 0 0114 0M8 12a4 4 0 018 0" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </NavLink>

      <div className="sb-spacer" />
      <Link to="/profile" className="sb-user" aria-label="Profile">😊</Link>
    </aside>
  );
}

function EnrolledRow({ title, progress, badge }) {
  return (
    <article className="pp-row">
      <div className="pp-row-icon" aria-hidden="true">🎓</div>
      <div className="pp-row-body">
        <div className="pp-row-title">{title}</div>
        <div className="pp-row-meta">
          <div className="pp-mini-bar"><div style={{ width: `${progress}%` }} /></div>
        </div>
      </div>
      <div className="pp-row-ops">
        {badge ? <span className="pp-badge">{badge}</span> : null}
        <button className="pp-chip" type="button">View Certificate</button>
        <button className="pp-dots" type="button" aria-label={`More options for ${title}`}>⋯</button>
      </div>
    </article>
  );
}

function PersonalizedPath() {
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

  return (
    <div className="pp-layout">
      <Sidebar />

      <div className="pp-content">
        <header className="pp-top">
          <h1>Personalized Path</h1>
          <label className="sr-only" htmlFor="pp-search">Search</label>
          <div className="pp-search">
            <input id="pp-search" placeholder="search" />
          </div>
        </header>

        <div className="pp-grid">
          {/* MAIN */}
          <main className="pp-main">
            {/* PROGRESS (UI version) */}
            <section className="pp-card ui-progress">
              <div className="ui-progress-top">
                <span className="ui-progress-title">Progress</span>
                <span className="ui-level-pill">Beginner</span>
              </div>
              <div className="ui-scene">
                <div className="ui-bar">
                  <div className="ui-bar-fill" style={{ width: "30%" }} />
                  <span className="ui-bar-badge" style={{ left: "30%" }}>30%</span>
                </div>
                <div className="ui-runner" style={{ left: "30%" }} aria-hidden>🏃‍♂️</div>
                <div className="ui-trophy" aria-hidden>🏆</div>
              </div>
            </section>

            {/* ALL STATUS */}
            <h3 className="ui-subhead">All Status</h3>
            <section className="pp-card ui-status">
              <div className="ui-status-grid">
                <div className="ui-tile">
                  <div className="ui-ico">📚</div>
                  <div className="ui-num">3/7</div>
                  <div className="ui-label">courses</div>
                </div>
                <div className="ui-tile">
                  <div className="ui-ico">🧪</div>
                  <div className="ui-num">30/70</div>
                  <div className="ui-label">quizzes</div>
                </div>
                <div className="ui-tile">
                  <div className="ui-ico">🧩</div>
                  <div className="ui-num">2</div>
                  <div className="ui-label">prototypes</div>
                </div>
                <div className="ui-tile">
                  <div className="ui-ico">⏱</div>
                  <div className="ui-num">2</div>
                  <div className="ui-label">hours learning</div>
                </div>
              </div>
            </section>

            {/* Enrolled */}
            <section>
              <div className="pp-sec-head">
                <h3>Enrolled Courses</h3>
                <Link to="/courses" className="pp-btn primary">
                  <span>📖</span> COURSE CATALOG
                </Link>
              </div>

              <div className="pp-list">
                {enrolled.map(c => (
                  <EnrolledRow key={c.id} title={c.title} progress={c.progress} badge={c.badge} />
                ))}
              </div>
            </section>
          </main>
{/* ASIDE */} <aside className="pp-aside"> {/* Calendar */} <section className="pp-card pp-calendar"> <div className="pp-cal-head"> <strong>Sept 2023</strong> <div className="pp-cal-nav"> <button aria-label="Prev month" className="pp-cal-btn"><span aria-hidden>‹</span></button> <button aria-label="Next month" className="pp-cal-btn"><span aria-hidden>›</span></button> </div> </div> <div className="pp-cal-week"> <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span> <span>Fri</span><span>Sat</span><span>Sun</span> </div> <div className="pp-cal-days"> <button className="muted">26</button> <button className="muted">27</button> <button className="muted">28</button> <button className="muted">29</button> <button className="pp-cal-day active">30</button> <button>01</button> <button>02</button> </div> <div className="pp-due-card"> <div className="pp-due-left">🎓</div> <div className="pp-due-right"> <div className="pp-due-title">Assignment 04</div> <div className="pp-due-row"> <span>📅</span><span>Oct 02, 2023</span> </div> <p> Speacking 04 assignment</p> </div> </div> </section> <section className="pp-featured"> <h3>Featured</h3> {/* LIGHT CARD */} <article className="pp-feature-card light"> <div className="pp-feature-head"> <div className="pp-ficon">🎓</div> <div className="pp-feature-meta">5 lessons • 4 quizzes</div> </div> <h4 className="pp-feature-title faint">It was truly an elite achievement, completed</h4> <p className="pp-feature-desc big"> Everyone engaged and worked together in a wise and steady way </p> <div className="pp-feature-footer"> <span className="pp-author-ico">👤</span> <span className="pp-author-name">Shams Tabrez</span> </div> {/* optional illustration */} <img className="pp-feature-illus" src="/illustrations/feat1.png" alt="" aria-hidden="true" /> </article> {/* DARK CARD */} <article className="pp-feature-card dark"> <div className="pp-feature-head"> <div className="pp-ficon">🎓</div> <div className="pp-feature-meta">5 lessons • 4 quizzes</div> </div> <h4 className="pp-feature-title">A little dedicated effort.</h4> <p className="pp-feature-desc big"> Focused learning that builds skills and knowledge step by step </p> <div className="pp-feature-footer"> <span className="pp-author-ico">🟨</span> <span className="pp-author-name">Shams Tabrez</span> </div> <img className="pp-feature-illus" src="/illustrations/feat2.png" alt="" aria-hidden="true" /> </article> </section> </aside> </div> </div> </div> ); }

// ✅ Add these two lines at the very end
export { Sidebar };
export default PersonalizedPath;
