import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./StudentDashboard.css";
import logo from "../assets/logo.png";
import quizPic from "../assets/quizpic.png"; 

export default function StudentDashboard() {
  return (
    <div className="sd-page">
      {/* NAVBAR */}
      <header className="sd-nav-wrap">
        <div className="sd-nav">
          {/* Left: logo */}
          <Link to="/" className="sd-nav-brand">
            <img src={logo} alt="LearnEase Logo" className="sd-nav-logo-img" />
          </Link>

          {/* Center: links */}
          <nav className="sd-nav-links">
            <NavLink to="/courses" className="sd-nav-link">Courses</NavLink>
            <NavLink to="/quizzes" className="sd-nav-link">Quizzes</NavLink>
            <NavLink to="/achievement" className="sd-nav-link">Achievement</NavLink>
            <NavLink to="/personalized" className="sd-nav-link">Personalized path</NavLink>
          </nav>

          {/* Right: icons */}
          <div className="sd-nav-right">
            <button className="sd-nav-bell" aria-label="Notifications">🔔</button>
            <Link to="/profile" className="sd-nav-avatar-link">
              <div className="sd-nav-avatar" />
            </Link>
          </div>
        </div>
      </header>

      {/* TOP SECTION */}
      <section className="sd-hero">
        <h2 className="sd-welcome">Welcome back, ready for your next lesson?</h2>
        <div className="sd-course-card">
          <div className="sd-course-info">
            <span className="sd-course-label">ONLINE COURSE</span>
            <h3 className="sd-course-title">Speaking I - SPEK101</h3>
            <div className="sd-progress">
              <div className="sd-progress-fill" style={{ width: "50%" }} />
            </div>
            <span className="sd-progress-text">50% Complete</span>
          </div>
          <div className="sd-course-action">
            <button className="sd-join-btn">
              Join Now <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* === QUIZZES SECTION === */}
      <section className="qz-wrap">
        <div className="qz-head">
          <h2>Quizzes</h2>
          <button className="qz-link">View all</button>
        </div>

        <div className="qz-grid">
          {/* Card 1 - Upcoming */}
          <div className="qz-card">
            <div className="qz-media">
              <img src={quizPic} alt="Speaking Quiz 2" />
              <span className="qz-badge upcoming">⏳ Upcoming</span>
            </div>
            <div className="qz-body">
              <h4 className="qz-title">Speaking Quiz 2</h4>
              <div className="qz-meta">
                <span className="qz-meta-item">🗓 August 15, 10:00 AM</span>
                <span className="qz-dot">•</span>
                <span className="qz-meta-item">⏱ 20 mins</span>
              </div>
            </div>
            <div className="qz-actions">
              <button className="qz-btn ghost">Details</button>
              <button className="qz-btn">Join</button>
            </div>
          </div>

          {/* Card 2 - Missed */}
          <div className="qz-card">
            <div className="qz-media">
              <img src={quizPic} alt="Speaking Quiz 2" />
              <span className="qz-badge missed">⚠️ Missed</span>
            </div>
            <div className="qz-body">
              <h4 className="qz-title">Speaking Quiz 2</h4>
              <div className="qz-meta">
                <span className="qz-meta-item">🗓 August 11, 10:00 AM</span>
                <span className="qz-dot">•</span>
                <span className="qz-meta-item">⏱ 20 mins</span>
              </div>
            </div>
            <div className="qz-actions">
              <button className="qz-btn ghost">Details</button>
              <button className="qz-btn warn">Retake</button>
            </div>
          </div>

          {/* Card 3 - Graded */}
          <div className="qz-card">
            <div className="qz-media">
              <img src={quizPic} alt="Speaking Quiz 2" />
              <span className="qz-badge graded">✅ Graded</span>
              <div className="qz-score">
                <div
                  className="qz-score-ring"
                  style={{ background: "conic-gradient(var(--ok) 310deg, #e9e5ff 0)" }}
                >
                  <span>86%</span>
                </div>
                <small>Score</small>
              </div>
            </div>
            <div className="qz-body">
              <h4 className="qz-title">Speaking Quiz 2</h4>
              <div className="qz-meta">
                <span className="qz-meta-item">🗓 August 5, 10:00 AM</span>
                <span className="qz-dot">•</span>
                <span className="qz-meta-item">⏱ 20 mins</span>
              </div>
            </div>
            <div className="qz-actions">
              <button className="qz-btn ghost">Details</button>
              <button className="qz-btn">View Report</button>
            </div>
          </div>
        </div>

        <div className="qz-more">
          <button className="qz-btn lg">Check More</button>
        </div>
      </section>
    </div>
  );
  /* ---- Repeat (Low Score) Section - inline, no extra file ---- */
function RepeatSection() {
  // demo data – replace with your real completed items w/ low scores
  const items = [
    { id: "r1", type: "Course", title: "Speaking I — Lesson 3", mins: 18, lastScore: 56, img: quizPic },
    { id: "r2", type: "Video",  title: "Emotion Matching Basics", mins: 9, lastScore: 62, img: quizPic },
    { id: "r3", type: "Quiz",   title: "Recognize Emotions Quiz", mins: 10, lastScore: 58, img: quizPic },
    { id: "r4", type: "Course", title: "Asking for Help – Part 1", mins: 22, lastScore: 61, img: quizPic },
    { id: "r5", type: "Video",  title: "Facial Expressions Drill", mins: 7, lastScore: 59, img: quizPic },
  ];

  const visible = 3; // 3 cards per view (CSS responsive handles smaller screens)
  const [idx, setIdx] = React.useState(0);
  const maxIdx = Math.max(0, items.length - visible);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(maxIdx, i + 1));

  // basic swipe
  const startX = React.useRef(0);
  const delta = React.useRef(0);
  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove  = (e) => { delta.current = e.touches[0].clientX - startX.current; };
  const onTouchEnd   = () => {
    if (delta.current < -40) next();
    if (delta.current >  40) prev();
    delta.current = 0;
  };

  return (
    <section className="rep-wrap">
      <div className="rep-head">
        <h2>Repeat These</h2>
        <span className="rep-sub">Suggested due to low recent quiz averages</span>
      </div>

      <div className="rep-carousel">
        <button className="rep-arrow left" onClick={prev} disabled={idx===0} aria-label="Previous">←</button>

        <div
          className="rep-viewport"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="rep-track" style={{ transform:`translateX(-${idx * (100/visible)}%)` }}>
            {items.map(it => (
              <article className="rep-card" key={it.id}>
                <div className="rep-media">
                  <img src={it.img} alt={it.title} />
                  <span className="rep-chip">{it.type}</span>
                  <span className="rep-score">Last: {it.lastScore}%</span>
                </div>

                <div className="rep-body">
                  <h4 className="rep-title">{it.title}</h4>
                  <div className="rep-meta">
                    <span>{it.mins} mins</span>
                    <span className="rep-dot">•</span>
                    <span className="rep-tip">AI: strengthen weak topics</span>
                  </div>

                  <div className="rep-actions">
                    <button className="rep-btn">Repeat</button>
                    <button className="rep-btn ghost">Details</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button className="rep-arrow right" onClick={next} disabled={idx===maxIdx} aria-label="Next">→</button>
      </div>
    </section>
  );
}
/* ---- end Repeat Section ---- */

}
