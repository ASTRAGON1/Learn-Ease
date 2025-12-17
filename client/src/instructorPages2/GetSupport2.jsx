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
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";
import { useSimpleToast } from "../utils/toast";


const ProfileAvatar = ({ src, name, className, style, fallbackClassName }) => {
  const [error, setError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt="Profile"
        className={className}
        style={style}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {(name || "User").slice(0, 2).toUpperCase()}
    </div>
  );
};

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
  const [isAILoading, setIsAILoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);


  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState('active');
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
            setInstructorName(teacher.fullName.split(' ')[0]);
          }
          if (teacher.email) {
            setEmail(teacher.email);
          }
          if (teacher.profilePic) {
            setProfilePic(teacher.profilePic);
          }
          if (teacher.userStatus) {
            setUserStatus(teacher.userStatus);
            // Redirect if pending (but allow suspended users to access support)
            if (teacher.userStatus === 'pending') {
              showToast("You need to be accepted by the admin to access support.", "error");
              setTimeout(() => {
                navigate('/instructor-dashboard-2');
              }, 2000);
              return;
            }
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

  const sendAI = async () => {
    if (!q.trim() || isAILoading) return;

    const userMessage = q.trim();
    const currentChat = [...chat, { who: "me", text: userMessage }];
    setChat(currentChat);
    setQ("");
    setIsAILoading(true);

    // Add placeholder bot message that we'll update
    setChat((c) => [...c, { who: "bot", text: "" }]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Prepare conversation history (exclude the placeholder we just added)
      const conversationHistory = currentChat.filter(msg => msg.text);

      // Try streaming first
      try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: conversationHistory
          })
        });

        if (!response.ok) {
          throw new Error('Streaming failed, trying fallback');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.done) {
                  break;
                }

                if (data.content) {
                  accumulatedText += data.content;
                  // Update the last message (bot message) with accumulated text
                  setChat((c) => {
                    const newChat = [...c];
                    newChat[newChat.length - 1] = { who: "bot", text: accumulatedText };
                    return newChat;
                  });
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }

        setIsAILoading(false);
      } catch (streamError) {
        // Fallback to non-streaming
        console.log('Streaming failed, using non-streaming fallback:', streamError);

        const response = await fetch(`${API_URL}/api/ai/chat/non-streaming`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: conversationHistory
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setChat((c) => {
            const newChat = [...c];
            newChat[newChat.length - 1] = { who: "bot", text: data.data.response };
            return newChat;
          });
        } else {
          throw new Error(data.error || 'Failed to get AI response');
        }

        setIsAILoading(false);
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
      setChat((c) => {
        const newChat = [...c];
        newChat[newChat.length - 1] = {
          who: "bot",
          text: "Sorry, I'm having trouble right now. Please try again later or contact support."
        };
        return newChat;
      });
      setIsAILoading(false);
    }
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
                  <ProfileAvatar
                    src={profilePic}
                    name={instructorName}
                    className="ld-profile-avatar-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    fallbackClassName="ld-profile-avatar"
                  />
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
                    <ProfileAvatar
                      src={profilePic}
                      name={instructorName}
                      className="ld-profile-dropdown-avatar-img"
                      fallbackClassName="ld-profile-dropdown-avatar"
                    />
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
                  onKeyDown={(e) => e.key === "Enter" && !isAILoading && sendAI()}
                  disabled={isAILoading}
                />
                <button
                  className="gs-send-btn"
                  onClick={sendAI}
                  disabled={isAILoading || !q.trim()}
                >
                  {isAILoading ? "..." : "Send"}
                </button>
              </div>
            </section>

            {/* Right: Quick Help Resources */}
            <section className="gs-card">
              <h3 className="gs-card-title">Quick Help Resources</h3>
              <p className="gs-card-subtitle">Find answers and guides to get you started</p>

              {/* Quick Links */}
              <div className="gs-help-section">
                <h4 className="gs-help-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 16 16 12 12 8"></polyline>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Getting Started
                </h4>
                <div className="gs-help-links">
                  <button className="gs-help-link" onClick={() => navigate("/instructor-upload-2")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Upload Your First Content</span>
                  </button>
                  <button className="gs-help-link" onClick={() => navigate("/ai-quiz-2")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>Create Your First Quiz</span>
                  </button>
                  <button className="gs-help-link" onClick={() => navigate("/profile-2")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Complete Your Profile</span>
                  </button>
                </div>
              </div>

              {/* Common Issues */}
              <div className="gs-help-section">
                <h4 className="gs-help-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Common Solutions
                </h4>
                <div className="gs-faq-list">
                  <div className="gs-faq-item">
                    <div className="gs-faq-question">How do I upload content?</div>
                    <div className="gs-faq-answer">Go to Dashboard → Upload Content, select your file type, and follow the guided steps.</div>
                  </div>
                  <div className="gs-faq-item">
                    <div className="gs-faq-question">Why is my content pending?</div>
                    <div className="gs-faq-answer">All content is reviewed for quality. This usually takes 24-48 hours.</div>
                  </div>
                  <div className="gs-faq-item">
                    <div className="gs-faq-question">How to track my performance?</div>
                    <div className="gs-faq-answer">Visit the Performance section to see views, likes, and student engagement metrics.</div>
                  </div>
                </div>
              </div>

              {/* Report Issue */}
              <div className="gs-help-section">
                <h4 className="gs-help-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Still Need Help?
                </h4>
                <button
                  className="gs-report-btn"
                  onClick={() => navigate("/HelpAndSupport-2")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Report an Issue or Give Feedback
                </button>
              </div>

              {/* Platform Tips */}
              <div className="gs-tips-box">
                <div className="gs-tips-icon">💡</div>
                <div className="gs-tips-content">
                  <strong>Pro Tip:</strong> Students engage more with content that includes visual aids and interactive quizzes. Try adding both to your lessons!
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ToastComponent />
    </div>
  );
}

