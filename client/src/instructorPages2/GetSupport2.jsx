import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./GetSupport2.css";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";

export default function GetSupport2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // AI chat state
  const [chat, setChat] = useState([
    { who: "bot", text: "Hi! Ask anything about LearnEase." },
  ]);
  const [q, setQ] = useState("");
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Admin ticket state
  const [subj, setSubj] = useState("");
  const [cat, setCat] = useState("General");
  const [msg, setMsg] = useState("");
  const [tickets, setTickets] = useState([
    { id: "T-1021", subject: "Video upload stuck", status: "Open" },
    { id: "T-1017", subject: "Profile image not saving", status: "Closed" },
    { id: "T-1015", subject: "Dashboard not loading", status: "Open" },
    { id: "T-1012", subject: "Quiz creation issue", status: "Closed" },
    { id: "T-1010", subject: "Upload progress not showing", status: "Open" },
    { id: "T-1008", subject: "Content approval delay", status: "Closed" },
    { id: "T-1005", subject: "Login problem", status: "Open" },
  ]);

  // Get instructor name
  const [instructorName] = useState(() => {
    const fullName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || 
                     'Instructor';
    return fullName.split(' ')[0];
  });

  const sendAI = () => {
    if (!q.trim()) return;
    setChat((c) => [...c, { who: "me", text: q }]);
    setTimeout(() => {
      setChat((c) => [
        ...c,
        { who: "bot", text: "Thanks! AI will be wired soon." },
      ]);
    }, 400);
    setQ("");
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // Auto-focus input when navigated from chatbot
  useEffect(() => {
    if (location.state?.focusInput && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
        chatInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [location.state]);

  const sendTicket = () => {
    if (!subj.trim() || !msg.trim()) return;
    setTickets((t) => [
      { id: `T-${1000 + t.length + 1}`, subject: subj, status: "Open" },
      ...t,
    ]);
    setSubj("");
    setMsg("");
    alert("Ticket sent to admin (backend hook later).");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("le_instructor_token");
    localStorage.removeItem("le_instructor_name");
    navigate("/InstructorLogin");
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
            <button className="ld-back-btn" onClick={() => navigate("/HelpAndSupport-2")}>
              <span className="ld-back-chev">‹</span> Get Back
            </button>
          </div>
          <div className="ld-header-center">
            <h1 className="ld-upload-header-title">Get support</h1>
          </div>
          <div className="ld-header-right">
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
          <div className="gs-grid">
            {/* Left: AI Chat */}
            <section className="gs-card">
              <h3 className="gs-card-title">Ask our AI</h3>
              
              <div className="gs-chat-container">
                <div className="gs-chat">
                  {chat.map((m, i) => (
                    <div key={i} className={`gs-message ${m.who}`}>
                      <div className="gs-message-content">{m.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="gs-chat-input-row">
                <input
                  ref={chatInputRef}
                  className="gs-chat-input"
                  placeholder="Type your question…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAI()}
                />
                <button className="gs-send-btn" onClick={sendAI}>Send</button>
              </div>
            </section>

            {/* Right: Admin Contact + Tickets */}
            <section className="gs-card">
              <h3 className="gs-card-title">Contact admin</h3>

              <div className="gs-form-field">
                <label className="gs-form-label">Subject</label>
                <input
                  className="gs-form-input"
                  value={subj}
                  onChange={(e) => setSubj(e.target.value)}
                  placeholder="Brief summary"
                />
              </div>

              <div className="gs-form-field">
                <label className="gs-form-label">Category</label>
                <select
                  className="gs-form-input"
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                >
                  <option>General</option>
                  <option>Account</option>
                  <option>Publishing</option>
                  <option>Performance</option>
                  <option>Payments</option>
                </select>
              </div>

              <div className="gs-form-field">
                <label className="gs-form-label">Message</label>
                <textarea
                  className="gs-form-textarea"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Describe your issue…"
                />
              </div>

              <div className="gs-form-actions">
                <button className="gs-primary-btn" onClick={sendTicket}>
                  Send to admin
                </button>
              </div>

              <h4 className="gs-tickets-title">Your tickets</h4>
              <div className="gs-tickets-container">
                <div className="gs-tickets-list">
                  {tickets.map((t) => (
                    <div key={t.id} className="gs-ticket-item">
                      <span className="gs-ticket-id">{t.id}</span>
                      <span className="gs-ticket-subject">{t.subject}</span>
                      <span className={`gs-ticket-status ${t.status.toLowerCase()}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

