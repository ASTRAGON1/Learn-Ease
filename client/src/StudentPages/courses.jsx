import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./courses.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";

// Course topic images mapping - using emojis as placeholders for beautiful visual representation
const getCourseImage = (courseTitle) => {
  const title = courseTitle.toLowerCase();

  if (title.includes('listening')) {
    return { emoji: '👂', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' };
  } else if (title.includes('emotional') || title.includes('emotion')) {
    return { emoji: '😊', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' };
  } else if (title.includes('social')) {
    return { emoji: '🤝', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' };
  } else if (title.includes('communication')) {
    return { emoji: '💬', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' };
  } else if (title.includes('reading') || title.includes('literacy')) {
    return { emoji: '📚', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' };
  } else if (title.includes('math') || title.includes('number')) {
    return { emoji: '🔢', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: '#30cfd0' };
  } else if (title.includes('motor') || title.includes('movement')) {
    return { emoji: '🏃', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' };
  } else if (title.includes('creative') || title.includes('art')) {
    return { emoji: '🎨', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#ff9a9e' };
  } else if (title.includes('daily') || title.includes('life')) {
    return { emoji: '🏠', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#ffecd2' };
  } else if (title.includes('sensory')) {
    return { emoji: '✨', gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', color: '#ff6e7f' };
  } else {
    return { emoji: '📖', gradient: 'linear-gradient(135deg, #4C0FAD 0%, #7C3AED 100%)', color: '#4C0FAD' };
  }
};

// Progress ring component
function ProgressRing({ progress, size = 60 }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="courses-progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4C0FAD"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="courses-progress-text">{progress}%</div>
    </div>
  );
}

// Course Card Component - Completely Redesigned
function CourseCard({ course, index, isActive, isLocked, navigate }) {
  const totalLessons = course.totalLessons || course.Topics.reduce(
    (sum, topic) => sum + (topic.lessons?.length || 0),
    0
  );
  const topicsCount = course.Topics?.length || 0;
  const courseImage = getCourseImage(course.CoursesTitle);
  const progress = course.progress || 0;

  return (
    <article className={`courses-card ${isLocked ? 'courses-card-locked' : ''}`}>
      <div className="courses-card-header" style={{ background: courseImage.gradient }}>
        <div className="courses-card-emoji">{courseImage.emoji}</div>
        <div className="courses-card-status">
          {isActive && <span className="courses-badge courses-badge-active">Active</span>}
          {isLocked && <span className="courses-badge courses-badge-locked">Locked</span>}
          {course.status === "completed" && <span className="courses-badge courses-badge-completed">✓ Done</span>}
        </div>
      </div>

      <div className="courses-card-body">
        <div className="courses-card-number">Course {index + 1}</div>
        <h3 className="courses-card-title">{course.CoursesTitle}</h3>

        <div className="courses-card-stats">
          <div className="courses-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>{totalLessons} Lessons</span>
          </div>
          <div className="courses-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{topicsCount} Topics</span>
          </div>
        </div>

        {!isLocked && (
          <div className="courses-card-progress-section">
            <div className="courses-progress-label">
              <span>Progress</span>
              <span className="courses-progress-percent">{progress}%</span>
            </div>
            <div className="courses-progress-bar">
              <div
                className="courses-progress-fill"
                style={{
                  width: `${progress}%`,
                  background: courseImage.gradient
                }}
              />
            </div>
          </div>
        )}

        <div className="courses-card-footer">
          {isLocked ? (
            <button className="courses-btn courses-btn-locked" disabled>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Locked
            </button>
          ) : isActive ? (
            <button
              className="courses-btn courses-btn-primary"
              onClick={() => navigate(`/course/${index + 1}`)}
              style={{ background: courseImage.gradient }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Continue
            </button>
          ) : (
            <button
              className="courses-btn courses-btn-secondary"
              onClick={() => navigate(`/course/${index + 1}`)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              Review
            </button>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="courses-card-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
      )}
    </article>
  );
}

// Main Courses Component
export default function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [studentPathType, setStudentPathType] = useState(null);
  const [studentPath, setStudentPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentProgress, setStudentProgress] = useState({
    completedCourses: [],
    courseProgress: {}, // Map of course index/id to progress stats
    currentCourseIndex: 0
  });

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  // Fetch student info to get type
  useEffect(() => {
    const fetchStudentType = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/students/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.type) {
            setStudentPathType(data.data.type);
          } else {
            // If no type is set, default to autism and stop loading
            setStudentPathType('autism');
          }
        } else {
          // If request fails, default to autism and stop loading
          setStudentPathType('autism');
        }
      } catch (error) {
        console.error('Error fetching student type:', error);
        // If error, default to autism and stop loading
        setStudentPathType('autism');
      }
    };

    fetchStudentType();
  }, []);

  // Fetch learning path from API
  useEffect(() => {
    const fetchPath = async () => {
      if (!studentPathType) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/admin/learning-paths`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const normalizedType = studentPathType.toLowerCase() === 'down syndrome' ? 'downSyndrome' : studentPathType.toLowerCase();
            const path = result.data.find(p => {
              if (!p.id) return false;
              const pathId = p.id.toLowerCase();
              const pathName = p.name.toLowerCase();
              return pathId.includes(normalizedType) ||
                pathName.includes(normalizedType) ||
                (normalizedType === 'autism' && (pathId.includes('autism') || pathName.includes('autism'))) ||
                (normalizedType === 'downsyndrome' && (pathId.includes('downsyndrome') || pathName.includes('down syndrome')));
            });

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
            } else {
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

  // Fetch student progress
  useEffect(() => {
    if (!studentPath) return;

    const fetchProgress = async () => {
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

            // Map backend progress to frontend indices
            const completedIndices = [];
            const newCourseProgress = {};
            let maxCompletedIndex = -1;

            studentPath.Courses.forEach((course, index) => {
              // Find matching backend course record by ID
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

            // Determine current active course index
            let nextIndex = 0;
            if (completedIndices.length > 0) {
              nextIndex = maxCompletedIndex + 1;
            }
            if (nextIndex >= studentPath.Courses.length) {
              nextIndex = studentPath.Courses.length - 1;
            }

            setStudentProgress({
              completedCourses: completedIndices,
              courseProgress: newCourseProgress,
              currentCourseIndex: nextIndex
            });
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    fetchProgress();
  }, [studentPath]);

  // Get all courses with progress
  const courses = useMemo(() => {
    if (!studentPath) return [];

    return studentPath.Courses.map((course, index) => {
      // Calculate status and progress
      let status = "locked";
      let progress = 0;
      let completedLessons = 0;
      const staticTotalLessons = course.Topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
      let totalLessons = staticTotalLessons;

      const courseProg = studentProgress.courseProgress[index];

      if (studentProgress.completedCourses.includes(index)) {
        status = "completed";
        progress = 100;
        completedLessons = totalLessons;
      } else if (index === studentProgress.currentCourseIndex) {
        status = "active";
        if (courseProg) {
          completedLessons = courseProg.completedLessons;
          if (courseProg.totalLessons > 0) totalLessons = courseProg.totalLessons;
        }
        progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      } else if (index < studentProgress.currentCourseIndex) {
        status = "completed";
        progress = 100;
        completedLessons = totalLessons;
      }

      return {
        ...course,
        totalCourses: studentPath.Courses.length,
        status,
        progress: Math.min(progress, 100),
        completedLessons,
        totalLessons
      };
    });
  }, [studentPath, studentProgress]);

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    return courses.filter(course =>
      course.CoursesTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  // Calculate stats - Real data
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(c => c.status === "completed").length;
    const inProgress = courses.filter(c => c.status === "active").length;
    const locked = courses.filter(c => c.status === "locked").length;

    return { total, completed, inProgress, locked };
  }, [courses]);

  // Determine active route
  const getActiveKey = () => {
    if (location.pathname === "/student-dashboard-2") return "dashboard";
    if (location.pathname.startsWith("/personalized")) return "personalized";
    if (location.pathname.startsWith("/achievements")) return "achievements";
    if (location.pathname.startsWith("/courses")) return "courses";
    return "courses";
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
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="courses-page">
        <div className="courses-loading">
          <div className="courses-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Left Sidebar */}
      <aside
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          <Link to="/student-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={activeKey === item.key ? "active" : ""}>
                <Link to={item.to} className="ld-sidebar-link">
                  <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                  <span className="ld-sidebar-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

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
      <div className={`courses-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Header Section */}
        <header className="courses-header-new">
          <div className="courses-header-gradient">
            <div className="courses-header-content-new">
              <div className="courses-header-text">
                <h1 className="courses-page-title-new">All Courses</h1>
                <p className="courses-page-subtitle-new">{stats.total} courses available</p>
              </div>
              <div className="courses-header-icon-wrapper">
                <svg className="courses-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="courses-search-section">
            <div className="courses-header-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="courses-search-input"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="courses-stats-overview-new">
            <div className="courses-stat-card-new">
              <div className="courses-stat-icon-new" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div className="courses-stat-content-new">
                <div className="courses-stat-value-new">{stats.total}</div>
                <div className="courses-stat-label-new">TOTAL</div>
              </div>
            </div>

            <div className="courses-stat-card-new">
              <div className="courses-stat-icon-new" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
              </div>
              <div className="courses-stat-content-new">
                <div className="courses-stat-value-new">{stats.inProgress}</div>
                <div className="courses-stat-label-new">ACTIVE</div>
              </div>
            </div>

            <div className="courses-stat-card-new">
              <div className="courses-stat-icon-new" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="courses-stat-content-new">
                <div className="courses-stat-value-new">{stats.completed}</div>
                <div className="courses-stat-label-new">DONE</div>
              </div>
            </div>

            <div className="courses-stat-card-new">
              <div className="courses-stat-icon-new" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="courses-stat-content-new">
                <div className="courses-stat-value-new">{stats.locked}</div>
                <div className="courses-stat-label-new">LOCKED</div>
              </div>
            </div>
          </div>
        </header>

        {/* Courses Grid */}
        <section className="courses-section">
          <div className="courses-section-header">
            <h2 className="courses-section-title">Your Path</h2>
            <p className="courses-section-subtitle">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </p>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={index}
                  course={course}
                  index={index}
                  isActive={course.status === "active"}
                  isLocked={course.status === "locked"}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <div className="courses-empty-state">
              <div className="courses-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3 className="courses-empty-title">No courses found</h3>
              <p className="courses-empty-text">
                {searchTerm ? `No courses match "${searchTerm}"` : 'No courses available yet'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
