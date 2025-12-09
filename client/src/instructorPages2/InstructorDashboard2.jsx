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
import RainfallChart from "../components/RainfallChart";
import QuizResults from "../components/QuizResults";
import RankingTagsPanel from "../components/RankingAndTags";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";

export default function InstructorDashboard2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState("course");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [mongoToken, setMongoToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check Firebase Auth and get MongoDB token
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      if (!firebaseUser) {
        // Not authenticated - redirect to login
        setLoading(false);
        navigate('/all-login');
        return;
      }

      try {
        // Get MongoDB token using Firebase Auth
        const token = await getMongoDBToken();
        if (!token) {
          console.error('Failed to get MongoDB token');
          setLoading(false);
          navigate('/all-login');
          return;
        }

        setMongoToken(token);

        // Fetch teacher data and check information gathering
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          setLoading(false);
          navigate('/all-login');
          return;
        }

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            const teacher = data.data || data;
            
            // Update instructor name from API
            if (teacher.fullName) {
              const firstName = teacher.fullName.split(' ')[0];
              setInstructorName(firstName);
            }
            
            // Set email and profile picture
            if (teacher.email) {
              setEmail(teacher.email);
            }
            if (teacher.profilePic) {
              setProfilePic(teacher.profilePic);
            }
            
            // Check if information gathering is complete
            const isInfoGatheringComplete = teacher.informationGatheringComplete === true;
            
            if (!isInfoGatheringComplete) {
              const areasOfExpertise = teacher.areasOfExpertise || [];
              const cv = teacher.cv || '';
              
              // Determine which step to redirect to based on what data is missing
              if (areasOfExpertise.length === 0) {
                setLoading(false);
                navigate('/InformationGathering-1');
                return;
              } else if (!cv || cv.trim() === '') {
                setLoading(false);
                navigate('/InformationGathering-2');
                return;
              } else {
                setLoading(false);
                navigate('/InformationGathering-3');
                return;
              }
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking information gathering status:', error);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Sample data for instructor dashboard
  const sampleMetrics = [
    { label: "Content views", value: "2,315", change: "+11.01%" },
    { label: "Likes given", value: "1,032", change: "+1.01%" },
    { label: "Favorites given", value: "300", change: "+15.01%" },
  ];

  // Notifications - stored in component state only (no storage)
  const [notifications, setNotifications] = useState([
      { id: Date.now() - 86400000, type: "likes", text: "You reached 1,032 likes", time: "2 hours ago", read: false, timestamp: Date.now() - 7200000 },
      { id: Date.now() - 86400000 + 1, type: "approved", text: "You got accepted by the admin", time: "5 hours ago", read: false, timestamp: Date.now() - 18000000 },
      { id: Date.now() - 86400000 + 2, type: "views", text: "You reached 2,315 views", time: "1 day ago", read: false, timestamp: Date.now() - 86400000 },
      { id: Date.now() - 86400000 + 3, type: "likes", text: "You reached 1,000 likes milestone", time: "3 days ago", read: false, timestamp: Date.now() - 259200000 },
      { id: Date.now() - 86400000 + 4, type: "uploaded", text: "Your content got uploaded successfully", time: "2 days ago", read: false, timestamp: Date.now() - 172800000 },
      { id: Date.now() - 86400000 + 5, type: "report", text: "You uploaded a new report", time: "3 days ago", read: false, timestamp: Date.now() - 259200000 },
      { id: Date.now() - 86400000 + 6, type: "feedback", text: "You submitted new feedback", time: "4 days ago", read: false, timestamp: Date.now() - 345600000 },
  ]);

  // Function to add a new notification
  const addNotification = (type, text) => {
    const newNotif = {
      id: Date.now(),
      type,
      text,
      time: "Just now",
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Function to mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  // Function to delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Sample quiz results data
  const sampleQuizResults = [
    { student: "ByeWind", date: "Jun 24, 2025", grade: "85%", status: "Complete" },
    { student: "Natali Craig", date: "Mar 10, 2025", grade: "50%", status: "Complete" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "nouaim", date: "Mar 10, 2025", grade: "--%", status: "Paused" },
    { student: "John Smith", date: "Mar 11, 2025", grade: "92%", status: "Complete" },
    { student: "Sarah Johnson", date: "Mar 11, 2025", grade: "78%", status: "Complete" },
    { student: "Mike Davis", date: "Mar 12, 2025", grade: "65%", status: "Complete" },
    { student: "Emily Brown", date: "Mar 12, 2025", grade: "--%", status: "Paused" },
    { student: "Chris Wilson", date: "Mar 13, 2025", grade: "88%", status: "Complete" },
    { student: "Lisa Anderson", date: "Mar 13, 2025", grade: "71%", status: "Complete" },
    { student: "David Martinez", date: "Mar 14, 2025", grade: "--%", status: "Paused" },
    { student: "Amy Taylor", date: "Mar 14, 2025", grade: "95%", status: "Complete" },
    { student: "James Garcia", date: "Mar 15, 2025", grade: "82%", status: "Complete" },
    { student: "Jessica Lee", date: "Mar 15, 2025", grade: "--%", status: "Paused" },
  ];

  // Sample instructor ranking data
  const sampleInstructors = [
    { id: 1, name: "Alice", likes: 3200 },
    { id: 2, name: "Bob", likes: 2900 },
    { id: 3, name: "Charlie", likes: 2700 },
    { id: 4, name: "Dave", likes: 2200 },
    { id: 5, name: "Eve", likes: 2100 },
    { id: 6, name: "Frank", likes: 2000 },
    { id: 7, name: "Grace", likes: 1800 },
    { id: 8, name: "Henry", likes: 1700 },
    { id: 9, name: "Ivy", likes: 1500 },
    { id: 10, name: "Jack", likes: 1400 },
    { id: 11, name: "Kate", likes: 1300 },
    { id: 12, name: "You", likes: 123 },
    { id: 13, name: "Liam", likes: 100 },
    { id: 14, name: "Mia", likes: 95 },
    { id: 15, name: "Noah", likes: 87 },
  ];

  const handleLogout = async () => {
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login");
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
    navigate("/getSupport-2", { state: { focusInput: true } });
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
          <button className="ld-ai-btn" onClick={() => navigate("/ai-quiz-2")}>
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
          <Link to="/teachingCenter-2" className="ld-resource-card">
            <img src={testPath} alt="Test Video" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Test Video</h5>
            <p className="ld-resource-desc">See how your videos gets treated</p>
          </Link>
          <Link to="/InstructorCommunity-2" className="ld-resource-card">
            <img src={community} alt="Community" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Community</h5>
            <p className="ld-resource-desc">
              Communicate with other instructors. Ask questions, have discussions, and more.
            </p>
          </Link>
          <Link to="/teachingCenter-2" className="ld-resource-card">
            <img src={teachPic} alt="How to teach" className="ld-resource-icon" />
            <h5 className="ld-resource-title">How to teach in LearnEase</h5>
            <p className="ld-resource-desc">
              Learn how to use our platform to get the best results and satisfy the students.
            </p>
          </Link>
          <div 
            className="ld-resource-card" 
            onClick={() => setActiveSection("performance")}
            style={{ cursor: 'pointer' }}
          >
            <img src={performanceIcon} alt="Performance" className="ld-resource-icon" />
            <h5 className="ld-resource-title">Performance</h5>
            <p className="ld-resource-desc">
              See how students like your contents, quiz results analysis, and more.
            </p>
          </div>
          <Link to="/HelpAndSupport-2" className="ld-resource-card">
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

      {/* Chart and Notifications Side by Side */}
      <section className="ld-chart-notifications-section">
        <div className="ld-chart-notifications-grid">
          {/* Views and Likes Chart */}
          <div className="ld-chart-wrapper">
            <div className="ld-chart-card">
              <h3 className="ld-chart-title">Total Views & Likes</h3>
              <RainfallChart />
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="ld-notifications-wrapper">
            <div className="ld-notifications-card">
              <h3 className="ld-notifications-title">Recent Notifications</h3>
        <div className="ld-notifications-list">
                {notifications.length === 0 ? (
                  <div className="ld-notification-empty">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`ld-notification-item ${notif.read ? 'read' : ''}`} 
                      data-type={notif.type}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="ld-notification-icon">
                        {notif.type === "likes" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        ) : notif.type === "approved" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : notif.type === "views" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : notif.type === "uploaded" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        ) : notif.type === "report" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        ) : notif.type === "feedback" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            <path d="M13 8H7"></path>
                            <path d="M17 12H7"></path>
                          </svg>
                        ) : "📢"}
                      </div>
              <div className="ld-notification-content">
                <p className="ld-notification-text">{notif.text}</p>
                <span className="ld-notification-time">{notif.time}</span>
              </div>
                      {!notif.read && <div className="ld-notification-unread-indicator"></div>}
                      <button 
                        className="ld-notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Results and Instructor Ranking Grid */}
      <section className="ld-results-ranking-section">
        <div className="ld-results-ranking-grid">
          <div className="ld-quiz-results-wrapper">
            <QuizResults data={sampleQuizResults} />
          </div>
          <div className="ld-ranking-wrapper">
            <RankingTagsPanel instructors={sampleInstructors} categories={[]} />
            </div>
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
          <Link to="/TeachingCenter-2" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="8" y1="7" x2="18" y2="7"></line>
                <line x1="8" y1="11" x2="18" y2="11"></line>
                <line x1="8" y1="15" x2="14" y2="15"></line>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Teaching Center</h4>
            <p className="ld-resource-main-desc">
              Find articles on LearnEase teaching — from course creation to marketing.
            </p>
          </Link>
          <Link to="/InstructorCommunity-2" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Instructor Community</h4>
            <p className="ld-resource-main-desc">
              Share your progress and ask other instructors questions in our community.
            </p>
          </Link>
          <Link to="/HelpAndSupport-2" className="ld-resource-main-card">
            <div className="ld-resource-main-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <h4 className="ld-resource-main-title">Help and support</h4>
            <p className="ld-resource-main-desc">
              Can't find what you need? Our support team is happy to help.
            </p>
          </Link>
        </div>
      </section>
    </>
  );

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="ld-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '12px' }}>Loading...</div>
        </div>
      </div>
    );
  }

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
          <div className="ld-header-right">
            <div className="ld-notification-wrapper">
            <button className="ld-notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
              <div className="ld-notification-popover">
                <div className="ld-notification-popover-header">
                  <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                  {notifications.length > 0 && (
                    <button 
                      className="ld-notification-clear-btn"
                      onClick={() => setNotifications([])}
                      title="Clear all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="ld-notification-popover-list">
                  {notifications.length === 0 ? (
                    <div className="ld-notification-empty">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`ld-notification-popover-item ${notif.read ? 'read' : ''}`} 
                        data-type={notif.type}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="ld-notification-popover-icon">
                          {notif.type === "likes" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          ) : notif.type === "approved" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : notif.type === "views" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : notif.type === "uploaded" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          ) : notif.type === "report" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          ) : notif.type === "feedback" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              <path d="M13 8H7"></path>
                              <path d="M17 12H7"></path>
                            </svg>
                          ) : "📢"}
                        </div>
                        <div className="ld-notification-popover-content">
                          <div className="ld-notification-popover-text">{notif.text}</div>
                          <div className="ld-notification-popover-time">{notif.time}</div>
                        </div>
                        {!notif.read && <div className="ld-notification-unread-dot"></div>}
                        <button 
                          className="ld-notification-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="ld-profile-container">
              <button 
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="ld-profile-avatar-image"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                  <div className="ld-profile-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                  )}
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  {email && <div className="ld-profile-email">{email}</div>}
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
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt="Profile" 
                        className="ld-profile-dropdown-avatar-img"
                      />
                    ) : (
                    <div className="ld-profile-dropdown-avatar">{instructorName.slice(0, 2).toUpperCase()}</div>
                    )}
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">{email || 'No email'}</div>
                    </div>
                  </div>
                  <div className="ld-profile-dropdown-divider"></div>
                  <Link to="/profile-2" className="ld-profile-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
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

