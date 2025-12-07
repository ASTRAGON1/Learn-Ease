import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Award, Star, TrendingUp, BookOpen, Medal, ChevronRight } from "lucide-react";
import "./AchievementPage.css";

export default function AchievementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Sample achievement data - this should come from your backend/API
  const achievements = [
    {
      id: "a1",
      type: "course",
      title: "Listening Skills Master",
      course: "Listening Skills",
      grade: 98,
      badge: "platinum",
      completedAt: "2024-12-15",
      description: "Completed with exceptional performance",
      category: "Core Course"
    },
    {
      id: "a2",
      type: "course",
      title: "Communication Excellence",
      course: "Communication Skills",
      grade: 92,
      badge: "gold",
      completedAt: "2024-12-10",
      description: "Outstanding achievement in communication",
      category: "Core Course"
    },
    {
      id: "a3",
      type: "extra",
      title: "Digital Art Pro",
      course: "Digital Illustration with Adobe Illustrator",
      grade: 95,
      badge: "platinum",
      completedAt: "2024-12-05",
      description: "Extra course completed with high grade",
      category: "Extra Course"
    },
    {
      id: "a4",
      type: "course",
      title: "Social Interaction Champion",
      course: "Social Skills",
      grade: 88,
      badge: "gold",
      completedAt: "2024-11-28",
      description: "Great progress in social interactions",
      category: "Core Course"
    },
    {
      id: "a5",
      type: "extra",
      title: "Public Speaking Expert",
      course: "Public Speaking and Leadership",
      grade: 90,
      badge: "gold",
      completedAt: "2024-11-20",
      description: "Completed extra course successfully",
      category: "Extra Course"
    },
    {
      id: "a6",
      type: "course",
      title: "Emotional Intelligence",
      course: "Understanding Emotions",
      grade: 85,
      badge: "gold",
      completedAt: "2024-11-15",
      description: "Strong performance in emotional learning",
      category: "Core Course"
    }
  ];

  // In-progress extra courses
  const inProgressCourses = [
    {
      id: "ip1",
      title: "Creative Writing Fundamentals",
      progress: 65,
      currentLesson: 13,
      totalLessons: 20,
      category: "Extra Course"
    },
    {
      id: "ip2",
      title: "Introduction to Psychology",
      progress: 40,
      currentLesson: 8,
      totalLessons: 20,
      category: "Extra Course"
    }
  ];

  // Filter achievements based on active tab
  const filteredAchievements = activeTab === "all" 
    ? achievements 
    : achievements.filter(a => a.type === activeTab);

  // Calculate statistics
  const stats = {
    totalAchievements: achievements.length,
    highGrades: achievements.filter(a => a.grade >= 90).length,
    platinumBadges: achievements.filter(a => a.badge === "platinum").length,
    goldBadges: achievements.filter(a => a.badge === "gold").length,
    averageGrade: Math.round(achievements.reduce((sum, a) => sum + a.grade, 0) / achievements.length),
    extraCourses: achievements.filter(a => a.type === "extra").length
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="achv-page">
      {/* Left Sidebar */}
      <aside className="achv-sidebar">
        <Link to="/student-dashboard-2" className="achv-sidebar-icon" title="Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </Link>
        <Link to="/quiz-information" className="achv-sidebar-icon" title="Quizzes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </Link>
        <Link to="/achievements" className="achv-sidebar-icon active" title="Achievements">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </Link>
        <Link to="/personalized" className="achv-sidebar-icon" title="Personalized Path">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </Link>
        <button 
          className="achv-sidebar-icon achv-logout-btn" 
          title="Logout"
          onClick={handleLogout}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="achv-main">
        {/* Header */}
        <header className="achv-header">
          <div className="achv-header-content">
            <h1 className="achv-page-title">
              <Trophy className="achv-title-icon" />
              My Achievements
            </h1>
            <p className="achv-page-subtitle">Track your progress and celebrate your success</p>
          </div>
        </header>

        {/* Statistics Cards */}
        <section className="achv-stats-section">
          <div className="achv-stat-card">
            <div className="achv-stat-icon" style={{ background: "rgba(255, 107, 53, 0.1)" }}>
              <Trophy style={{ color: "#ff6b35" }} />
            </div>
            <div className="achv-stat-content">
              <div className="achv-stat-value">{stats.totalAchievements}</div>
              <div className="achv-stat-label">Total Achievements</div>
            </div>
          </div>
          <div className="achv-stat-card">
            <div className="achv-stat-icon" style={{ background: "rgba(251, 191, 36, 0.1)" }}>
              <Star style={{ color: "#fbbf24" }} />
            </div>
            <div className="achv-stat-content">
              <div className="achv-stat-value">{stats.highGrades}</div>
              <div className="achv-stat-label">High Grades (90+)</div>
            </div>
          </div>
          <div className="achv-stat-card">
            <div className="achv-stat-icon" style={{ background: "rgba(203, 213, 225, 0.1)" }}>
              <Medal style={{ color: "#cbd5e1" }} />
            </div>
            <div className="achv-stat-content">
              <div className="achv-stat-value">{stats.platinumBadges}</div>
              <div className="achv-stat-label">Platinum Badges</div>
            </div>
          </div>
          <div className="achv-stat-card">
            <div className="achv-stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
              <TrendingUp style={{ color: "#10b981" }} />
            </div>
            <div className="achv-stat-content">
              <div className="achv-stat-value">{stats.averageGrade}%</div>
              <div className="achv-stat-label">Average Grade</div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="achv-tabs-section">
          <div className="achv-tabs">
            <button
              className={`achv-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Achievements
            </button>
            <button
              className={`achv-tab ${activeTab === "course" ? "active" : ""}`}
              onClick={() => setActiveTab("course")}
            >
              Core Courses
            </button>
            <button
              className={`achv-tab ${activeTab === "extra" ? "active" : ""}`}
              onClick={() => setActiveTab("extra")}
            >
              Extra Courses
            </button>
          </div>
        </section>

        {/* Achievements Grid */}
        <section className="achv-achievements-section">
          {filteredAchievements.length > 0 ? (
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
                      <div className="achv-grade-display">
                        <span className="achv-grade-label">Final Grade</span>
                        <span className="achv-grade-value">{achievement.grade}%</span>
                      </div>
                      <div className="achv-badge-label">
                        {achievement.badge.charAt(0).toUpperCase() + achievement.badge.slice(1)} Badge
                      </div>
                    </div>
                    <div className="achv-date">
                      Earned on {new Date(achievement.completedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
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