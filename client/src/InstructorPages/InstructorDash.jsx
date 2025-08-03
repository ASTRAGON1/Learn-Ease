import React, { useState } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import MetricsRow from "../components/MetricsRow";
import Notifications from "../components/Notifications";
import RainfallChart from "../components/RainfallChart";
import Footer from "../components/Footer";
import QuizResults from "../components/QuizResults";

import testPath from "../assets/testPath.png";
import community from "../assets/community.png";
import teachPic from "../assets/teachPic.png";
import performanceIcon from "../assets/performance.png";
import feedbackSupport from "../assets/feedback&support.png";

import "./InstructorDash.css";

export default function InstructorDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive]     = useState("course");
  const name                    = "Adolf"; // placeholder

  // sample data; swap with real backend data
  const sampleMetrics = [
    { label: "Content views",  value: "2,315", change: "+11.01%" },
    { label: "Profile visits", value: "1,032", change: "+1.01%" },
    { label: "Followers",      value: "300",   change: "+15.01%" },
    { label: "Engagement",     value: "600",   change: "-12.01%" },
  ];
  const sampleNotifs = [
    { icon: "👤", text: "New student followed you",      time: "59 minutes ago" },
    { icon: "🐞", text: "Bug fixed",                     time: "59 minutes ago" },
    { icon: "👍", text: "New student liked your video", time: "59 minutes ago" },
    { icon: "✅", text: "Admin approved your content",  time: "59 minutes ago" },
    { icon: "👁️", text: "1,000 students visited your page", time: "59 minutes ago" },
  ];

  // PERFORMANCE VIEW
  function PerformanceSection() {
    return (
      <div
        className="perf-container"
        style={{
          marginLeft: collapsed ? 95 : 370,
          paddingTop: 90,
        }}
      >
         <div className="perf-header">
          {/* 1) back link */}
          <Link to="/InstructorDash" className="dahsboard-back">
            ‹ Dashboard
          </Link>
          {/* 3) icons on the right */}
          <div className="perf-header-icons">
            <button className="icon-btn notifications">
              🔔
            </button>
            <div className="profile-circle" />
          </div>
        </div>


        {/* Metrics Row */}
        <div className="perf-metrics-row">
          {sampleMetrics.map((m, i) => (
            <div key={i} className="metric-card">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
              <span className="metric-change">{m.change}</span>
            </div>
          ))}
        </div>

        {/* Graph + Notifications */}
        <div className="perf-main-row">
          <div className="perf-graph-section">
            <div className="graph-card">
              {/* MUI BarChart */}
              <RainfallChart
                tickPlacement="middle"
                tickLabelPlacement="middle"
              />
            </div>
          </div>
          <Notifications items={sampleNotifs} />
        </div>
        <QuizResults />
      </div>
      
    );
  }

  return (
    <>
      <SidebarLayout
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        activeKey={active}
        onNavigate={setActive}
      />

      <main
        className="home-section"
        style={{
          marginLeft: collapsed ? 95 : 370,
          transition: "margin-left .25s",
          minHeight: "100vh",
          background: "#E4E9F7",
        }}
      >
        {/* COURSE DASHBOARD */}
        {active === "course" && (
          <div className="dash">
            <h1 className="dash-title">
              Welcome {name}, ready to teach?
            </h1>

            {/* Jump into course */}
            <div className="dash-row">
              <div className="jump-card">
                <span className="jump-text">
                  Jump Into Course Creation
                </span>
                <button className="btn-primary">
                  Create Your Course
                </button>
              </div>
            </div>

            {/* Helper sentence */}
            <div className="dash-row">
              <p className="hint">
                Based on the data gathered, we think those resources
                will be helpful.
              </p>
            </div>

            {/* AI card */}
            <div className="dash-row mt-50">
              <div className="ai-card">
                <h3 className="ai-title">
                  Generate quizzes using AI
                </h3>
                <p className="ai-desc">
                  Our AI-powered quiz tool helps you generate
                  personalized quizzes based on the curriculum you
                  follow on our platform — perfect for assessing
                  student progress quickly and effectively.
                </p>
                <button className="btn-primary sm">
                  Generate
                </button>
              </div>
            </div>

            {/* Two mini cards */}
            <div className="dash-grid">
              <div className="mini-card">
                <h4>Tip of the day</h4>
                <p>
                  Boost your teaching with daily strategies
                  tailored for students with autism and Down
                  syndrome. Practical, short, and easy to apply.
                </p>
              </div>
              <div className="mini-card">
                <h4>Community & Support</h4>
                <p>
                  Ask questions, share tips, and connect with other
                  instructors.
                </p>
                <button className="btn-primary sm">
                  Join Now
                </button>
              </div>
            </div>

            {/* Resources grid */}
            <div className="resources">
              <h3 className="resources-heading">
                Have questions? Here are our most popular
                instructor resources.
              </h3>
              <div className="res-grid">
                <Link to="/resources/test-video" className="res-item">
                  <img
                    src={testPath}
                    alt="Test Video"
                    className="res-icon"
                  />
                  <h5 className="res-title">Test Video</h5>
                  <p className="res-desc">
                    See how your videos gets treated
                  </p>
                </Link>

                <Link to="/resources/community" className="res-item">
                  <img
                    src={community}
                    alt="Community"
                    className="res-icon"
                  />
                  <h5 className="res-title">Community</h5>
                  <p className="res-desc">
                    Communicate with other instructors. Ask
                    questions, have discussions, and more.
                  </p>
                </Link>

                <Link to="/resources/how-to-teach" className="res-item">
                  <img
                    src={teachPic}
                    alt="How to teach"
                    className="res-icon"
                  />
                  <h5 className="res-title">
                    How to teach in LearnEase
                  </h5>
                  <p className="res-desc">
                    Learn how to use our platform to get the best
                    results and satisfy the students.
                  </p>
                </Link>

                <Link
                  to="/resources/performance"
                  className="res-item"
                >
                  <img
                    src={performanceIcon}
                    alt="Performance"
                    className="res-icon"
                  />
                  <h5 className="res-title">Performance</h5>
                  <p className="res-desc">
                    See how students like your contents, quiz
                    results analysis, and more.
                  </p>
                </Link>

                <Link
                  to="/resources/feedback-support"
                  className="res-item"
                >
                  <img
                    src={feedbackSupport}
                    alt="Feedback & Support"
                    className="res-icon"
                  />
                  <h5 className="res-title">
                    Feedback & Support
                  </h5>
                  <p className="res-desc">
                    Get feedback and support from students.
                  </p>
                </Link>
              </div>
            </div>

            {/* Final CTA */}
            <div className="final-cta">
              <p className="ready-text">
                Are You Ready to Begin?
              </p>
              <button className="btn4">
                Create Your Course
              </button>
            </div>
          </div>
        )}

        {/* PERFORMANCE DASHBOARD */}
        {active === "performance" && <PerformanceSection />}

        {/* OTHER PLACEHOLDERS */}
        {active === "curriculum" && <section style={{ height: 1 }} />}
        {active === "resources"  && <section style={{ height: 1 }} />}
      </main>

      <Footer />
    </>
  );
}
