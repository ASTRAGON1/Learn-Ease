import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./CoursePlayer.css";

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [expandedLessons, setExpandedLessons] = useState(new Set(["lesson-1"]));

  const courseData = {
    title: "Public Speaking and Leadership",
    lessons: 6,
    duration: "3h 25min",
    rating: 4.8,
    reviews: 86,
    currentLesson: "Lesson 1. Introduction to Public Speaking and Leadership"
  };

  const topics = [
    { time: "0:00", title: "Introduction to Public Speaking" },
    { time: "2:34", title: "The Importance of Public Speaking" },
    { time: "5:12", title: "Building Confidence" },
    { time: "8:45", title: "Understanding Your Audience" },
    { time: "12:20", title: "Structuring Your Speech" }
  ];

  const lessons = [
    {
      id: "lesson-1",
      title: "01. Introduction to Public Speaking and Leadership",
      duration: "40 min",
      expanded: true,
      subLessons: [
        { title: "Overview of public speaking", duration: "8 min" },
        { title: "Effective communication", duration: "15 min" },
        { title: "Personal leadership assessment", duration: "11 min" },
        { title: "Understanding audience dynamics", duration: "6 min" }
      ]
    },
    {
      id: "lesson-2",
      title: "02. Foundations of Public Speaking",
      duration: "36 min",
      expanded: false
    },
    {
      id: "lesson-3",
      title: "03. Creating clear and engaging messages",
      duration: "24 min",
      expanded: false
    },
    {
      id: "lesson-4",
      title: "04. Mastering Non-Verbal Communication",
      duration: "55 min",
      expanded: false
    },
    {
      id: "lesson-5",
      title: "05. Persuasion Techniques in Public Speaking",
      duration: "32 min",
      expanded: false
    },
    {
      id: "lesson-6",
      title: "06. Advanced Speaking Techniques",
      duration: "18 min",
      expanded: false
    }
  ];

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  return (
    <div className="cp-page-new">
      {/* Left Sidebar */}
      <aside className="cp-sidebar-new">
        <Link to="/student-dashboard-2" className="cp-sidebar-icon active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
        </Link>
        <Link to="/quiz-information" className="cp-sidebar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </Link>
        <Link to="/achievements" className="cp-sidebar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </Link>
        <Link to="/personalized" className="cp-sidebar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="cp-main-new">
        {/* Top Header */}
        <header className="cp-header-new">
          <div className="cp-header-left">
            <h1 className="cp-welcome">
              Welcome to <span className="cp-brand">LearnEase</span>
            </h1>
          </div>
          <div className="cp-header-center">
            <div className="cp-search-container">
              <input 
                type="text" 
                placeholder="Search" 
                className="cp-search-input"
              />
              <button className="cp-search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="cp-header-right">
            <button className="cp-notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div className="cp-profile">
              <div className="cp-profile-avatar">KV</div>
              <div className="cp-profile-info">
                <div className="cp-profile-name">Kacie Velasquez</div>
                <div className="cp-profile-username">@k_velasquez</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="cp-content-new">
          {/* Breadcrumbs */}
          <nav className="cp-breadcrumbs">
            <Link to="/student-dashboard-2">My courses</Link>
            <span className="cp-breadcrumb-separator">/</span>
            <span>{courseData.title}</span>
            <span className="cp-breadcrumb-separator">/</span>
            <span>{courseData.currentLesson}</span>
          </nav>

          {/* Course Title with Back Button */}
          <div className="cp-course-header">
            <button className="cp-back-btn" onClick={() => navigate("/student-dashboard-2")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>
            <h2 className="cp-course-title">{courseData.title}</h2>
          </div>

          {/* Course Badges */}
          <div className="cp-badges">
            <div className="cp-badge-item">
              <span className="cp-badge-value">{courseData.lessons}</span>
              <span className="cp-badge-label">lessons</span>
            </div>
            <div className="cp-badge-item">
              <span className="cp-badge-value">{courseData.duration}</span>
            </div>
            <div className="cp-badge-item">
              <span className="cp-badge-value">{courseData.rating}</span>
              <span className="cp-badge-label">({courseData.reviews} reviews)</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="cp-content-grid">
            {/* Left: Video and Tabs */}
            <div className="cp-left-content">
              {/* Video Player */}
              <div className="cp-video-container">
                <div className="cp-video-thumbnail">
                  <img 
                    src="https://images.unsplash.com/photo-1543269664-7eef42226a21?w=800&h=450&fit=crop" 
                    alt="Course video"
                  />
                  <button className="cp-play-button">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="cp-tabs">
                <button 
                  className={`cp-tab ${activeTab === "description" ? "active" : ""}`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button 
                  className={`cp-tab ${activeTab === "materials" ? "active" : ""}`}
                  onClick={() => setActiveTab("materials")}
                >
                  Materials
                </button>
                <button 
                  className={`cp-tab ${activeTab === "hometask" ? "active" : ""}`}
                  onClick={() => setActiveTab("hometask")}
                >
                  Home task
                </button>
              </div>

              {/* Tab Content */}
              <div className="cp-tab-content">
                {activeTab === "description" && (
                  <div>
                    <p className="cp-description-text">
                      Public speaking is one of the most important and most dreaded forms of communication. 
                      In this course, you'll learn how to overcome your fear of public speaking and deliver 
                      powerful presentations that engage and inspire your audience.
                    </p>
                    <div className="cp-topics-list">
                      {topics.map((topic, index) => (
                        <div key={index} className="cp-topic-item">
                          <span className="cp-topic-time">{topic.time}</span>
                          <span className="cp-topic-title">{topic.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "materials" && (
                  <div>
                    <p>Course materials will be available here.</p>
                  </div>
                )}
                {activeTab === "hometask" && (
                  <div>
                    <p>Home task assignments will be available here.</p>
                  </div>
                )}
              </div>

              {/* Share Lesson */}
              <div className="cp-share-section">
                <Link to="#" className="cp-share-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  Share lesson
                </Link>
              </div>
            </div>

            {/* Right: Lesson List */}
            <aside className="cp-lessons-sidebar">
              <div className="cp-lessons-list">
                {lessons.map((lesson) => {
                  const isExpanded = expandedLessons.has(lesson.id);
                  return (
                    <div key={lesson.id} className={`cp-lesson-item ${isExpanded ? "expanded" : ""}`}>
                      <div 
                        className="cp-lesson-header"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        <div className="cp-lesson-info">
                          <div className="cp-lesson-title">{lesson.title}</div>
                          <div className="cp-lesson-duration">{lesson.duration}</div>
                        </div>
                        <button className="cp-expand-btn">
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </button>
                      </div>
                      {isExpanded && lesson.subLessons && (
                        <div className="cp-sublessons">
                          {lesson.subLessons.map((subLesson, index) => (
                            <div key={index} className="cp-sublesson-item">
                              <span className="cp-sublesson-title">{subLesson.title}</span>
                              <span className="cp-sublesson-duration">{subLesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}