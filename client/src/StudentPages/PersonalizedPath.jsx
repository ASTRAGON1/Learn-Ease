import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./PersonalizedPath.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";

// Circular Progress Component
function CircularProgress({ progress, size = 120, strokeWidth = 8 }) {
  // Cap progress at 100%
  const cappedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (cappedProgress / 100) * circumference;

  return (
    <div className="pp-circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="pp-circular-svg">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C0FAD" />
            <stop offset="100%" stopColor="#4C0FAD" />
          </linearGradient>
        </defs>
        <circle
          className="pp-circular-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="pp-circular-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="pp-circular-content">
        <span className="pp-circular-percent">{Math.round(cappedProgress)}%</span>
        <span className="pp-circular-label">Complete</span>
      </div>
    </div>
  );
}

// Timeline Course Node Component
function TimelineNode({ course, index, total, onClick }) {
  const getStatusIcon = () => {
    if (course.status === "completed") return "✅";
    if (course.status === "active") return "🔄";
    if (course.status === "locked") return "🔒";
    return "⭐";
  };

  const getStatusClass = () => {
    if (course.status === "completed") return "completed";
    if (course.status === "active") return "active";
    if (course.status === "locked") return "locked";
    return "";
  };

  return (
    <div className={`pp-timeline-node ${getStatusClass()}`} onClick={onClick}>
      <div className="pp-timeline-node-icon">{getStatusIcon()}</div>
      <div className="pp-timeline-node-content">
        <div className="pp-timeline-node-title">{course.title}</div>
        <div className="pp-timeline-node-progress">
          <div className="pp-timeline-progress-bar">
            <div
              className="pp-timeline-progress-fill"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <span className="pp-timeline-progress-text">{course.progress}%</span>
        </div>
      </div>
      {index < total - 1 && <div className="pp-timeline-connector" />}
    </div>
  );
}

