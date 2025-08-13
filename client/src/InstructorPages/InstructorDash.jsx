import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import MetricsRow from "../components/MetricsRow";
import Notifications from "../components/Notifications";
import RainfallChart from "../components/RainfallChart";
import Footer from "../components/Footer";
import QuizResults from "../components/QuizResults";
import RankingAndTags from "../components/RankingAndTags";
import CurriculumSection from "../components/CurriculumSection";

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

  const sampleMetrics = [
    { label: "Content views",  value: "2,315", change: "+11.01%" },
    { label: "Profile visits", value: "1,032", change: "+1.01%" },
    { label: "Followers",      value: "300",   change: "+15.01%" },
    { label: "Engagement",     value: "600",   change: "-12.01%" },
  ];
  const sampleNotifs = [
    { type: "follow",   text: "New student followed you",        time: "59 minutes ago" },
    { type: "bug",      text: "Bug fixed",                       time: "59 minutes ago" },
    { type: "like",     text: "New student liked your video",    time: "59 minutes ago" },
    { type: "approve",  text: "Admin approved your content",     time: "59 minutes ago" },
    { type: "visit",    text: "1,000 students visited your page", time: "59 minutes ago" },
    { type: "follow",   text: "New student followed you",        time: "59 minutes ago" },
    { type: "bug",      text: "Bug fixed",                       time: "59 minutes ago" },
    { type: "like",     text: "New student liked your video",    time: "59 minutes ago" },
    { type: "approve",  text: "Admin approved your content",     time: "59 minutes ago" },
    { type: "visit",    text: "1,000 students visited your page", time: "59 minutes ago" },
  ];

  const instructors = [
    { id:1, name:"Alice", likes:2500 },
    { id:2, name:"Bob",   likes:2400 },
    { id:3, name:"Carol", likes:2300 },
    { id:4, name:"Dave",  likes:2200 },
    { id:5, name:"Eve",   likes:2100 },
    { id:6, name:"Frank", likes:2000 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
    { id:25,name:"You",   likes: 123 },
  ];
  const categories = [
    { tag:"Listening", pct:100 },
    { tag:"Reading",   pct:60  },
    { tag:"Writing",   pct:80  },
    { tag:"Recognizing",pct:0 },
    { tag:"Memorizing", pct:50 },
  ];

  function PerformanceSection() {
    return (
      <div
        className="perf-container"
        style={{ marginLeft: collapsed ? 0 : 0, paddingTop: 60 }}
      >
        <div className="perf-header">
          <Link to="/InstructorDash" className="dahsboard-back">‹ Dashboard</Link>
        </div>

        <div className="perf-metrics-row">
          {sampleMetrics.map((m, i) => (
            <div key={i} className="metric-card">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
              <span className="metric-change">{m.change}</span>
            </div>
          ))}
        </div>

        <div className="perf-main-row">
          <div className="perf-graph-section">
            <div className="graph-card">
              <RainfallChart tickPlacement="middle" tickLabelPlacement="middle" />
            </div>
          </div>
          <Notifications items={sampleNotifs} />
        </div>

        <QuizResults />
        <RankingAndTags instructors={instructors} categories={categories} />

        <div className="improve-section">
          <h2 className="title-improvement">Improve yourself to get better results!</h2>
          <button className="improve-btn">Teaching center</button>
        </div>
      </div>
    );
  }

  function CurriculumWrapper() {
    return (
      <div className="perf-container" style={{ marginLeft: collapsed ? 94 : 370, paddingTop: 60 }}>
        <Link to="/InstructorDash" className="dahsboard-back">‹ Dashboard</Link>
        <CurriculumSection />
      </div>
    );
  }

  function ResourcesSection() {
    const items = [
      { title: "Teaching Center",       img: teachPic,  link: "/TeachingCenter", paragraph: "Find articles on LearnEase teaching — from course creation to marketing."},
      { title: "Instructor Community",  img: community,  link: "/Community", paragraph: "Share your progress and ask other instructors questions in our community."},
      { title: "Help and support",      img: feedbackSupport,    link: "/HelpAndSupport", paragraph: "Can’t find what you need? Our support team is happy to help." },
    ];

    return (
      <div className="res-section">
        <h2 className="res-section-title">Resources</h2>
        <div className="res-cards">
          {items.map((it) => (
            <Link key={it.title} to={it.link} className="res-card">
              <img src={it.img} alt={it.title} className="res-card-img" />
              <h4 className="res-card-title">{it.title}</h4>
              <p className="res-card-paragraph">{it.paragraph}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dash-root">
      <SidebarLayout
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        activeKey={active}
        onNavigate={setActive}
      />

      <main className="dash-home">
        {active === "course" && (
          <div className="dash">
            <h1 className="dash-title">Welcome {name}, ready to teach?</h1>

            <div className="dash-row">
              <div className="jump-card">
                <span className="jump-text">Jump Into Course Creation</span>
                <Link to="/InstructorUpload" className="btn-primary">Create Your Course</Link>
              </div>
            </div>

            <div className="dash-row">
              <p className="hint">
                Based on the data gathered, we think those resources
                will be helpful.
              </p>
            </div>

            <div className="dash-row mt-50">
              <div className="ai-card">
                <h3 className="ai-title">Generate quizzes using AI</h3>
                <p className="ai-desc">
                  Our AI-powered quiz tool helps you generate
                  personalized quizzes based on the curriculum you
                  follow on our platform — perfect for assessing
                  student progress quickly and effectively.
                </p>
                <Link to="/ai-quiz" className="btn-primary sm">Generate</Link>
              </div>
            </div>

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
                <p>Ask questions, share tips, and connect with other instructors.</p>
                <Link to="/InstructorCommunity" className="btn-primary sm">Join Now</Link>


              </div>
            </div>

            <div className="resources">
              <h3 className="resources-heading">
                Have questions? Here are our most popular instructor resources.
              </h3>

              <div className="res-grid">
                <Link to="/teachingCenter" className="res-item">
                  <img src={testPath} alt="Test Video" className="res-icon" />
                  <h5 className="res-title">Test Video</h5>
                  <p className="res-desc">See how your videos gets treated</p>
                </Link>

                <Link to="/InstructorCommunity" className="res-item">
                  <img src={community} alt="Community" className="res-icon" />
                  <h5 className="res-title">Community</h5>
                  <p className="res-desc">
                    Communicate with other instructors. Ask questions, have discussions, and more.
                  </p>
                </Link>

                <Link to="/teachingCenter" className="res-item">
                  <img src={teachPic} alt="How to teach" className="res-icon" />
                  <h5 className="res-title">How to teach in LearnEase</h5>
                  <p className="res-desc">
                    Learn how to use our platform to get the best results and satisfy the students.
                  </p>
                </Link>

                <Link to="/InstructorDash" className="res-item">
                  <img src={performanceIcon} alt="Performance" className="res-icon" />
                  <h5 className="res-title">Performance</h5>
                  <p className="res-desc">
                    See how students like your contents, quiz results analysis, and more.
                  </p>
                </Link>
                <Link to="/HelpAndSupport" className="res-item">
                  <img src={feedbackSupport} alt="Feedback & Support" className="res-icon" />
                  <h5 className="res-title">Feedback & Support</h5>
                  <p className="res-desc">Get feedback and support from students.</p>
                </Link>
              </div>
            </div>

            <div className="final-cta">
              <p className="ready-text">Are You Ready to Begin?</p>
              <Link to="/InstructorUpload" className="btn4">Create Your Course</Link>
            </div>
          </div>
        )}

        {active === "performance" && <PerformanceSection />}
        {active === "curriculum" && <CurriculumSection />}
        {active === "resources"  && <ResourcesSection />}
      </main>

      <Footer />
    </div>
  );
}
