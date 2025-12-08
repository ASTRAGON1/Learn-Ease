import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import logo from "../assets/logo.png";
import quizPic from "../assets/quizpic.png";
import Footer from "../components/Footer";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);

  // demo recs
  const recs = [
    { contentId: "SPEK101-05", title: "Asking for Help – Part 1", topic: "Communication", thumbnail: quizPic, watchPercent: 82, lastQuizScore: 42, quizId: "quiz-ask-help-1" },
    { contentId: "SPEK101-06", title: "Asking for Help – Part 2", topic: "Communication", thumbnail: quizPic, watchPercent: 67, lastQuizScore: 61, quizId: "quiz-ask-help-2" },
    { contentId: "SPEK101-02", title: "Recognizing Emotions – Basics", topic: "Emotions", thumbnail: quizPic, watchPercent: 94, lastQuizScore: 55, quizId: "quiz-emotions-1" },
  ];

  // demo quizzes for cards
  const quizzes = [
    {
      id: "q1",
      title: "Speaking Quiz 2",
      courseName: "Communication Basics",
      instructor: "Jane Doe",
      status: "upcoming", // upcoming | missed | graded
      date: "Aug 15, 10:00",
      duration: "20 mins",
      grade: null,
      scorePct: null,
      badgeClass: "upcoming",
      primaryAction: { label: "Join", kind: "primary" },
    },
    {
      id: "q2",
      title: "Speaking Quiz 2",
      courseName: "Speech Practice",
      instructor: "Ali Ben",
      status: "missed",
      date: "Aug 11, 10:00",
      duration: "20 mins",
      grade: "0/10",
      scorePct: null,
      badgeClass: "missed",
      primaryAction: { label: "Retake", kind: "warn" },
    },
    {
      id: "q3",
      title: "Speaking Quiz 2",
      courseName: "Public Speaking",
      instructor: "Nadia K.",
      status: "graded",
      date: "Aug 5, 10:00",
      duration: "20 mins",
      grade: "8.6/10",
      scorePct: 86,
      badgeClass: "graded",
      primaryAction: { label: "View Report", kind: "primary" },
    },
  ];

  const statusLabel = (s) =>
    s === "upcoming" ? "Upcoming" : s === "graded" ? "Graded" : "Missed";

  const recRowRef = useRef(null);
  const recScroll = (dir) => {
    if (!recRowRef.current) return;
    const amt = Math.min(360, recRowRef.current.clientWidth * 0.8);
    recRowRef.current.scrollBy({ left: dir * amt, behavior: "smooth" });
  };

  // Scroll detection for chatbot animation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleChatbotClick = () => {
    // You can navigate to a chatbot page or open a modal here
    console.log("Chatbot clicked");
    // Example: navigate("/chatbot") or setChatOpen(true)
  };

  return (
    <div className="sd-page">
      <main className="sd-main">
        {/* NAVBAR */}
        <header className="sd-nav-wrap">
          <div className="sd-nav">
            <Link to="/" className="sd-nav-brand">
              <img src={logo} alt="LearnEase Logo" className="sd-nav-logo-img" />
            </Link>

            <nav className="sd-nav-links">
              <Link to="/courses" className="sd-nav-link">Courses</Link>
              <Link to="/quiz-information" className="sd-nav-link active">Quizzes</Link>
              <Link to="/achievements" className="sd-nav-link">Achievement</Link>
              <Link to="/personalized" className="sd-nav-link">Personalized path</Link>
            </nav>

<div className="sd-nav-right">
  {/* Hover popover */}
  <div className="sd-bell-wrap">
    <button className="sd-nav-bell" aria-label="Notifications" type="button">🔔</button>

    <div className="sd-bell-pop" role="status">
      <div className="sd-bell-pop-head">Notifications</div>
      <ul className="sd-bell-list">
        <li className="t-quiz">
          <span className="dot" />
          <div>
            <div className="t">Quiz alert: Speaking Quiz starts soon</div>
            <div className="s">Today • 10:00</div>
          </div>
        </li>
        <li className="t-course">
          <span className="dot" />
          <div>
            <div className="t">Course reminder: finish “Emotion Recognition”</div>
            <div className="s">Due tomorrow</div>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <Link to="/StudentProfile" className="sd-nav-avatar-link">
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
              <div className="sd-progress"><div className="sd-progress-fill" style={{ width: "50%" }} /></div>
              <span className="sd-progress-text">50% Complete</span>
            </div>
            <div className="sd-course-action">
              <button
                className="sd-join-btn"
                onClick={() => navigate("/course/SPEK101")}
              >
                Join Now <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* QUIZZES */}
        <section className="qz-wrap">
          <div className="qz-head">
            <h2>Quizzes</h2>
            <Link className="qz-link" to="/quiz-information">View all</Link>
          </div>

          <div className="qz-grid">
            {quizzes.map((q) => (
              <div key={q.id} className="qz-card">
                <div className="qz-media">
                  <img src={quizPic} alt="" />
                  <span className={`qz-badge ${q.badgeClass}`}>
                    {q.status === "upcoming" && "⏳ "}
                    {q.status === "missed" && "⚠️ "}
                    {q.status === "graded" && "✅ "}
                    {statusLabel(q.status)}
                  </span>

                  {q.status === "graded" && q.scorePct != null && (
                    <div className="qz-score">
                      <div
                        className="qz-score-ring"
                        style={{
                          background: `conic-gradient(var(--ok) ${Math.round(
                            (q.scorePct / 100) * 360
                          )}deg, #e9e5ff 0)`,
                        }}
                      >
                        <span>{q.scorePct}%</span>
                      </div>
                      <small>Score</small>
                    </div>
                  )}
                </div>

                <div className="qz-body">
                  <h4 className="qz-title">{q.title}</h4>
                  <div className="qz-meta">
                    <span>🗓 {q.date}</span>
                    <span className="qz-dot">•</span>
                    <span>⏱ {q.duration}</span>
                  </div>
                </div>

                <div className="qz-actions">
                  <button
                    className="qz-btn ghost"
                    onClick={() => setOpenId((id) => (id === q.id ? null : q.id))}
                  >
                    {openId === q.id ? "Close" : "Details"}
                  </button>
                   {q.status === "missed" ? (
    // Only Retake navigates to /quiz
    <Link to="/quiz" className="qz-btn warn">Retake</Link>
  ) : (
    // Join / View Report do NOT navigate
    <button className="qz-btn disabled" aria-disabled="true">
      {q.primaryAction.label}
    </button>
  )}
</div>
                {/* In-card details widget */}
<div className={`qz-details ${openId === q.id ? "show" : ""}`}>
  <button
    className="qz-back-btn"
    onClick={() => setOpenId(null)}
    aria-label="Close details"
  >
    ← 
  </button>
  <h5 className="qz-d-title">Quiz Details</h5>
  <div className="qz-d-grid">
    <div className="qz-kv"><span className="qz-k">Course:</span><span className="qz-v">{q.courseName}</span></div>
    <div className="qz-kv"><span className="qz-k">Instructor:</span><span className="qz-v">{q.instructor}</span></div>
    <div className="qz-kv"><span className="qz-k">Status:</span><span className={`qz-v tag ${q.badgeClass}`}>{statusLabel(q.status)}</span></div>
    <div className="qz-kv"><span className="qz-k">Schedule:</span><span className="qz-v">{q.date} • {q.duration}</span></div>
    {q.status === "graded" && (
      <div className="qz-kv"><span className="qz-k">Grade:</span><span className="qz-v">{q.grade}</span></div>
    )}
    {q.status === "missed" && (
      <div className="qz-kv"><span className="qz-k">Grade:</span><span className="qz-v">0/10</span></div>
    )}
  </div>
</div>

              </div>
            ))}
          </div>
        </section>

        {/* RECOMMENDATIONS */}
        <section className="sd-rec-sec">
          <div className="sd-rec-head">
            <h3>Improve from watched videos</h3>
            <span className="sd-rec-pill">based on low quiz scores</span>
          </div>

          <div className="sd-rec-container">
            <button className="sd-rec-nav left" aria-label="Prev" onClick={() => recScroll(-1)}>‹</button>
            <div className="sd-rec-row" ref={recRowRef}>
              {recs.map((i) => (
                <div key={i.contentId} className="sd-rec-card">
                  <div className="sd-rec-thumb">
                    <img src={i.thumbnail} alt="" />
                    <span className={`sd-rec-score ${i.lastQuizScore <= 50 ? "bad" : "warn"}`}>Last quiz: {i.lastQuizScore}%</span>
                  </div>
                  <div className="sd-rec-meta">
                    <div className="sd-rec-title">{i.title}</div>
                    <div className="sd-rec-tag">{i.topic}</div>
                    <div className="sd-rec-progress"><div style={{ width: `${i.watchPercent}%` }} /></div>
                    <div className="sd-rec-watch">Watched {i.watchPercent}%</div>
                  </div>
                  <div className="sd-rec-actions">
                    <Link className="sd-rec-btn ghost" to="/CoursePlayer">Rewatch</Link>
                    <Link to="/quiz" className="sd-rec-btn primary">Retake quiz</Link>
                  </div>
                </div>
              ))}
            </div>
            <button className="sd-rec-nav right" aria-label="Next" onClick={() => recScroll(1)}>›</button>
          </div>
        </section>
      </main>

      {/* AI Assistant Chatbot Icon */}
      <div 
        className={`ai-chatbot-icon ${scrollDirection}`}
        onClick={handleChatbotClick}
        role="button"
        tabIndex={0}
        aria-label="AI Assistant"
      >
        <div className="ai-chatbot-icon-inner">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="ai-chatbot-svg"
          >
            {/* Robot Head */}
            <rect 
              x="4" 
              y="6" 
              width="16" 
              height="14" 
              rx="2" 
              fill="currentColor"
            />
            {/* Antenna */}
            <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
            <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Eyes */}
            <circle cx="9" cy="11" r="1.5" fill="white"/>
            <circle cx="15" cy="11" r="1.5" fill="white"/>
            {/* Eye glow effect */}
            <circle cx="9" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            <circle cx="15" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            {/* Mouth */}
            <rect x="9" y="15" width="6" height="2" rx="1" fill="white"/>
            {/* Decorative elements */}
            <circle cx="7" cy="9" r="0.5" fill="white" opacity="0.6"/>
            <circle cx="17" cy="9" r="0.5" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div className="ai-chatbot-pulse"></div>
      </div>

      <Footer />
    </div>
  );
}
