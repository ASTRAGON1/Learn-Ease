import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./InstructorDashboard2.css";
import { USER_CURRICULUM } from "../data/curriculum";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import icProfile from "../assets/Profile.png";
import testPath from "../assets/testPath.png";
import community from "../assets/community.png";
import teachPic from "../assets/teachPic.png";
import performanceIcon from "../assets/performance.png";
import feedbackSupport from "../assets/feedback&support.png";

export default function InstructorDashboard2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState("course");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Get instructor name (without backend for now)
  const [instructorName] = useState(() => {
    const fullName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || 
                     'Instructor';
    return fullName.split(' ')[0];
  });

  // Sample data for instructor dashboard
  const sampleMetrics = [
    { label: "Content views", value: "2,315", change: "+11.01%" },
    { label: "Likes given", value: "1,032", change: "+1.01%" },
    { label: "Favorites given", value: "300", change: "+15.01%" },
    { label: "Engagement", value: "600", change: "-12.01%" },
  ];

  const sampleNotifications = [
    { type: "follow", text: "New student followed you", time: "59 minutes ago" },
    { type: "like", text: "New student liked your video", time: "1 hour ago" },
    { type: "approve", text: "Admin approved your content", time: "2 hours ago" },
    { type: "visit", text: "1,000 students visited your page", time: "3 hours ago" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("le_instructor_token");
    localStorage.removeItem("le_instructor_name");
    navigate("/InstructorLogin");
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.ld-profile-container')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const handleChatbotClick = () => {
    console.log("Chatbot clicked");
  };

  // Sidebar items
  const sidebarItems = [
    { 
      key: "course", 
      label: "Course", 
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => setActiveSection("course")
    },
    { 
      key: "performance", 
      label: "Performance", 
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => setActiveSection("performance")
    },
    { 
      key: "curriculum", 
      label: "Curriculum", 
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => setActiveSection("curriculum")
    },
    { 
      key: "resources", 
      label: "Resources", 
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => setActiveSection("resources")
    },
    { 
      key: "profile", 
      label: "Profile", 
      icon: <img src={icProfile} alt="" style={{ width: "24px", height: "24px" }} />, 
      to: "/ProfileSettings"
    },
  ];

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  // Render Course Section
  const renderCourseSection = () => (
    <>
      <section className="ld-welcome-section">
        <div className="ld-welcome-card">
          <h2 className="ld-welcome-title">Welcome {instructorName}, ready to teach?</h2>
          <p className="ld-welcome-subtitle">Upload your content and start teaching today</p>
        </div>
      </section>

      <section className="ld-upload-section">
        <div className="ld-upload-card">
          <div className="ld-upload-content">
            <h3 className="ld-upload-title">Upload your content here</h3>
            <p className="ld-upload-desc">Share your knowledge with students</p>
          </div>
          <button className="ld-upload-btn" onClick={() => navigate("/instructor-upload-2")}>
            Let's dive in
          </button>
        </div>
      </section>

      <section className="ld-ai-section">
        <div className="ld-ai-card">
          <h3 className="ld-ai-title">Generate quizzes using AI</h3>
          <p className="ld-ai-desc">
            Our AI-powered quiz tool helps you generate personalized quizzes based on the curriculum 
            you follow on our platform — perfect for assessing student progress quickly and effectively.
          </p>
          <button className="ld-ai-btn" onClick={() => navigate("/ai-quiz")}>
            Generate
          </button>
        </div>
      </section>

      <div className="ld-tips-grid">
        <div className="ld-tip-card">
          <h4 className="ld-tip-title">Tip of the day</h4>
          <p className="ld-tip-text">
            Boost your teaching with daily strategies tailored for students with autism and Down 
            syndrome. Practical, short, and easy to apply.
          </p>
        </div>
        <div className="ld-tip-card">
          <h4 className="ld-tip-title">Community & Support</h4>
          <p className="ld-tip-text">Ask questions, share tips, and connect with other instructors.</p>
          <button className="ld-community-btn" onClick={() => navigate("/InstructorCommunity")}>
            Join Now
          </button>
        </div>
      </div>

      <section className="ld-resources-section">
        <h3 className="ld-resources-heading">
          Have questions? Here are our most popular instructor resources.
        </h3>
        <div className="ld-resources-grid">
          <Link to="/teachingCenter" className="ld-resource-card">
            <img src={testPath} alt="Test Video" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Test Video</h5>
            <p className="ld-resource-desc">See how your videos gets treated</p>
          </Link>
          <Link to="/InstructorCommunity" className="ld-resource-card">
            <img src={community} alt="Community" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Community</h5>
            <p className="ld-resource-desc">
              Communicate with other instructors. Ask questions, have discussions, and more.
            </p>
          </Link>
          <Link to="/teachingCenter" className="ld-resource-card">
            <img src={teachPic} alt="How to teach" className="ld-resource-icon" />
            <h5 className="ld-resource-title">How to teach in LearnEase</h5>
            <p className="ld-resource-desc">
              Learn how to use our platform to get the best results and satisfy the students.
            </p>
          </Link>
          <Link to="/InstructorDash" className="ld-resource-card">
            <img src={performanceIcon} alt="Performance" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Performance</h5>
            <p className="ld-resource-desc">
              See how students like your contents, quiz results analysis, and more.
            </p>
          </Link>
          <Link to="/HelpAndSupport" className="ld-resource-card">
            <img src={feedbackSupport} alt="Feedback & Support" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Feedback & Support</h5>
            <p className="ld-resource-desc">Get feedback and support from students.</p>
          </Link>
        </div>
      </section>

      <section className="ld-cta-section">
        <div className="ld-cta-card">
          <p className="ld-cta-text">Are You Ready to Begin?</p>
          <button className="ld-cta-btn" onClick={() => navigate("/instructor-upload-2")}>
            Upload Your Content
          </button>
        </div>
      </section>
    </>
  );

  // Render Performance Section
  const renderPerformanceSection = () => (
    <>
      <section className="ld-metrics-section">
        <h2 className="ld-section-title">Performance Metrics</h2>
        <div className="ld-metrics-grid">
          {sampleMetrics.map((metric, index) => (
            <div key={index} className="ld-metric-card">
              <span className="ld-metric-label">{metric.label}</span>
              <span className="ld-metric-value">{metric.value}</span>
              <span className={`ld-metric-change ${metric.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {metric.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="ld-notifications-section">
        <h2 className="ld-section-title">Recent Notifications</h2>
        <div className="ld-notifications-list">
          {sampleNotifications.map((notif, index) => (
            <div key={index} className="ld-notification-item">
              <div className="ld-notification-icon">{notif.type === "follow" ? "👤" : notif.type === "like" ? "❤️" : notif.type === "approve" ? "✅" : "👁️"}</div>
              <div className="ld-notification-content">
                <p className="ld-notification-text">{notif.text}</p>
                <span className="ld-notification-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  // Render Curriculum Section
  const renderCurriculumSection = () => (
    <>
      <section className="ld-curriculum-section">
        <h2 className="ld-section-title">Learning Paths</h2>
        <p className="ld-curriculum-subtitle">Two paths: Autism and Down Syndrome.</p>
        <div className="ld-curriculum-list">
          {USER_CURRICULUM.map((path) => (
            <div key={path.GeneralPath} className="ld-curriculum-path-item">
              <div className="ld-curriculum-path-header">
                <div className="ld-curriculum-path-badge">{path.pathTitle}</div>
                <span className="ld-curriculum-path-count">{path.Courses.length} courses</span>
              </div>

              <div className="ld-curriculum-courses-list">
                {path.Courses.map((course, ci) => (
                  <details key={ci} className="ld-curriculum-course-item">
                    <summary className="ld-curriculum-course-summary">
                      <div className="ld-curriculum-course-title"><strong>{course.CoursesTitle}</strong></div>
                      <span className="ld-curriculum-course-meta">
                        {course.Topics ? `${course.Topics.length} topics` : "No topics"}
                      </span>
                    </summary>

                    {course.Topics && (
                      <div className="ld-curriculum-topics-list">
                        {course.Topics.map((topic, ti) => (
                          <details key={ti} className="ld-curriculum-topic-item">
                            <summary className="ld-curriculum-topic-summary">
                              <div className="ld-curriculum-topic-title"><b>{topic.TopicsTitle}</b></div>
                              <span className="ld-curriculum-topic-meta">
                                {topic.lessons ? `${topic.lessons.length} lessons` : "No lessons"}
                              </span>
                            </summary>

                            {topic.lessons && (
                              <div className="ld-curriculum-lessons-list">
                                {topic.lessons.map((lesson, li) => (
                                  <div key={li} className="ld-curriculum-lesson-item">
                                    <span>{lesson}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </details>
                        ))}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  // Render Resources Section
  const renderResourcesSection = () => (
    <>
      <section className="ld-resources-main-section">
        <h2 className="ld-section-title">Resources</h2>
        <div className="ld-resources-main-grid">
          <Link to="/TeachingCenter" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">📚</div>
            <h4 className="ld-resource-main-title">Teaching Center</h4>
            <p className="ld-resource-main-desc">
              Find articles on LearnEase teaching — from course creation to marketing.
            </p>
          </Link>
          <Link to="/InstructorCommunity" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">👥</div>
            <h4 className="ld-resource-main-title">Instructor Community</h4>
            <p className="ld-resource-main-desc">
              Share your progress and ask other instructors questions in our community.
            </p>
          </Link>
          <Link to="/HelpAndSupport" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">💬</div>
            <h4 className="ld-resource-main-title">Help and support</h4>
            <p className="ld-resource-main-desc">
              Can't find what you need? Our support team is happy to help.
            </p>
          </Link>
        </div>
      </section>
    </>
  );

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
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          {/* Navigation Items */}
          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key} className={activeSection === item.key ? "active" : ""}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">
                      {item.icon}
                    </span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">
                      {item.icon}
                    </span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <div className="ld-sidebar-footer">
            <button 
              className="ld-sidebar-link ld-sidebar-logout"
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
          <div className="ld-header-center">
            <div className="ld-search-container">
              <input 
                type="text" 
                placeholder="Search" 
                className="ld-search-input"
              />
              <button className="ld-search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="ld-header-right">
            <button className="ld-notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div className="ld-profile-container">
              <button 
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  <div className="ld-profile-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  <div className="ld-profile-username">@instructor</div>
                </div>
                <svg 
                  className={`ld-profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {profileDropdownOpen && (
                <div className="ld-profile-dropdown">
                  <div className="ld-profile-dropdown-header">
                    <div className="ld-profile-dropdown-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">instructor@learnease.com</div>
                    </div>
                  </div>
                  <div className="ld-profile-dropdown-divider"></div>
                  <Link to="/ProfileSettings" className="ld-profile-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile Settings</span>
                  </Link>
                  <button className="ld-profile-dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="ld-content">
          {activeSection === "course" && renderCourseSection()}
          {activeSection === "performance" && renderPerformanceSection()}
          {activeSection === "curriculum" && renderCurriculumSection()}
          {activeSection === "resources" && renderResourcesSection()}
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
            <rect x="4" y="6" width="16" height="14" rx="2" fill="currentColor" />
            <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
            <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="11" r="1.5" fill="white"/>
            <circle cx="15" cy="11" r="1.5" fill="white"/>
            <circle cx="9" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            <circle cx="15" cy="11" r="0.8" fill="#7d4cff" opacity="0.8"/>
            <rect x="9" y="15" width="6" height="2" rx="1" fill="white"/>
            <circle cx="7" cy="9" r="0.5" fill="white" opacity="0.6"/>
            <circle cx="17" cy="9" r="0.5" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div className="ai-chatbot-pulse"></div>
      </div>
    </div>
  );
}

