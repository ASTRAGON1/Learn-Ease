import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trophy, Award, Star, TrendingUp, BookOpen, Medal, ChevronRight } from "lucide-react";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import "./AchievementPage.css";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPersonalizedPath from "../assets/Path.svg";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AchievementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();

  const [achievements, setAchievements] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch achievements from API
  useEffect(() => {
    const fetchAchievements = async () => {
      const token = window.sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch student achievements from API
        const response = await fetch(`${API_URL}/api/students/achievements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAchievements(data.data.achievements || []);
            setInProgressCourses([]);
          } else {
            setAchievements([]);
            setInProgressCourses([]);
          }
        } else {
          console.error('Failed to fetch achievements:', response.status);
          setAchievements([]);
          setInProgressCourses([]);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
        setInProgressCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Get recent achievements (most recent 3)
  const recentAchievements = useMemo(() => {
    return achievements
      .sort((a, b) => {
        const dateA = a.earnedAt ? new Date(a.earnedAt) : (a.completedAt ? new Date(a.completedAt) : new Date(0));
        const dateB = b.earnedAt ? new Date(b.earnedAt) : (b.completedAt ? new Date(b.completedAt) : new Date(0));
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [achievements]);

  // Filter achievements based on active tab
  const filteredAchievements = activeTab === "all" 
    ? achievements 
    : achievements.filter(a => a.type === activeTab);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const highGrades = achievements.filter(a => a.grade && a.grade >= 90).length;
    const platinumBadges = achievements.filter(a => a.badge === "platinum").length;
    const goldBadges = achievements.filter(a => a.badge === "gold").length;
    const gradesWithValues = achievements.filter(a => a.grade !== null && a.grade !== undefined);
    const averageGrade = gradesWithValues.length > 0
      ? Math.round(gradesWithValues.reduce((sum, a) => sum + a.grade, 0) / gradesWithValues.length)
      : 0;
    const extraCourses = achievements.filter(a => a.type === "extra").length;

    return {
      totalAchievements: total,
      highGrades,
      platinumBadges,
      goldBadges,
      averageGrade,
      extraCourses
    };
  }, [achievements]);

  const getBadgeIcon = (badge) => {
    switch(badge) {
      case "platinum": return <Medal className="achv-badge-icon" />;
      case "gold": return <Award className="achv-badge-icon" />;
      case "silver": return <Star className="achv-badge-icon" />;
      default: return <Trophy className="achv-badge-icon" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case "platinum": return "#cbd5e1";
      case "gold": return "#fbbf24";
      case "silver": return "#9ca3af";
      default: return "#fb923c";
    }
  };

  // Determine active route
  const getActiveKey = () => {
    if (location.pathname === "/student-dashboard-2") return "dashboard";
    if (location.pathname.startsWith("/personalized")) return "personalized";
    if (location.pathname.startsWith("/achievements")) return "achievements";
    if (location.pathname.startsWith("/courses")) return "courses";
    return "achievements";
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
    <div className="achv-page">
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
      <div className={`achv-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Header */}
        <header className="achv-header-new">
          <div className="achv-header-gradient">
            <div className="achv-header-content-new">
              <div className="achv-header-text">
                <h1 className="achv-page-title-new">My Achievements</h1>
                <p className="achv-page-subtitle-new">Celebrate your learning journey and milestones</p>
              </div>
              <div className="achv-header-icon-wrapper">
                <Trophy className="achv-header-trophy" />
              </div>
            </div>
          </div>
        </header>

        {/* Recent Achievements Section */}
        {recentAchievements.length > 0 && (
          <section className="achv-recent-section">
            <div className="achv-recent-header">
              <h2 className="achv-recent-title">
                <Star className="achv-recent-icon" />
                Recent Achievements
              </h2>
            </div>
            <div className="achv-recent-grid">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="achv-recent-card">
                  <div className="achv-recent-badge-wrapper">
                    <div 
                      className="achv-recent-badge-icon"
                      style={{ 
                        background: `linear-gradient(135deg, ${getBadgeColor(achievement.badge)}40, ${getBadgeColor(achievement.badge)}20)`,
                        borderColor: getBadgeColor(achievement.badge)
                      }}
                    >
                      {getBadgeIcon(achievement.badge)}
                    </div>
                  </div>
                  <div className="achv-recent-content">
                    <h3 className="achv-recent-card-title">{achievement.title}</h3>
                    <p className="achv-recent-card-course">{achievement.course}</p>
                    {achievement.grade !== null && achievement.grade !== undefined && (
                      <div className="achv-recent-grade">{achievement.grade}%</div>
                    )}
                    {(achievement.earnedAt || achievement.completedAt) && (
                      <div className="achv-recent-date">
                        {new Date(achievement.earnedAt || achievement.completedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Statistics Cards */}
        <section className="achv-stats-section-new">
          <div className="achv-stat-card-new">
            <div className="achv-stat-icon-new" style={{ background: "linear-gradient(135deg, #4C0FAD 0%, #7C3AED 100%)" }}>
              <Trophy />
            </div>
            <div className="achv-stat-content-new">
              <div className="achv-stat-value-new">{stats.totalAchievements}</div>
              <div className="achv-stat-label-new">Total Achievements</div>
            </div>
          </div>
          <div className="achv-stat-card-new">
            <div className="achv-stat-icon-new" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
              <Star />
            </div>
            <div className="achv-stat-content-new">
              <div className="achv-stat-value-new">{stats.highGrades}</div>
              <div className="achv-stat-label-new">High Grades (90+)</div>
            </div>
          </div>
          <div className="achv-stat-card-new">
            <div className="achv-stat-icon-new" style={{ background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)" }}>
              <Medal />
            </div>
            <div className="achv-stat-content-new">
              <div className="achv-stat-value-new">{stats.platinumBadges}</div>
              <div className="achv-stat-label-new">Platinum Badges</div>
            </div>
          </div>
          <div className="achv-stat-card-new">
            <div className="achv-stat-icon-new" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <TrendingUp />
            </div>
            <div className="achv-stat-content-new">
              <div className="achv-stat-value-new">{stats.averageGrade}%</div>
              <div className="achv-stat-label-new">Average Grade</div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="achv-tabs-section-new">
          <div className="achv-tabs-new">
            <button
              className={`achv-tab-new ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Achievements
            </button>
            <button
              className={`achv-tab-new ${activeTab === "course" ? "active" : ""}`}
              onClick={() => setActiveTab("course")}
            >
              Core Courses
            </button>
            <button
              className={`achv-tab-new ${activeTab === "extra" ? "active" : ""}`}
              onClick={() => setActiveTab("extra")}
            >
              Extra Courses
            </button>
          </div>
        </section>

        {/* Achievements Grid */}
        <section className="achv-achievements-section">
          {loading ? (
            <div className="achv-empty">
              <Trophy className="achv-empty-icon" />
              <p>Loading achievements...</p>
            </div>
          ) : filteredAchievements.length > 0 ? (
            <div className="achv-grid">
              {filteredAchievements.map((achievement) => (
                <div key={achievement.id} className="achv-card">
                  <div className="achv-card-header">
                    <div 
                      className="achv-badge-display"
                      style={{ 
                        background: `linear-gradient(135deg, ${getBadgeColor(achievement.badge)}20, ${getBadgeColor(achievement.badge)}10)`,
                        borderColor: getBadgeColor(achievement.badge)
                      }}
                    >
                      {getBadgeIcon(achievement.badge)}
                    </div>
                    <span className="achv-category-badge">{achievement.category}</span>
                  </div>
                  <div className="achv-card-body">
                    <h3 className="achv-card-title">{achievement.title}</h3>
                    <p className="achv-card-course">{achievement.course}</p>
                    <p className="achv-card-description">{achievement.description}</p>
                    <div className="achv-card-footer">
                      {achievement.grade !== null && achievement.grade !== undefined && (
                        <div className="achv-grade-display">
                          <span className="achv-grade-label">Final Grade</span>
                          <span className="achv-grade-value">{achievement.grade}%</span>
                        </div>
                      )}
                      <div className="achv-badge-label">
                        {achievement.badge.charAt(0).toUpperCase() + achievement.badge.slice(1)} Badge
                      </div>
                    </div>
                    {(achievement.earnedAt || achievement.completedAt) && (
                      <div className="achv-date">
                        Earned on {new Date(achievement.earnedAt || achievement.completedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="achv-empty">
              <Trophy className="achv-empty-icon" />
              <p>No achievements found in this category yet.</p>
              <p className="achv-empty-subtitle">Keep learning to unlock achievements!</p>
            </div>
          )}
        </section>

        {/* In Progress Extra Courses */}
        {inProgressCourses.length > 0 && (
          <section className="achv-progress-section">
            <div className="achv-section-header">
              <h2 className="achv-section-title">
                <BookOpen className="achv-section-icon" />
                Extra Courses in Progress
              </h2>
            </div>
            <div className="achv-progress-grid">
              {inProgressCourses.map((course) => (
                <div key={course.id} className="achv-progress-card">
                  <div className="achv-progress-header">
                    <h3 className="achv-progress-title">{course.title}</h3>
                    <span className="achv-progress-badge">{course.category}</span>
                  </div>
                  <div className="achv-progress-body">
                    <div className="achv-progress-info">
                      <span className="achv-progress-text">
                        Lesson {course.currentLesson} of {course.totalLessons}
                      </span>
                      <span className="achv-progress-percent">{course.progress}%</span>
                    </div>
                    <div className="achv-progress-bar">
                      <div 
                        className="achv-progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="achv-continue-btn">
                    Continue Learning
                    <ChevronRight className="achv-chevron" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}