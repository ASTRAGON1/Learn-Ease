import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./StudentDashboard.css";
import logo from "../assets/logo.png";

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
        <div className="sd-progress-fill" style={{ width: "50%" }}></div>
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

    </div>
  );
}

