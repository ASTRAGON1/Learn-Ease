import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./CoursePlayer.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [expandedLessons, setExpandedLessons] = useState(new Set(["lesson-1"]));
  const [passedQuizzesExpanded, setPassedQuizzesExpanded] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      // First, try to get from sessionStorage (set during login)
      const storage = window.sessionStorage;
      const storedName = storage.getItem("userName");
      const storedEmail = storage.getItem("userEmail");
      const token = storage.getItem("token");

      if (storedName) {
        setStudentName(storedName);
      }
      if (storedEmail) {
        setStudentEmail(storedEmail);
      }

      // Try to fetch from API if token is available
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/students/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const student = data.data || data;
            
            if (student.name || student.fullName) {
              setStudentName(student.name || student.fullName);
            }
            if (student.email) {
              setStudentEmail(student.email);
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
          // If API fails, use sessionStorage data (already set above)
        }
      }
    };

    fetchStudentData();
  }, []);

  const courseData = {
    title: "Public Speaking and Leadership",
    lessons: 6,
    duration: "3h 25min",
    rating: 4.8,
    reviews: 86,
    currentLesson: "Lesson 1. Introduction to Public Speaking and Leadership",
    progress: 25 // percentage of course completed
  };

  // Course completion achievements
  const courseAchievements = [
    {
      id: "ach-1",
      title: "Course Completion",
      description: "Complete all lessons in this course",
      icon: "trophy",
      unlocked: courseData.progress === 100,
      progress: courseData.progress,
      badge: "gold"
    },
    {
      id: "ach-2",
      title: "Quiz Master",
      description: "Pass all quizzes with 80% or higher",
      icon: "award",
      unlocked: false,
      progress: 0,
      badge: "platinum"
    },
    {
      id: "ach-3",
      title: "Perfect Attendance",
      description: "Complete all lessons without skipping",
      icon: "star",
      unlocked: false,
      progress: courseData.progress,
      badge: "gold"
    }
  ];

  // Quiz data - passed and upcoming quizzes
  const quizzes = [
    {
      id: "quiz-1",
      title: "Introduction to Public Speaking Quiz",
      lesson: "Lesson 1",
      date: "Dec 15, 2024",
      status: "passed",
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      duration: "15 mins"
    },
    {
      id: "quiz-2",
      title: "Building Confidence Assessment",
      lesson: "Lesson 3",
      date: "Dec 20, 2024",
      status: "passed",
      score: 92,
      totalQuestions: 12,
      correctAnswers: 11,
      duration: "20 mins"
    },
    {
      id: "quiz-3",
      title: "Audience Dynamics Quiz",
      lesson: "Lesson 4",
      date: "Dec 25, 2024",
      status: "upcoming",
      duration: "25 mins",
      totalQuestions: 15
    },
    {
      id: "quiz-4",
      title: "Speech Structure Assessment",
      lesson: "Lesson 5",
      date: "Dec 30, 2024",
      status: "upcoming",
      duration: "30 mins",
      totalQuestions: 18
    }
  ];

  const passedQuizzes = quizzes.filter(q => q.status === "passed");
  const upcomingQuizzes = quizzes.filter(q => q.status === "upcoming");

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
              <div className="cp-profile-avatar">
                {studentName ? studentName.slice(0, 2).toUpperCase() : "ST"}
              </div>
              <div className="cp-profile-info">
                <div className="cp-profile-name">{studentName || "Student"}</div>
                <div className="cp-profile-username">{studentEmail || ""}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="cp-content-new">
          {/* Breadcrumbs */}
          <nav className="cp-breadcrumbs">
            <Link to="/student-dashboard-2">Dashboard</Link>
            <span className="cp-breadcrumb-separator">/</span>
            <Link to="/courses">Courses</Link>
            <span className="cp-breadcrumb-separator">/</span>
            <span className="cp-breadcrumb-current">{courseData.title}</span>
          </nav>

          {/* Course Header with Back Button */}
          <div className="cp-course-header">
            <button className="cp-back-btn" onClick={() => navigate("/student-dashboard-2")}>
              <span className="cp-back-chev">‹</span> Dashboard
            </button>
            <div>
              <h2 className="cp-course-title">{courseData.title}</h2>
              <p className="cp-course-subtitle">{courseData.currentLesson}</p>
            </div>
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
                  className={`cp-tab ${activeTab === "quiz" ? "active" : ""}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  Quiz
                </button>
                <button 
                  className={`cp-tab ${activeTab === "achievements" ? "active" : ""}`}
                  onClick={() => setActiveTab("achievements")}
                >
                  Achievement
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
                {activeTab === "achievements" && (
                  <div className="cp-achievements-content">
                    <div className="cp-achievements-header">
                      <div>
                        <h3 className="cp-achievements-title">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                          </svg>
                          Course Achievements
                        </h3>
                        <p className="cp-achievements-subtitle">Earn achievements by completing this course</p>
                      </div>
                      <Link to="/achievements" className="cp-view-all-achievements">
                        View All
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>

                    <div className="cp-achievements-list">
                      {courseAchievements.map((achievement) => (
                        <div 
                          key={achievement.id} 
                          className={`cp-achievement-card ${achievement.unlocked ? "unlocked" : ""}`}
                        >
                          <div className="cp-achievement-icon-wrapper">
                            {achievement.icon === "trophy" && (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                <path d="M4 22h16"></path>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                              </svg>
                            )}
                            {achievement.icon === "award" && (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="6"></circle>
                                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                              </svg>
                            )}
                            {achievement.icon === "star" && (
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            )}
                            {achievement.unlocked && (
                              <div className="cp-achievement-check">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="cp-achievement-content">
                            <div className="cp-achievement-header-row">
                              <h4 className="cp-achievement-name">{achievement.title}</h4>
                              {achievement.unlocked && (
                                <span className={`cp-achievement-badge ${achievement.badge}`}>
                                  {achievement.badge === "platinum" ? "Platinum" : achievement.badge === "gold" ? "Gold" : "Silver"}
                                </span>
                              )}
                            </div>
                            <p className="cp-achievement-desc">{achievement.description}</p>
                            {!achievement.unlocked && (
                              <div className="cp-achievement-progress">
                                <div className="cp-achievement-progress-bar">
                                  <div 
                                    className="cp-achievement-progress-fill" 
                                    style={{ width: `${achievement.progress}%` }}
                                  ></div>
                                </div>
                                <span className="cp-achievement-progress-text">{achievement.progress}%</span>
                              </div>
                            )}
                            {achievement.unlocked && (
                              <div className="cp-achievement-unlocked">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>Unlocked!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "quiz" && (
                  <div className="cp-quiz-content">
                    {/* Passed Quizzes Section */}
                    {passedQuizzes.length > 0 && (
                      <div className="cp-quiz-section">
                        <div 
                          className="cp-quiz-section-header clickable"
                          onClick={() => setPassedQuizzesExpanded(!passedQuizzesExpanded)}
                        >
                          <h3 className="cp-quiz-section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Passed Quizzes ({passedQuizzes.length})
                          </h3>
                          <svg 
                            className={`cp-quiz-dropdown-icon ${passedQuizzesExpanded ? "expanded" : ""}`}
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </div>
                        {passedQuizzesExpanded && (
                          <div className="cp-quiz-list">
                            {passedQuizzes.map((quiz) => (
                              <div key={quiz.id} className="cp-quiz-card passed">
                                <div className="cp-quiz-card-header">
                                  <div className="cp-quiz-card-info">
                                    <h4 className="cp-quiz-card-title">{quiz.title}</h4>
                                    <p className="cp-quiz-card-meta">{quiz.lesson} • {quiz.date}</p>
                                  </div>
                                  <div className="cp-quiz-score">
                                    <span className="cp-quiz-score-value">{quiz.score}%</span>
                                    <span className="cp-quiz-score-label">Score</span>
                                  </div>
                                </div>
                                <div className="cp-quiz-card-details">
                                  <div className="cp-quiz-detail-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span>{quiz.duration}</span>
                                  </div>
                                  <div className="cp-quiz-detail-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M9 11l3 3L22 4"></path>
                                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                    </svg>
                                    <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                                  </div>
                                </div>
                                <div className="cp-quiz-progress-bar">
                                  <div 
                                    className="cp-quiz-progress-fill" 
                                    style={{ width: `${quiz.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upcoming Quizzes Section */}
                    {upcomingQuizzes.length > 0 && (
                      <div className="cp-quiz-section">
                        <div className="cp-quiz-section-header">
                          <h3 className="cp-quiz-section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Upcoming Quizzes ({upcomingQuizzes.length})
                          </h3>
                        </div>
                        <div className="cp-quiz-list">
                          {upcomingQuizzes.map((quiz) => (
                            <div key={quiz.id} className="cp-quiz-card upcoming">
                              <div className="cp-quiz-card-header">
                                <div className="cp-quiz-card-info">
                                  <h4 className="cp-quiz-card-title">{quiz.title}</h4>
                                  <p className="cp-quiz-card-meta">{quiz.lesson} • {quiz.date}</p>
                                </div>
                                <div className="cp-quiz-badge upcoming">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  Upcoming
                                </div>
                              </div>
                              <div className="cp-quiz-card-details">
                                <div className="cp-quiz-detail-item">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  <span>{quiz.duration}</span>
                                </div>
                                <div className="cp-quiz-detail-item">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"></path>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                  </svg>
                                  <span>{quiz.totalQuestions} questions</span>
                                </div>
                              </div>
                              <button 
                                className="cp-quiz-start-btn"
                                onClick={() => navigate(`/quiz`)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Start Quiz
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {passedQuizzes.length === 0 && upcomingQuizzes.length === 0 && (
                      <div className="cp-quiz-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        <h3 className="cp-quiz-empty-title">No quizzes available</h3>
                        <p className="cp-quiz-empty-text">Quizzes for this course will appear here once they are assigned.</p>
                      </div>
                    )}
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