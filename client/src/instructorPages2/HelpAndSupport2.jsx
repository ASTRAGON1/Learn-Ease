import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./HelpAndSupport2.css";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";
import { useSimpleToast } from "../utils/toast";

const REPORT_TOPICS = [
  "Login or account issues",
  "uploading",
  "Content",
  "Stats or analytics",
  "Navigation",
];

const FEEDBACK_TOPICS = [
  "Instructor experience",
  "Curriculum quality",
  "design & usability",
  "Feature suggestions",
  "General feedback",
];

export default function HelpAndSupport2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [section, setSection] = useState("report");
  const [topic, setTopic] = useState(REPORT_TOPICS[0]);
  const [text, setText] = useState("");
  const MAX = 250;

  const [instructorName, setInstructorName] = useState('Instructor');
  const [instructorFullName, setInstructorFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { showToast, ToastComponent } = useSimpleToast();

  // Get instructor name from Firebase Auth
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      if (!firebaseUser) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (!token) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          setLoading(false);
          navigate('/all-login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          const teacher = data.data || data;
          if (teacher.fullName) {
            setInstructorFullName(teacher.fullName);
            setInstructorName(teacher.fullName.split(' ')[0]);
          }
          if (teacher.email) {
            setEmail(teacher.email);
          }
          if (teacher.profilePic) {
            setProfilePic(teacher.profilePic);
          }
        }
      } catch (error) {
        console.error('Error fetching instructor name:', error);
        setLoading(false);
        navigate('/all-login');
        return;
      }
      
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const topics = section === "report" ? REPORT_TOPICS : FEEDBACK_TOPICS;

  const switchSection = (s) => {
    setSection(s);
    setTopic((s === "report" ? REPORT_TOPICS : FEEDBACK_TOPICS)[0]);
    setText("");
  };

  const send = async () => {
    // Validate form
    if (!text.trim()) {
      showToast("Please enter a description", "error");
      return;
    }

    if (!topic) {
      showToast("Please select a topic", "error");
      return;
    }

    if (!instructorFullName) {
      showToast("Unable to get your name. Please try again.", "error");
      return;
    }

    setSending(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoint = section === "report" ? "/api/reports" : "/api/feedback";
      
      console.log('Sending request to:', `${API_URL}${endpoint}`);
      console.log('Request body:', {
        userName: instructorFullName,
        topic: topic,
        description: text.trim()
      });

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: instructorFullName,
          topic: topic,
          description: text.trim()
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        showToast("Server error. Please try again.", "error");
        setSending(false);
        return;
      }

      if (response.ok && data.success) {
        showToast("Thanks! We got your message.", "success");
        // Clear form
        setText("");
        setTopic((section === "report" ? REPORT_TOPICS : FEEDBACK_TOPICS)[0]);
      } else {
        console.error('Error response:', data);
        showToast(data.error || "Failed to send message. Please try again.", "error");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast("Failed to send message. Please check your connection and try again.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login", { replace: true });
  };

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

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

  // Sidebar items
  const sidebarItems = [
    { 
      key: "course", 
      label: "Course", 
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "performance", 
      label: "Performance", 
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "curriculum", 
      label: "Curriculum", 
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
    { 
      key: "resources", 
      label: "Resources", 
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />, 
      onClick: () => navigate("/instructor-dashboard-2")
    },
  ];

  if (loading) {
    return (
      <div className="ld-page">
        <div className="ld-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar */}
      <aside 
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ld-sidebar-footer">
            <button className="ld-sidebar-link ld-sidebar-logout" onClick={handleLogout}>
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
        {/* Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2", { state: { section: 'resources' } })}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-center">
            <h1 className="ld-upload-header-title">
              {section === "report" ? "Help and support" : "Feedback and support"}
            </h1>
          </div>
          <div className="ld-header-right">
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

        {/* Content Area */}
        <div className="ld-content">
          {/* Option Cards */}
          <div className="hs-cards-grid">
            <button
              type="button"
              className={`hs-option-card ${section === "report" ? "active" : ""}`}
              onClick={() => switchSection("report")}
            >
              <div className="hs-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="hs-card-title">Report an issue</h3>
              <p className="hs-card-desc">Found a bug or something not working? Let us know so we can fix it as soon as possible.</p>
            </button>

            <button
              type="button"
              className={`hs-option-card ${section === "feedback" ? "active" : ""}`}
              onClick={() => switchSection("feedback")}
            >
              <div className="hs-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
              </div>
              <h3 className="hs-card-title">Give a feedback</h3>
              <p className="hs-card-desc">Share your thoughts or suggestions to help us improve your experience.</p>
            </button>

            <button
              type="button"
              className="hs-option-card"
              onClick={() => navigate("/getSupport-2")}
            >
              <div className="hs-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="hs-card-title">Get support</h3>
              <p className="hs-card-desc">Need help with something? Contact our support team and we'll assist you shortly.</p>
            </button>
          </div>

          {/* Form Section */}
          <section className="hs-form-section">
            <div className="hs-form-card">
              <h2 className="hs-form-title">
                {section === "report" ? "Report an issue" : "Give a feedback"}
              </h2>

              <div className="hs-form-field">
                <label className="hs-form-label">
                  {section === "report"
                    ? "Select a Topic that you have an issue in"
                    : "Select a Topic You Want to Give Feedback On"}
                </label>
                <div className="hs-topics-grid">
                  {topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`hs-topic-chip ${topic === t ? "active" : ""}`}
                      onClick={() => setTopic(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hs-form-field">
                <label className="hs-form-label">Description</label>
                <div className="hs-textarea-wrapper">
                  <textarea
                    className="hs-textarea"
                    maxLength={MAX}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={section === "report" ? "Describe your issue here" : "Describe your feedback here"}
                  />
                  <span className="hs-char-counter">{text.length}/{MAX}</span>
                </div>
              </div>

              <div className="hs-form-actions">
                <button 
                  className="hs-send-button" 
                  onClick={send}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ToastComponent />
    </div>
  );
}

