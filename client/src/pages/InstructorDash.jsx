import React, { useState } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import testPath from "../assets/testPath.png";
import community from "../assets/community.png";
import teachPic from "../assets/teachPic.png";
import performance from "../assets/performance.png";
import feedbackSupport from "../assets/feedback&support.png";
import Footer from "../components/Footer";
import "./InstructorDash.css";

export default function InstructorDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState("course");
  const name = "Adolf"; // placeholder
return (
    <>
  <SidebarLayout
  collapsed={collapsed}
  onToggleCollapsed={() => setCollapsed((v) => !v)}
  activeKey={active}
  onNavigate={setActive}
  />

  <main className="home-section" style={{ marginLeft: collapsed ? 95 : 370, transition: "margin-left .25s", minHeight: "100vh", background: "#E4E9F7", }}>
    
    {/* everything "content" */}
    <div className="dash">
      <h1 className="dash-title">Welcome {name}, ready to teach?</h1>

      {/* Jump into course card row (1454 x 167) */}
      <div className="dash-row">
        <div className="jump-card">
        <span className="jump-text">Jump Into Course Creation</span>
        <button className="btn-primary">Create Your Course</button>
        </div>
      </div>

      {/* Helper sentence (24px regular, centered within 1454 width) */}
      <div className="dash-row">
        <p className="hint">
        Based on the data gathered, we think those resources will be helpful.
        </p>
      </div>

      {/* AI card (1454 wide) */}
      <div className="dash-row mt-50">
        <div className="ai-card">
        <h3 className="ai-title">Generate quizzes using AI</h3>
        <p className="ai-desc">
        Our AI-powered quiz tool helps you generate personalized quizzes based on the curriculum you follow on our
        platform — perfect for assessing student progress quickly and effectively.
        </p>
        <button className="btn-primary sm">Generate</button>
        </div>
      </div>

      {/* Two cards row (702×264 each, 50px gap) */}
      <div className="dash-grid">
        <div className="mini-card">
          <h4>Tip of the day</h4>
          <p>Boost your teaching with daily strategies tailored for students with autism and Down syndrome. Practical, short, and easy to apply.</p>
        </div>
        <div className="mini-card">
          <h4>Community & Support</h4>
          <p>Ask questions, share tips, and connect with other instructors.</p>
          <button className="btn-primary sm">Join Now</button>
        </div>
      </div>

      {/* ressources */}
      <div className="resources">
        <h3 className="resources-heading">Have questions? Here are our most popular instructor resources.</h3>
        <div className="res-grid">
          <Link to="/resources/test-video" className="res-item">
            <img src={testPath} alt="Test Video" className="res-icon" />
            <h5 className="res-title">Test Video</h5>
            <p className="res-desc">See how your videos gets treated</p>
          </Link>

          <Link to="/resources/community" className="res-item">
            <img src={community} alt="Community" className="res-icon" />
            <h5 className="res-title">community</h5>
            <p className="res-desc">Communicate with other instructors. Ask questions, have discussions, and more.</p>
          </Link>

          <Link to="/resources/how-to-teach" className="res-item">
            <img src={teachPic} alt="How to teach in LearnEase" className="res-icon" />
            <h5 className="res-title">How to teach in LearnEase</h5>
            <p className="res-desc">Learn how to use our platform to get the best results and satisfy the students.</p>
          </Link>

          <Link to="/resources/performance" className="res-item">
            <img src={performance} alt="Performance" className="res-icon" />
            <h5 className="res-title">Performance</h5>
            <p className="res-desc">See how students like your contents, quiz results analysis, and other.</p>
          </Link>

          <Link to="/resources/feedback-support" className="res-item">
            <img src={feedbackSupport} alt="Feedback and Support" className="res-icon" />
            <h5 className="res-title">Feedback and Support</h5>
            <p className="res-desc">Get feedback and support from students.</p>
          </Link>
        </div> {/* Ressources grid*/}
      </div> {/* Ressources */}

      {/* are you ready to teach */}
      <div className="final-cta">
      <p className="ready-text">Are You Ready to Begin?</p>
      <button className="btn4">Create Your Course</button>
      </div>
    </div> {/* Dash */}

    {/*Placeholders for next sections */}
    {active === "course" && <section style={{ height: 1 }} />}
    {active === "performance" && <section style={{ height: 1 }} />}
    {active === "curriculum" && <section style={{ height: 1 }} />}
    {active === "resources" && <section style={{ height: 1 }} />}
  </main>

  {/* Full-width footer */}
  <Footer />
    </>
  );
}
