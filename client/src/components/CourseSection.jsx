import React from "react";
import { Link } from "react-router-dom";
import testPath from "../assets/testPath.png";
import community from "../assets/community.png";
import teachPic from "../assets/teachPic.png";
import performanceIcon from "../assets/performance.png";
import feedbackSupport from "../assets/feedback&support.png";
import "../InstructorPages/InstructorDash.css";

export default function CourseSection({ name }) {
  return (
    <div className="dash">
      <h1 className="dash-title">Welcome {name}, ready to teach?</h1>

      <div className="dash-row">
        <div className="jump-card">
          <span className="jump-text">Upload your content here</span>
          <Link to="/InstructorUpload" className="InstructorDash-btn-primary">Let's dive in</Link>
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
          <Link to="/ai-quiz" className="InstructorDash-btn-primary sm">Generate</Link>
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
          <Link to="/InstructorCommunity" className="InstructorDash-btn-primary sm">Join Now</Link>
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
  );
}

