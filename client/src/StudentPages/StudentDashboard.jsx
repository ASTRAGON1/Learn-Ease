import React, { useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import "./StudentDashboard.css";
import logo from "../assets/logo.png";
import quizPic from "../assets/quizpic.png";
import Footer from "../components/Footer"; // path OK for src/StudentPages -> src/components

export default function StudentDashboard() {
  // ---- Recommendation demo data (replace with real data) ----
  const recs = [
    {
      contentId: "SPEK101-05",
      title: "Asking for Help – Part 1",
      topic: "Communication",
      thumbnail: quizPic,
      watchPercent: 82,
      lastQuizScore: 42,
      quizId: "quiz-ask-help-1",
    },
    {
      contentId: "SPEK101-06",
      title: "Asking for Help – Part 2",
      topic: "Communication",
      thumbnail: quizPic,
      watchPercent: 67,
      lastQuizScore: 61,
      quizId: "quiz-ask-help-2",
    },
    {
      contentId: "SPEK101-02",
      title: "Recognizing Emotions – Basics",
      topic: "Emotions",
      thumbnail: quizPic,
      watchPercent: 94,
      lastQuizScore: 55,
      quizId: "quiz-emotions-1",
    },
  ];

  // ---- Recommendation handlers ----
  const recRowRef = useRef(null);
  const recScroll = (dir) => {
    if (!recRowRef.current) return;
    const amt = Math.min(360, recRowRef.current.clientWidth * 0.8);
    recRowRef.current.scrollBy({ left: dir * amt, behavior: "smooth" });
  };
  const rewatch = (id) => console.log("rewatch", id); // TODO: navigate()
  const retake = (id) => console.log("retake", id);   // TODO: navigate()

  return (
    <div className="sd-page">
      <main className="sd-main">
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

        {/* === RECOMMENDATION SECTION === */}
        <section className="sd-rec-sec">
          <div className="sd-rec-head">
            <h3>Improve from watched videos</h3>
            <span className="sd-rec-pill">based on low quiz scores</span>
          </div>

          <div className="sd-rec-container">
            <button
              className="sd-rec-nav left"
              aria-label="Previous"
              onClick={() => recScroll(-1)}
            >
              ‹
            </button>

            <div className="sd-rec-row" ref={recRowRef}>
              {recs
                .filter((x) => x.watchPercent >= 50 && x.lastQuizScore < 70)
                .sort((a, b) => a.lastQuizScore - b.lastQuizScore)
                .slice(0, 8)
                .map((i) => (
                  <div key={i.contentId} className="sd-rec-card">
                    <div className="sd-rec-thumb">
                      <img src={i.thumbnail} alt="" />
                      <span
                        className={`sd-rec-score ${
                          i.lastQuizScore <= 50 ? "bad" : "warn"
                        }`}
                      >
                        Last quiz: {i.lastQuizScore}%
                      </span>
                    </div>
                    <div className="sd-rec-meta">
                      <div className="sd-rec-title">{i.title}</div>
                      <div className="sd-rec-tag">{i.topic}</div>
                      <div className="sd-rec-progress">
                        <div style={{ width: `${i.watchPercent}%` }} />
                      </div>
                      <div className="sd-rec-watch">Watched {i.watchPercent}%</div>
                    </div>
                    <div className="sd-rec-actions">
                      <button
                        className="sd-rec-btn ghost"
                        onClick={() => rewatch(i.contentId)}
                      >
                        Rewatch
                      </button>
                      <button
                        className="sd-rec-btn primary"
                        onClick={() => retake(i.quizId)}
                      >
                        Retake quiz
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <button
              className="sd-rec-nav right"
              aria-label="Next"
              onClick={() => recScroll(1)}
            >
              ›
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
