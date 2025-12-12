import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./StudentDashboard2.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";

export default function StudentDashboard2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeQuizTab, setActiveQuizTab] = useState("all");
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Get student's path type (this should come from user profile/API)
  // For now, using a default - you'll need to fetch this from backend
  const studentPathType = "autism"; // or "Down Syndrome" - get from user profile
  const [studentPath, setStudentPath] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Student progress data (this should come from backend/API)
  // Structure: { currentCourseIndex, completedCourses: [], courseProgress: { courseIndex: { completedLessons, totalLessons } } }
  const [studentProgress] = useState({
    currentCourseIndex: 0, // Index of current course (0 = first course)
    completedCourses: [], // Array of completed course indices
    courseProgress: {
      0: { completedLessons: 5, totalLessons: 20 } // Progress for each course
    }
  });

  // Fetch learning path from API
  useEffect(() => {
    const fetchPath = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/admin/learning-paths`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const normalizedType = studentPathType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentPathType.toLowerCase();
            const path = result.data.find(p => p.id && (p.id.includes(normalizedType) || p.name.toLowerCase().includes(studentPathType.toLowerCase())));
            if (path) {
              // Transform to expected format
              setStudentPath({
                GeneralPath: normalizedType,
                pathTitle: path.name,
                Courses: path.courses.map(course => ({
                  CoursesTitle: course.name,
                  Topics: course.topics.map(topic => ({
                    TopicsTitle: topic.name,
                    lessons: topic.lessons.map(lesson => lesson.name)
                  }))
                }))
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching learning path:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [studentPathType]);

  // Helper function to assign colors
  const getCourseColor = (index) => {
    const colors = ["yellow", "purple", "blue", "green", "orange", "pink", "teal", "indigo"];
    return colors[index % colors.length];
  };

  // Transform curriculum courses to dashboard format
  const courses = useMemo(() => {
    if (!studentPath) return [];
    
    return studentPath.Courses.map((course, index) => {
      // Calculate total lessons in this course
      const totalLessons = course.Topics.reduce(
        (sum, topic) => sum + topic.lessons.length, 
        0
      );
      
      // Determine course status
      let status = "locked";
      let progress = 0;
      
      if (studentProgress.completedCourses.includes(index)) {
        status = "completed";
        progress = 100;
      } else if (index === studentProgress.currentCourseIndex) {
        status = "active";
        const courseProg = studentProgress.courseProgress[index] || { completedLessons: 0, totalLessons };
        progress = Math.round((courseProg.completedLessons / totalLessons) * 100);
      } else if (index < studentProgress.currentCourseIndex) {
        status = "completed";
        progress = 100;
      }
      
      const courseProg = studentProgress.courseProgress[index] || { completedLessons: 0, totalLessons };
      
      return {
        id: index + 1,
        title: course.CoursesTitle,
        courseNumber: index + 1,
        totalCourses: studentPath.Courses.length,
        progress: courseProg.completedLessons,
        totalLessons: totalLessons,
        status: status,
        color: getCourseColor(index),
        isLocked: status === "locked"
      };
    });
  }, [studentPath, studentProgress]);

  // Calculate overall path progress
  const overallProgress = useMemo(() => {
    if (!courses.length) return 0;
    const completed = courses.filter(c => c.status === "completed").length;
    return Math.round((completed / courses.length) * 100);
  }, [courses]);

  // Get active course and next locked course
  const activeCourse = courses.find(c => c.status === 'active' && !c.isLocked);
  const nextLockedCourse = courses.find(c => c.isLocked);

  // Sample next lessons data (filtered to current course)
  const nextLessons = useMemo(() => {
    if (!studentPath || courses.length === 0) return [];
    
    const currentCourse = studentPath.Courses[studentProgress.currentCourseIndex];
    if (!currentCourse) return [];
    
    const lessons = [];
    currentCourse.Topics.forEach((topic, topicIndex) => {
      topic.lessons.forEach((lesson, lessonIndex) => {
        lessons.push({
          id: `${studentProgress.currentCourseIndex}-${topicIndex}-${lessonIndex}`,
          lesson: lesson,
          course: currentCourse.CoursesTitle,
          teacher: "Instructor",
          teacherAvatar: "IN",
          duration: "20 min"
        });
      });
    });
    
    return lessons.slice(0, 5); // Return first 5 lessons
  }, [studentPath, studentProgress.currentCourseIndex]);

  // Quizzes data (filtered to current course)
  const quizzes = useMemo(() => {
    if (!studentPath || courses.length === 0) return [];
    
    const currentCourse = studentPath.Courses[studentProgress.currentCourseIndex];
    if (!currentCourse) return [];
    
    return [
      {
        id: "q1",
        title: `${currentCourse.CoursesTitle} Quiz 1`,
        courseName: currentCourse.CoursesTitle,
        instructor: "Instructor",
        status: "upcoming",
        date: "Dec 20, 10:00",
        duration: "30 mins",
        grade: null,
        scorePct: null
      }
    ];
  }, [studentPath, studentProgress.currentCourseIndex]);

  // Filter quizzes by status
  const filteredQuizzes = activeQuizTab === "all" 
    ? quizzes 
    : quizzes.filter(q => q.status === activeQuizTab);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const getStatusLabel = (status) => {
    if (status === "upcoming") return "Upcoming";
    if (status === "missed") return "Missed";
    if (status === "graded") return "Graded";
    return status;
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

  // Determine active route
  const getActiveKey = () => {
    if (location.pathname === "/student-dashboard-2") return "dashboard";
    if (location.pathname.startsWith("/personalized")) return "personalized";
    if (location.pathname.startsWith("/achievements")) return "achievements";
    if (location.pathname.startsWith("/courses")) return "courses";
    return "dashboard";
  };

  const activeKey = getActiveKey();

  // Sidebar items
  const sidebarItems = [
    { 
      key: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ), 
      to: "/student-dashboard-2" 
    },
    { 
      key: "personalized", 
      label: "Personalized Path", 
      icon: <img src={icPersonalizedPath} alt="" style={{ width: "24px", height: "24px" }} />, 
      to: "/personalized" 
    },
    { 
      key: "achievements", 
      label: "Achievements", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      ), 
      to: "/achievements" 
    },
    { 
      key: "courses", 
      label: "Courses", 
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />, 
      to: "/courses" 
    },
  ];

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  return (
    <div className="ld-page">
      {/* Left Sidebar with Hover Animation */}
      <aside 
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          {/* Logo */}
          <Link to="/student-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          {/* Navigation Items */}
          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={activeKey === item.key ? "active" : ""}>
                <Link to={item.to} className="ld-sidebar-link">
                  <span className="ld-sidebar-icon-wrapper">
                    {item.icon}
                  </span>
                  <span className="ld-sidebar-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="ld-sidebar-footer">
            <button 
              className={`ld-sidebar-link ld-sidebar-logout ${activeKey === "logout" ? "active" : ""}`}
              onClick={handleLogout}
            >
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Top Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <h1 className="ld-welcome">
              Welcome to <span className="ld-brand">LearnEase</span>
            </h1>
          </div>
          <div className="ld-header-right">
            <button className="ld-notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <Link to="/StudentProfile">
              <img 
                src="https://i.pravatar.cc/160?img=47" 
                alt="Profile" 
                className="ld-profile-picture"
                title="View Profile"
              />
            </Link>
            <div className="ld-profile">
              <div className="ld-profile-info">
                <div className="ld-profile-name">Kacie Velasquez</div>
                <div className="ld-profile-username">@k_velasquez</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="ld-content">
          {/* Overall Path Progress Section */}
          {studentPath && (
            <section className="ld-path-progress-section">
              <div className="ld-path-progress-card">
                <h2 className="ld-path-title">{studentPath.pathTitle}</h2>
                <div className="ld-path-progress-info">
                  <span className="ld-path-progress-text">
                    {courses.filter(c => c.status === "completed").length} of {courses.length} courses completed
                  </span>
                  <span className="ld-path-progress-percent">{overallProgress}%</span>
                </div>
                <div className="ld-path-progress-bar">
                  <div 
                    className="ld-path-progress-fill"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </section>
          )}

          {/* My Learning Path Section - Two Box Layout */}
          <section className="ld-courses-section">
            <div className="ld-courses-header">
              <h2 className="ld-section-title">My Learning Path</h2>
            </div>
            
            {/* Two Box Layout */}
            <div className="ld-courses-two-box">
              {/* Box 1 - Current Active Course */}
              {activeCourse ? (
                <div className="ld-course-box ld-course-box-active">
                  <div className="ld-course-box-top">
                    <div className="ld-course-box-number">Course {activeCourse.courseNumber} of {activeCourse.totalCourses}</div>
                    <span className="ld-course-box-badge active">In Progress</span>
                  </div>
                  <h3 className="ld-course-box-title">{activeCourse.title}</h3>
                  <div className="ld-course-box-progress">
                    <div className="ld-course-box-progress-bar">
                      <div
                        className="ld-course-box-progress-fill"
                        style={{ width: `${(activeCourse.progress / activeCourse.totalLessons) * 100}%` }}
                      ></div>
                    </div>
                    <div className="ld-course-box-progress-text">
                      Progress {activeCourse.progress}/{activeCourse.totalLessons} lessons
                    </div>
                  </div>
                  <button 
                    className="ld-course-box-btn"
                    onClick={() => navigate(`/course/${activeCourse.id}`)}
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="ld-course-box ld-course-box-active">
                  <div className="ld-no-active-course">
                    <p>No active course available</p>
                  </div>
                </div>
              )}

              {/* Box 2 - Next Locked Course */}
              {nextLockedCourse ? (
                <div className="ld-course-box ld-course-box-locked">
                  <div className="ld-course-box-lock-content">
                    <svg 
                      className="ld-course-box-lock-icon" 
                      width="64" 
                      height="64" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <p className="ld-course-box-lock-text">Complete previous course to unlock</p>
                    <div className="ld-course-box-lock-title">{nextLockedCourse.title}</div>
                  </div>
                </div>
              ) : (
                <div className="ld-course-box ld-course-box-locked">
                  <div className="ld-no-locked-course">
                    <p>All courses completed! 🎉</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Two Column Section: My Next Lessons & New Course Recommendation */}
          <div className="ld-two-column-section">
            {/* My Next Lessons Section */}
            <section className="ld-lessons-section">
              <div className="ld-section-header">
                <h2 className="ld-section-title">My next lessons</h2>
                <Link to="/courses" className="ld-view-all">View all lessons</Link>
              </div>
              {nextLessons.length > 0 ? (
                <div className="ld-lessons-table">
                  <div className="ld-lessons-header">
                    <div className="ld-lesson-col">Lesson</div>
                    <div className="ld-teacher-col">Teacher</div>
                    <div className="ld-duration-col">Duration</div>
                  </div>
                  {nextLessons.map((lesson) => (
                    <div key={lesson.id} className="ld-lesson-row">
                      <div className="ld-lesson-col">
                        <div className="ld-lesson-title">{lesson.lesson}</div>
                        <div className="ld-lesson-course">{lesson.course}</div>
                      </div>
                      <div className="ld-teacher-col">
                        <div className="ld-teacher-avatar">{lesson.teacherAvatar}</div>
                        <span className="ld-teacher-name">{lesson.teacher}</span>
                      </div>
                      <div className="ld-duration-col">{lesson.duration}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ld-no-lessons">
                  <p>No lessons available yet.</p>
                </div>
              )}
            </section>

            {/* New Course Recommendation Section */}
            <section className="ld-recommendation-section">
              <div className="ld-recommendation-card">
                <h2 className="ld-recommendation-section-title">New course matching your interests</h2>
                {courses.length > 0 && courses[studentProgress.currentCourseIndex + 1] ? (
                  <>
                    <div className="ld-recommendation-category">Computer Science</div>
                    <h3 className="ld-recommendation-title">
                      {courses[studentProgress.currentCourseIndex + 1].title}
                    </h3>
                    <div className="ld-recommendation-social">
                      <span className="ld-recommendation-social-text">They are already studying</span>
                      <div className="ld-recommendation-avatars">
                        <div className="ld-recommendation-avatar">A</div>
                        <div className="ld-recommendation-avatar">B</div>
                        <div className="ld-recommendation-avatar">C</div>
                        <div className="ld-recommendation-badge">+100</div>
                      </div>
                    </div>
                    <button className="ld-details-btn">More details</button>
                  </>
                ) : (
                  <>
                    <div className="ld-recommendation-category">Computer Science</div>
                    <h3 className="ld-recommendation-title">
                      Microsoft Future Ready: Fundamentals of Big Data
                    </h3>
                    <div className="ld-recommendation-social">
                      <span className="ld-recommendation-social-text">They are already studying</span>
                      <div className="ld-recommendation-avatars">
                        <div className="ld-recommendation-avatar">A</div>
                        <div className="ld-recommendation-avatar">B</div>
                        <div className="ld-recommendation-avatar">C</div>
                        <div className="ld-recommendation-badge">+100</div>
                      </div>
                    </div>
                    <button className="ld-details-btn">More details</button>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Quizzes Section */}
          <section className="ld-quizzes-section">
            <div className="ld-quizzes-header">
              <h2 className="ld-section-title">Quizzes</h2>
              <Link to="/quiz-information" className="ld-view-all">View all quizzes</Link>
            </div>
            
            {/* Quiz Tabs */}
            <div className="ld-quiz-tabs">
              <button
                className={`ld-quiz-tab ${activeQuizTab === "all" ? "active" : ""}`}
                onClick={() => setActiveQuizTab("all")}
              >
                All
              </button>
              <button
                className={`ld-quiz-tab ${activeQuizTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveQuizTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`ld-quiz-tab ${activeQuizTab === "missed" ? "active" : ""}`}
                onClick={() => setActiveQuizTab("missed")}
              >
                Missed
              </button>
              <button
                className={`ld-quiz-tab ${activeQuizTab === "graded" ? "active" : ""}`}
                onClick={() => setActiveQuizTab("graded")}
              >
                Graded
              </button>
            </div>

            {/* Quiz Cards Grid */}
            {filteredQuizzes.length > 0 ? (
              <div className="ld-quizzes-grid">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="ld-quiz-card">
                    <div className="ld-quiz-header">
                      <span className={`ld-quiz-badge ld-quiz-${quiz.status}`}>
                        {quiz.status === "upcoming" && "⏳ "}
                        {quiz.status === "missed" && "⚠️ "}
                        {quiz.status === "graded" && "✅ "}
                        {getStatusLabel(quiz.status)}
                      </span>
                      {quiz.status === "graded" && quiz.scorePct != null && (
                        <div className="ld-quiz-score">
                          <div 
                            className="ld-quiz-score-ring"
                            style={{
                              background: `conic-gradient(#3ac77a ${Math.round((quiz.scorePct / 100) * 360)}deg, #e9e5ff 0deg)`
                            }}
                          >
                            <span>{quiz.scorePct}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="ld-quiz-title">{quiz.title}</h3>
                    <div className="ld-quiz-meta">
                      <div className="ld-quiz-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>{quiz.courseName}</span>
                      </div>
                      <div className="ld-quiz-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{quiz.instructor}</span>
                      </div>
                    </div>
                    
                    <div className="ld-quiz-details">
                      <div className="ld-quiz-detail-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{quiz.date}</span>
                      </div>
                      <div className="ld-quiz-detail-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{quiz.duration}</span>
                      </div>
                      {quiz.grade && (
                        <div className="ld-quiz-detail-item">
                          <span className="ld-quiz-grade">Grade: {quiz.grade}</span>
                        </div>
                      )}
                    </div>

                    <div className="ld-quiz-actions">
                      {quiz.status === "upcoming" && (
                        <button className="ld-quiz-btn ld-quiz-btn-primary">
                          Join Quiz
                        </button>
                      )}
                      {quiz.status === "missed" && (
                        <Link to="/quiz" className="ld-quiz-btn ld-quiz-btn-warn">
                          Retake
                        </Link>
                      )}
                      {quiz.status === "graded" && (
                        <button className="ld-quiz-btn ld-quiz-btn-primary">
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ld-no-quizzes">
                <p>No quizzes available for your current course.</p>
              </div>
            )}
          </section>
        </div>
      </div>

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
            <circle cx="9" cy="11" r="0.8" fill="#4C0FAD" opacity="0.8"/>
            <circle cx="15" cy="11" r="0.8" fill="#4C0FAD" opacity="0.8"/>
            {/* Mouth */}
            <rect x="9" y="15" width="6" height="2" rx="1" fill="white"/>
            {/* Decorative elements */}
            <circle cx="7" cy="9" r="0.5" fill="white" opacity="0.6"/>
            <circle cx="17" cy="9" r="0.5" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div className="ai-chatbot-pulse"></div>
      </div>
    </div>
  );
}