// Enhanced Course Card Component
function CourseCard({ course, isExpanded, onToggle, onContinue, navigate }) {
  const totalLessons = course.topics?.reduce(
    (sum, topic) => sum + (topic.lessons?.length || 0),
    0
  ) || 0;
  const completedLessons = course.completedLessons || 0;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className={`pp-course-card ${course.status} ${isExpanded ? "expanded" : ""}`}>
      <div className="pp-course-card-header" onClick={onToggle}>
        <div className="pp-course-card-left">
          <div className="pp-course-card-icon">
            {course.status === "completed" ? "✅" : course.status === "active" ? "🔄" : "🔒"}
          </div>
          <div className="pp-course-card-info">
            <h3 className="pp-course-card-title">{course.title}</h3>
            <div className="pp-course-card-meta">
              <span>Course {course.courseNumber} of {course.totalCourses}</span>
              <span className="pp-course-card-separator">•</span>
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
          </div>
        </div>
        <div className="pp-course-card-right">
          <div className="pp-course-card-progress-circle">
            <CircularProgress progress={progress} size={60} strokeWidth={6} />
          </div>
          <button className="pp-course-card-toggle">
            {isExpanded ? "−" : "+"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pp-course-card-body">
          <div className="pp-course-card-progress-bar">
            <div
              className="pp-course-card-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {course.topics && course.topics.length > 0 && (
            <div className="pp-course-topics">
              {course.topics.map((topic, idx) => {
                const topicLessons = topic.lessons?.length || 0;
                const topicCompleted = Math.floor(topicLessons * (progress / 100));
                return (
                  <div key={idx} className="pp-topic-item">
                    <div className="pp-topic-header">
                      <span className="pp-topic-icon">📚</span>
                      <span className="pp-topic-title">{topic.TopicsTitle || topic.title}</span>
                      <span className="pp-topic-progress">{topicCompleted}/{topicLessons}</span>
                    </div>
                    <div className="pp-topic-progress-bar">
                      <div
                        className="pp-topic-progress-fill"
                        style={{ width: `${(topicCompleted / topicLessons) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pp-course-card-actions">
            {course.status === "active" && (
              <button
                className="pp-course-btn pp-course-btn-primary"
                onClick={() => onContinue(course)}
              >
                Continue Learning
              </button>
            )}
            {course.status === "locked" && (
              <button className="pp-course-btn pp-course-btn-disabled" disabled>
                Complete Previous Course
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Statistics Card Component
function StatCard({ icon, label, value, trend }) {
  return (
    <div className="pp-stat-card">
      <div className="pp-stat-icon">{icon}</div>
      <div className="pp-stat-content">
        <div className="pp-stat-value">{value}</div>
        <div className="pp-stat-label">{label}</div>
        {trend && (
          <div className={`pp-stat-trend ${trend > 0 ? "up" : "down"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalizedPath() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [studentPathType, setStudentPathType] = useState(null);
  const [studentPath, setStudentPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [studentProgress, setStudentProgress] = useState({
    currentCourseIndex: 0,
    completedCourses: [],
    courseProgress: {},
    stats: {
      courses: { completed: 0, total: 7 },
      quizzes: { completed: 0, total: 70 },
      hours: 0,
      streak: 0,
    }
  });

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  // Fetch student info and progress
  useEffect(() => {
    const fetchStudentData = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch student info to get type
        const infoResponse = await fetch(`${API_URL}/api/students/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          if (infoData.data && infoData.data.type) {
            setStudentPathType(infoData.data.type);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudentData();
  }, [navigate]);

  // Fetch student progress AFTER studentPath is loaded
  useEffect(() => {
    if (!studentPath) return;

    const fetchStudentProgress = async () => {
      const token = window.sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/students/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const backendProgress = data.data;
            const backendCourses = backendProgress.courseProgress || [];
            setProgressData(backendProgress);

            // Map backend progress to frontend indices
            const completedIndices = [];
            const newCourseProgress = {};
            let maxCompletedIndex = -1;

            studentPath.Courses.forEach((course, index) => {
              // Find matching backend course record by ID (handling populated object or raw ID)
              const courseRecord = backendCourses.find(c => {
                const backendId = c.course && (c.course._id || c.course.id || c.course);
                return String(backendId) === String(course.id);
              });

              if (courseRecord) {
                if (courseRecord.status === 'completed') {
                  completedIndices.push(index);
                  if (index > maxCompletedIndex) {
                    maxCompletedIndex = index;
                  }
                }

                newCourseProgress[index] = {
                  completedLessons: courseRecord.completedLessonsCount || 0,
                  totalLessons: courseRecord.totalLessons || 0,
                  status: courseRecord.status
                };
              }
            });

            // Determine next active course
            let nextIndex = 0;
            if (completedIndices.length > 0) {
              nextIndex = maxCompletedIndex + 1;
            }
            if (nextIndex >= studentPath.Courses.length) {
              nextIndex = studentPath.Courses.length - 1;
            }

            setStudentProgress({
              currentCourseIndex: nextIndex,
              completedCourses: completedIndices,
              courseProgress: newCourseProgress,
              stats: {
                courses: {
                  completed: backendProgress.coursesCompleted,
                  total: backendProgress.totalCourses
                },
                quizzes: {
                  completed: backendProgress.quizzesCompleted,
                  total: backendProgress.totalQuizzes
                },
                hours: backendProgress.hoursStudied,
                streak: backendProgress.currentStreak,
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching student progress:', error);
      }
    };

    fetchStudentProgress();
  }, [studentPath]);

  // Fetch recent achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) {
        setAchievementsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/students/achievements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Get the 3 most recent achievements
            const achievements = data.data.achievements || [];
            setRecentAchievements(achievements.slice(0, 3));
          } else {
            setRecentAchievements([]);
          }
        } else {
          setRecentAchievements([]);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setRecentAchievements([]);
      } finally {
        setAchievementsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Fetch personalized learning path from student-specific endpoint
  useEffect(() => {
    const fetchPath = async () => {
      if (!studentPathType) return;

      setLoading(true);
      const token = window.sessionStorage.getItem('token');
      
      try {
        // Fetch student's personalized path (filtered by difficulty)
        const response = await fetch(`${API_URL}/api/students/personalized-path`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log(`✅ Loaded personalized path - Difficulty: ${result.data.currentDifficulty}, Content: ${result.data.filteredContent}/${result.data.totalContent} items`);
            
            // Transform to expected format
            setStudentPath({
              GeneralPath: result.data.pathType,
              pathTitle: result.data.pathTitle,
              currentDifficulty: result.data.currentDifficulty,
              Courses: result.data.courses.map(course => ({
                id: course._id,
                CoursesTitle: course.title,
                Topics: course.topics.map(topic => ({
                  TopicsTitle: topic.title,
                  lessons: topic.lessons.map(lesson => lesson.title)
                }))
              }))
            });
          }
        } else {
          console.error('Failed to fetch personalized path:', response.status);
          // Fallback to general paths if personalized path not available
          const fallbackResponse = await fetch(`${API_URL}/api/admin/learning-paths`);
          if (fallbackResponse.ok) {
            const result = await fallbackResponse.json();
            if (result.success && result.data) {
              const normalizedType = studentPathType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentPathType.toLowerCase();
              const path = result.data.find(p => p.id && (p.id.includes(normalizedType) || p.name.toLowerCase().includes(normalizedType)));
              if (path) {
                setStudentPath({
                  GeneralPath: normalizedType,
                  pathTitle: path.name,
                  Courses: path.courses.map(course => ({
                    id: course._id || course.id,
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
        }
      } catch (error) {
        console.error('Error fetching learning path:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [studentPathType]);

  // Transform courses with progress data
  const courses = useMemo(() => {
    if (!studentPath) return [];

    return studentPath.Courses.map((course, index) => {
      const totalLessons = course.Topics.reduce(
        (sum, topic) => sum + topic.lessons.length,
        0
      );

      let status = "locked";
      let progress = 0;

      if (studentProgress.completedCourses.includes(index)) {
        status = "completed";
        progress = 100;
      } else if (index === studentProgress.currentCourseIndex) {
        status = "active";
        const courseProg = studentProgress.courseProgress[index] || { completedLessons: 0, totalLessons };
        progress = totalLessons > 0 ? Math.round((courseProg.completedLessons / totalLessons) * 100) : 0;
      } else if (index < studentProgress.currentCourseIndex) {
        status = "completed";
        progress = 100;
      }

      const courseProg = studentProgress.courseProgress[index] || { completedLessons: 0, totalLessons };

      return {
        id: course.id || index + 1,
        title: course.CoursesTitle,
        courseNumber: index + 1,
        totalCourses: studentPath.Courses.length,
        progress: progress,
        status: status,
        topics: course.Topics,
        completedLessons: courseProg.completedLessons,
        totalLessons: totalLessons,
      };
    });
  }, [studentPath, studentProgress]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!courses.length) return 0;
    const completed = courses.filter(c => c.status === "completed").length;
    return Math.min(Math.round((completed / courses.length) * 100), 100);
  }, [courses]);

  // Get current active course
  const activeCourse = courses.find(c => c.status === "active");
  const nextCourse = courses.find(c => c.status === "locked");

  // Determine level based on progress
  const getLevel = () => {
    if (overallProgress < 25) return "Beginner";
    if (overallProgress < 75) return "Intermediate";
    return "Advanced";
  };

  const handleCourseToggle = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleContinue = (course) => {
    navigate(`/course/${course.id}`);
  };

  // Determine active route
  const getActiveKey = () => {
    if (location.pathname === "/student-dashboard-2") return "dashboard";
    if (location.pathname.startsWith("/personalized")) return "personalized";
    if (location.pathname.startsWith("/achievements")) return "achievements";
    if (location.pathname.startsWith("/courses")) return "courses";
    return "personalized";
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const stats = [
    {
      icon: "📚",
      label: "Courses",
      value: `${studentProgress.stats.courses.completed}/${studentProgress.stats.courses.total}`,
      trend: null
    },
    {
      icon: "🧪",
      label: "Quizzes",
      value: `${studentProgress.stats.quizzes.completed}/${studentProgress.stats.quizzes.total}`,
      trend: null
    },
    {
      icon: "⏱",
      label: "Minutes Studied",
      value: `${Math.round(studentProgress.stats.hours * 60)}m`,
      trend: null
    },
    {
      icon: "🔥",
      label: "Day Streak",
      value: `${studentProgress.stats.streak} days`,
      trend: null
    },
  ];

  return (
    <div className="pp-layout">
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

      <div className={`pp-content ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        <header className="pp-header-new">
          <div className="pp-header-gradient">
            <div className="pp-header-content-new">
              <div className="pp-header-text">
                <h1 className="pp-page-title-new">My Learning Journey</h1>
                <p className="pp-page-subtitle-new">
                  {studentPath?.pathTitle || "Personalized Learning Path"}
                  {studentPath?.currentDifficulty && (
                    <span style={{ 
                      marginLeft: "12px", 
                      padding: "4px 12px", 
                      borderRadius: "12px", 
                      fontSize: "0.85em",
                      fontWeight: "600",
                      backgroundColor: studentPath.currentDifficulty === 'Easy' ? '#4ade80' : 
                                      studentPath.currentDifficulty === 'Medium' ? '#fbbf24' : '#f87171',
                      color: '#fff'
                    }}>
                      {studentPath.currentDifficulty} Level
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="pp-grid">
          {!studentPath ? (
            <main className="pp-main">
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>No Learning Path Found</h2>
                <p>Please contact your instructor to set up your personalized learning path.</p>
              </div>
            </main>
          ) : (
            <main className="pp-main">
              {/* Overall Progress Section */}
              <section className="pp-progress-section-new">
                <div className="pp-progress-card-new">
                  <div className="pp-progress-header-new">
                    <div className="pp-progress-left">
                      <h2 className="pp-progress-title-new">Overall Progress</h2>
                      <div className="pp-progress-meta-new">
                        <span className="pp-level-badge-new">{getLevel()}</span>
                        <span className="pp-progress-text-new">
                          {courses.filter(c => c.status === "completed").length} of {courses.length} courses completed
                        </span>
                      </div>
                    </div>
                    <div className="pp-progress-right">
                      <CircularProgress progress={overallProgress} size={100} strokeWidth={8} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Statistics Dashboard */}
              <section className="pp-stats-section-new">
                <h3 className="pp-section-title-new">Your Learning Stats</h3>
                <div className="pp-stats-grid-new">
                  {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                  ))}
                </div>
              </section>

              {/* Learning Path Timeline */}
              <section className="pp-timeline-section">
                <div className="pp-section-header">
                  <h3 className="pp-section-title">Learning Path</h3>
                  <span className="pp-section-subtitle">Your personalized journey</span>
                </div>
                <div className="pp-timeline-container">
                  {courses.map((course, index) => (
                    <TimelineNode
                      key={course.id}
                      course={course}
                      index={index}
                      total={courses.length}
                      onClick={() => handleCourseToggle(course.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Course Cards */}
              <section className="pp-courses-section">
                <div className="pp-section-header">
                  <h3 className="pp-section-title">My Courses</h3>
                  <Link to="/courses" className="pp-btn-primary">
                    Browse All Courses
                  </Link>
                </div>
                <div className="pp-courses-list">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isExpanded={expandedCourse === course.id}
                      onToggle={() => handleCourseToggle(course.id)}
                      onContinue={handleContinue}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </section>

              {/* Next Steps Section */}
              {activeCourse && (
                <section className="pp-next-steps">
                  <div className="pp-next-steps-card">
                    <div className="pp-next-steps-header">
                      <div className="pp-next-steps-icon">🚀</div>
                      <div>
                        <h3 className="pp-next-steps-title">Continue Your Journey</h3>
                        <p className="pp-next-steps-subtitle">You're making great progress!</p>
                      </div>
                    </div>
                    <div className="pp-next-steps-content">
                      <div className="pp-next-course-info">
                        <h4>{activeCourse.title}</h4>
                        <p>Next: Continue from where you left off</p>
                        <div className="pp-next-course-progress">
                          <div className="pp-next-course-progress-bar">
                            <div
                              className="pp-next-course-progress-fill"
                              style={{ width: `${activeCourse.progress}%` }}
                            />
                          </div>
                          <span>{activeCourse.progress}% Complete</span>
                        </div>
                      </div>
                      <button
                        className="pp-next-steps-btn"
                        onClick={() => handleContinue(activeCourse)}
                      >
                        Continue Learning →
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </main>
          )}

          {/* Right Sidebar */}
          <aside className="pp-aside">
            {/* Recent Achievements */}
            <section className="pp-achievements-new">
              <div className="pp-achievements-header-new">
                <h3 className="pp-aside-title-new">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                  Recent Achievements
                </h3>
              </div>
              {achievementsLoading ? (
                <div className="pp-achievements-loading">
                  <p>Loading achievements...</p>
                </div>
              ) : recentAchievements.length > 0 ? (
                <div className="pp-achievements-list-new">
                  {recentAchievements.map((achievement) => {
                    const getAchievementIcon = () => {
                      if (achievement.badge === "platinum") return "🏆";
                      if (achievement.badge === "gold") return "⭐";
                      return "🎖️";
                    };
                    return (
                      <div key={achievement.id} className="pp-achievement-item-new">
                        <div className="pp-achievement-icon-new">{getAchievementIcon()}</div>
                        <div className="pp-achievement-content-new">
                          <div className="pp-achievement-title-new">{achievement.title}</div>
                          <div className="pp-achievement-desc-new">{achievement.course}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pp-achievements-empty">
                  <p>No achievements yet. Keep learning to unlock achievements!</p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PersonalizedPath;
