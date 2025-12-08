import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorDashboard2.css";
import "./Profile2.css";
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";

const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Canada", "India",
  "Morocco", "Algeria", "Tunisia", "Spain", "Italy", "Australia", "Brazil", "Japan"
];

export default function Profile2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tab, setTab] = useState("profile");

  // Get instructor name
  const [instructorName] = useState(() => {
    const fullName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || 
                     'Instructor';
    return fullName.split(' ')[0];
  });

  // LearnEase Profile
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");
  const [avatarStoragePath, setAvatarStoragePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Private settings
  const [email, setEmail] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Load notification preferences from localStorage or use defaults
  const [notif, setNotif] = useState(() => {
    try {
      const stored = localStorage.getItem('instructorNotificationPrefs');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading notification prefs:', e);
    }
    // Default: all enabled
    return {
      updates: true,
      admin: true,
      performance: true,
      ranking: true,
      followers: true,
    };
  });
  
  // Save notification preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('instructorNotificationPrefs', JSON.stringify(notif));
    } catch (e) {
      console.error('Error saving notification prefs:', e);
    }
  }, [notif]);

  useEffect(() => {
    // Load data from localStorage only, no backend calls
    const storedName = localStorage.getItem('userName') || 
                     localStorage.getItem('le_instructor_name') || 
                     sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('le_instructor_name') || '';
    
    if (storedName) {
      setFullName(storedName);
    }
    
    const storedEmail = localStorage.getItem('userEmail') || 
                       sessionStorage.getItem('userEmail') || 
                       'instructor@learnease.com';
    setEmail(storedEmail);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load avatar from localStorage if available
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar && !avatarFile) {
      setAvatarURL(storedAvatar);
    }
    
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarURL(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);
  
  useEffect(() => {
    // Load saved profile data from localStorage on mount
    const storedHeadline = localStorage.getItem('userHeadline');
    const storedBio = localStorage.getItem('userBio');
    const storedCountry = localStorage.getItem('userCountry');
    const storedWebsite = localStorage.getItem('userWebsite');
    
    if (storedHeadline) setHeadline(storedHeadline);
    if (storedBio) setBio(storedBio);
    if (storedCountry) setCountry(storedCountry);
    if (storedWebsite) setWebsite(storedWebsite);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const onDropAvatar = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setAvatarFile(f);
  };

  const saveProfile = () => {
    // Save to localStorage only, no backend calls
    if (fullName) {
      localStorage.setItem('userName', fullName);
      localStorage.setItem('le_instructor_name', fullName);
    }
    
    // Save other profile data to localStorage
    if (headline) localStorage.setItem('userHeadline', headline);
    if (bio) localStorage.setItem('userBio', bio);
    if (country) localStorage.setItem('userCountry', country);
    if (website) localStorage.setItem('userWebsite', website);
    if (email) {
      localStorage.setItem('userEmail', email);
    }
    
    // Handle avatar file if selected
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarURL(reader.result);
        localStorage.setItem('userAvatar', reader.result);
      };
      reader.readAsDataURL(avatarFile);
    }
    
    alert("Profile saved successfully");
    setAvatarFile(null);
  };

  const changePassword = () => {
    if (!newPwd || newPwd.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== newPwd2) {
      alert("New passwords do not match.");
      return;
    }

    // Save password to localStorage (not secure, but no backend)
    localStorage.setItem('userPassword', newPwd);
    setHasPassword(true);
    alert("Password updated successfully (stored locally)");
    setShowPwdModal(false);
    setCurrentPwd("");
    setNewPwd("");
    setNewPwd2("");
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
    return <div>Loading...</div>;
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
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2")}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-center">
            <h1 className="ld-upload-header-title">Profile Settings</h1>
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
          {/* Tabs */}
          <div className="pf-tabs">
            <button
              className={`pf-tab ${tab === "profile" ? "active" : ""}`}
              onClick={() => setTab("profile")}
            >
              Profile
            </button>
            <button
              className={`pf-tab ${tab === "private" ? "active" : ""}`}
              onClick={() => setTab("private")}
            >
              Private Settings
            </button>
          </div>

          {/* Profile Tab */}
          {tab === "profile" && (
            <section className="pf-card">
              <h3 className="pf-card-title">LearnEase Profile</h3>

              {/* Avatar Upload */}
              <div className="pf-avatar-section">
                <div
                  className="pf-avatar-upload"
                  onDrop={onDropAvatar}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {avatarURL ? (
                    <img src={avatarURL} alt="Profile" className="pf-avatar-image" />
                  ) : (
                    <div className="pf-avatar-placeholder">
                      {fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="pf-avatar-overlay">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="pf-avatar-input"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className="pf-avatar-label">
                      Change Photo
                    </label>
                  </div>
                </div>
                {uploadingAvatar && <div className="pf-upload-status">Uploading...</div>}
              </div>

              {/* Form Fields */}
              <div className="pf-form-grid">
                <div className="pf-form-field">
                  <label className="pf-form-label">Full Name*</label>
                  <input
                    className="pf-form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="pf-form-field">
                  <label className="pf-form-label">Headline</label>
                  <input
                    className="pf-form-input"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g., Special Education Expert"
                  />
                </div>

                <div className="pf-form-field pf-form-field-full">
                  <label className="pf-form-label">Bio</label>
                  <textarea
                    className="pf-form-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="pf-form-field">
                  <label className="pf-form-label">Country</label>
                  <select
                    className="pf-form-select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="pf-form-field">
                  <label className="pf-form-label">Website</label>
                  <input
                    className="pf-form-input"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="pf-form-actions">
                <button className="pf-primary-btn" onClick={saveProfile}>
                  Save Profile
                </button>
              </div>
            </section>
          )}

          {/* Private Settings Tab */}
          {tab === "private" && (
            <section className="pf-card">
              <h3 className="pf-card-title">Private Settings</h3>

              <div className="pf-form-field">
                <label className="pf-form-label">Email</label>
                <input
                  className="pf-form-input"
                  type="email"
                  value={email}
                  disabled
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                />
              </div>

              <div className="pf-form-field">
                <label className="pf-form-label">Password</label>
                <div className="pf-password-section">
                  <input
                    className="pf-form-input"
                    type="password"
                    value={hasPassword ? "•••••••••••••••" : "Not set"}
                    disabled
                    style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                  />
                  <button className="pf-secondary-btn" onClick={() => setShowPwdModal(true)}>
                    Change Password
                  </button>
                </div>
              </div>

              <h4 className="pf-section-title">Notifications preferences</h4>
              <div className="pf-notifications-list">
                {Object.entries(notif).map(([key, value]) => {
                  // Map notification types to display names
                  const displayNames = {
                    updates: "Updates and offerings",
                    admin: "Notifications from the admin",
                    performance: "Performance notifications",
                    ranking: "Instructor ranking notifications",
                    followers: "Profile followers, visitors notifications",
                  };
                  
                  return (
                    <div key={key} className="pf-notification-item">
                      <span className="pf-notification-label">
                        {displayNames[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <label className="pf-toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })}
                          className="pf-toggle-input"
                        />
                        <span className="pf-toggle-slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="pf-form-actions">
                <button className="pf-secondary-btn">Save Settings</button>
              </div>

              <div className="pf-delete-account-section">
                <h4 className="pf-section-title">Close account</h4>
                <div className="pf-delete-warning">
                  <strong>Warning:</strong> If you close your account, you will lose all access to your account and data associated with it, even if you create a new account with the same email.
                </div>
                <button className="pf-delete-account-btn" onClick={() => {
                  if (window.confirm("Are you sure you want to close your account? This action cannot be undone.")) {
                    // Clear all localStorage data
                    localStorage.clear();
                    sessionStorage.clear();
                    navigate("/InstructorLogin");
                  }
                }}>
                  Close account
                </button>
              </div>
            </section>
          )}

          {/* Password Change Modal */}
          {showPwdModal && (
            <div className="pf-modal-overlay" onClick={() => setShowPwdModal(false)}>
              <div className="pf-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="pf-modal-title">Change Password</h3>
                
                <div className="pf-form-field">
                  <label className="pf-form-label">Current Password</label>
                  <input
                    className="pf-form-input"
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                  />
                </div>

                <div className="pf-form-field">
                  <label className="pf-form-label">New Password</label>
                  <input
                    className="pf-form-input"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                </div>

                <div className="pf-form-field">
                  <label className="pf-form-label">Confirm New Password</label>
                  <input
                    className="pf-form-input"
                    type="password"
                    value={newPwd2}
                    onChange={(e) => setNewPwd2(e.target.value)}
                  />
                </div>

                <div className="pf-modal-actions">
                  <button className="pf-secondary-btn" onClick={() => setShowPwdModal(false)}>
                    Cancel
                  </button>
                  <button className="pf-primary-btn" onClick={changePassword} disabled={changingPassword}>
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

