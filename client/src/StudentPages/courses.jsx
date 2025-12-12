import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./courses.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";
import cover from "../assets/quizpic.png";
import { BookOpen, Clock, PlayCircle } from "lucide-react";

/* ---- single course card ---- */
function CourseCard({ course, index, isFirstCourse, navigate, viewMode = "grid" }) {
  // Calculate total lessons
  const totalLessons = course.Topics.reduce(
    (sum, topic) => sum + (topic.lessons?.length || 0),
    0
  );

  if (viewMode === "list") {
    return (
      <article className="crs-card crs-card-list">
        <div className="crs-card-list-cover">
          <img src={cover} alt={course.CoursesTitle} />
          {isFirstCourse && <span className="crs-pill">Active</span>}
          {!isFirstCourse && <span className="crs-pill-locked">Locked</span>}
        </div>
        <div className="crs-card-list-content">
          <div className="crs-card-list-header">
            <div>
              <h3 className="crs-title">{course.CoursesTitle}</h3>
              <p className="crs-desc">Course {index + 1} of {course.totalCourses || 8} • Curriculum Course</p>
            </div>
            <div className="crs-badge">Course {index + 1}</div>
          </div>
          <div className="crs-stats">
            <div className="crs-stat-item">
              <BookOpen size={16} />
              <span>{totalLessons} Lessons</span>
            </div>
            <div className="crs-stat-item">
              <Clock size={16} />
              <span>{course.Topics?.length || 0} Topics</span>
            </div>
          </div>
          <div className="crs-actions-row">
            {isFirstCourse ? (
              <button 
                className="crs-btn primary"
                onClick={() => navigate(`/course/${index}`)}
              >
                <PlayCircle size={18} />
                Continue
              </button>
            ) : (
              <button 
                className="crs-btn locked"
                disabled
                title="Complete the previous course to unlock"
              >
                <PlayCircle size={18} />
                Continue
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="crs-card">
      <div className="crs-cover">
        <img src={cover} alt={course.CoursesTitle} />
        {isFirstCourse && <span className="crs-pill">Active Course</span>}
        {!isFirstCourse && <span className="crs-pill-locked">Locked</span>}
      </div>

      <div className="crs-body">
        <div className="crs-header-section">
          <h3 className="crs-title">{course.CoursesTitle}</h3>
          <p className="crs-desc">Course {index + 1} of {course.totalCourses || 8}</p>
        </div>

        <div className="crs-stats">
          <div className="crs-stat-item">
            <BookOpen size={16} />
            <span>{totalLessons} Lessons</span>
          </div>
          <div className="crs-stat-item">
            <Clock size={16} />
            <span>{course.Topics?.length || 0} Topics</span>
          </div>
        </div>

        <div className="crs-footer">
          <div className="crs-badge">Curriculum Course</div>
        </div>

        <div className="crs-actions-row">
          {isFirstCourse ? (
            <button 
              className="crs-btn primary"
              onClick={() => navigate(`/course/${index}`)}
            >
              <PlayCircle size={18} />
              Continue
            </button>
          ) : (
            <button 
              className="crs-btn locked"
              disabled
              title="Complete the previous course to unlock"
            >
              <PlayCircle size={18} />
              Continue
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---- page ---- */
export default function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Get student's path type (this should come from user profile/API)
  const studentPathType = "autism"; // or "Down Syndrome" - get from user profile
  const [studentPath, setStudentPath] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Get all courses from curriculum
  const courses = useMemo(() => {
    if (!studentPath) return [];
    return studentPath.Courses.map((course, index) => ({
      ...course,
      totalCourses: studentPath.Courses.length
    }));
  }, [studentPath]);

  // Use all courses (no filtering)
  const filteredCourses = courses;

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
    navigate("/login");
  };

  return (
    <div className="crs-page">
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
      <div className={`crs-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Header */}
        <header className="crs-header">
          <div className="crs-header-content">
            <div>
              <h1 className="crs-page-title">Course Catalog</h1>
              <p className="crs-page-subtitle">Explore all available courses in your curriculum</p>
            </div>
          </div>
        </header>

        {/* Courses Section */}
        <section className="crs-section">
          <div className="crs-section-header">
            <div>
              <h2 className="crs-section-title">All Courses</h2>
              <span className="crs-course-count">{filteredCourses.length} courses available</span>
            </div>
            <div className="crs-view-toggle">
              <button 
                className={`crs-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                className={`crs-view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className={`crs-container ${viewMode === "list" ? "crs-list-view" : "crs-grid-view"}`}>
              {filteredCourses.map((course, index) => (
                <CourseCard 
                  key={index} 
                  course={course} 
                  index={index}
                  isFirstCourse={index === 0}
                  navigate={navigate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="crs-empty-state">
              <BookOpen size={48} className="crs-empty-icon" />
              <h3 className="crs-empty-title">No courses available</h3>
              <p className="crs-empty-text">Check back later for new courses</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
