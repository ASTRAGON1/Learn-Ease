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
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { uploadFile, deleteFileByPath } from "../utils/uploadFile";
import { getMongoDBToken } from "../utils/auth";

const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Canada", "India",
  "Morocco", "Algeria", "Tunisia", "Spain", "Italy", "Australia", "Brazil", "Japan"
];


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

export default function Profile2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tab, setTab] = useState("profile");

  const [instructorName, setInstructorName] = useState('Instructor');

  // LearnEase Profile
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");
  const [profilePicStoragePath, setProfilePicStoragePath] = useState("");
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

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Close account confirmation modal
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false); // type: "success" or "error"

  // Helper function to show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000); // Auto-hide after 4 seconds
  };

  // Notification preferences - stored in component state only (no storage)
  const [notif, setNotif] = useState({
    updates: true,
    admin: true,
    performance: true,
    ranking: true,
    followers: true,
  });

  useEffect(() => {
    let isMounted = true;

    // Fetch profile data from API using Firebase Auth
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

            // Set all profile fields from API
            if (teacher.fullName) {
              setFullName(teacher.fullName);
              // Update instructor name (first name only)
              const firstName = teacher.fullName.split(' ')[0];
              setInstructorName(firstName);
            }

            if (teacher.email) {
              setEmail(teacher.email);
            }

            if (teacher.headline) {
              setHeadline(teacher.headline);
            } else {
              setHeadline("");
            }

            if (teacher.bio) {
              setDescription(teacher.bio);
            } else {
              setDescription("");
            }

            if (teacher.country) {
              setCountry(teacher.country);
            } else {
              setCountry("");
            }

            if (teacher.website) {
              setWebsite(teacher.website);
            } else {
              setWebsite("");
            }

            if (teacher.profilePic) {
              setAvatarURL(teacher.profilePic);
              // Extract storage path from Firebase Storage URL if it's a Firebase URL
              // For Firebase URLs, we can't reliably extract the path, so we'll keep it empty
              // and handle deletion differently if needed
              setProfilePicStoragePath("");
            } else {
              // Clear avatar if no profile picture in API
              setAvatarURL("");
              setProfilePicStoragePath("");
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        navigate('/all-login');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Only create preview URL if a new file is selected
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarURL(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // Remove this useEffect - data is now loaded from API only

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const onDropAvatar = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setAvatarFile(f);
  };

  const saveProfile = async () => {
    // Get MongoDB token using Firebase Auth
    const token = await getMongoDBToken();

    if (!token) {
      showToast("You must be logged in to save your profile", "error");
      navigate('/all-login');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast("Please log in to save profile", "error");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let profilePicURL = avatarURL;
      let newProfilePicStoragePath = profilePicStoragePath;

      // Handle profile picture upload to Firebase Storage if a new file is selected
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          // Delete old profile picture from Firebase Storage if exists
          if (profilePicStoragePath) {
            try {
              await deleteFileByPath(profilePicStoragePath);
            } catch (e) {
              console.log('Could not delete old profile picture:', e);
            }
          }

          // Upload new profile picture to Firebase Storage
          const uploadResult = await uploadFile(
            avatarFile,
            'profile',
            currentUser.uid,
            null
          );

          profilePicURL = uploadResult.url;
          newProfilePicStoragePath = uploadResult.path;
          setAvatarURL(profilePicURL);
          setProfilePicStoragePath(newProfilePicStoragePath);
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          showToast(`Failed to upload profile picture: ${error.message}`, "error");
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      // Update profile data - only send the URL, not the storage path
      const response = await fetch(`${API_URL}/api/teachers/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          headline,
          bio: description,
          country,
          website,
          profilePic: profilePicURL
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      showToast("Profile saved successfully", "success");
      setAvatarFile(null); // Clear file after successful save
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(`Failed to save: ${error.message}`, "error");
      setUploadingAvatar(false);
    }
  };

  const changePassword = async () => {
    // Validate inputs
    if (!currentPwd) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (!newPwd || newPwd.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPwd !== newPwd2) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setChangingPassword(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        showToast("You must be logged in to change your password.", "error");
        setChangingPassword(false);
        return;
      }

      // Get MongoDB token
      const token = await getMongoDBToken();
      if (!token) {
        showToast("Failed to authenticate. Please try logging in again.", "error");
        setChangingPassword(false);
        return;
      }

      // Step 1: Re-authenticate with Firebase using current password
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPwd);
        await reauthenticateWithCredential(currentUser, credential);
      } catch (firebaseError) {
        console.error('Firebase re-authentication error:', firebaseError);
        if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
          showToast("Current password is incorrect.", "error");
          setChangingPassword(false);
          return;
        }
        throw firebaseError;
      }

      // Step 2: Update password in Firebase
      try {
        await updatePassword(currentUser, newPwd);
      } catch (firebaseError) {
        console.error('Firebase password update error:', firebaseError);
        if (firebaseError.code === 'auth/requires-recent-login') {
          showToast("For security reasons, please log out and log in again before changing your password.", "error");
        } else {
          showToast(`Failed to update password in Firebase: ${firebaseError.message}`, "error");
        }
        setChangingPassword(false);
        return;
      }

      // Step 3: Update password in MongoDB
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/teachers/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          showToast("Current password is incorrect.", "error");
        } else {
          showToast(`Failed to update password: ${errorData.error || 'Unknown error'}`, "error");
        }
        setChangingPassword(false);
        return;
      }

      // Success
      showToast("Password updated successfully in both Firebase and MongoDB.", "success");
      setHasPassword(true);
      setShowPwdModal(false);
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(`Failed to change password: ${error.message}`, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    // Sign out from Firebase
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
                  <ProfileAvatar
                    src={avatarURL}
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
                      src={avatarURL}
                      name={instructorName}
                      className="ld-profile-dropdown-avatar-img"
                      fallbackClassName="ld-profile-dropdown-avatar"
                    />
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">{email || 'instructor@learnease.com'}</div>
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
                  <ProfileAvatar
                    src={avatarURL}
                    name={fullName || 'IN'}
                    className="pf-avatar-image"
                    fallbackClassName="pf-avatar-placeholder"
                  />
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
                  <label className="pf-form-label">Description</label>
                  <textarea
                    className="pf-form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                <button className="pf-delete-account-btn" onClick={() => setShowCloseAccountModal(true)}>
                  Close account
                </button>
              </div>
            </section>
          )}

          {/* Close Account Confirmation Modal */}
          {showCloseAccountModal && (
            <div className="pf-modal-overlay" onClick={() => setShowCloseAccountModal(false)}>
              <div className="pf-modal-content pf-confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pf-modal-icon-warning">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="pf-modal-title">Close Your Account?</h3>
                <p className="pf-modal-message">
                  Are you sure you want to close your account? This action cannot be undone and you will lose all access to your account and data.
                </p>

                <div className="pf-modal-actions">
                  <button
                    className="pf-secondary-btn"
                    onClick={() => setShowCloseAccountModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="pf-danger-btn"
                    onClick={async () => {
                      setDeletingAccount(true);
                      try {
                        // Get MongoDB token
                        const token = await getMongoDBToken();

                        if (!token) {
                          throw new Error('No authentication token found');
                        }

                        // Call API to delete account from MongoDB and Firebase
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teachers/me`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to delete account');
                        }

                        console.log('✅ Account deleted successfully:', data.message);

                        // Sign out from Firebase on the client side
                        try {
                          await signOut(auth);
                        } catch (error) {
                          console.error('Error signing out:', error);
                        }

                        // Show success message
                        setToast({
                          show: true,
                          message: 'Account deleted successfully',
                          type: 'success'
                        });

                        // Close modal
                        setShowCloseAccountModal(false);

                        // Redirect to login after a short delay
                        setTimeout(() => {
                          navigate("/all-login");
                        }, 1500);

                      } catch (error) {
                        console.error('Error deleting account:', error);
                        setToast({
                          show: true,
                          message: error.message || 'Failed to delete account. Please try again.',
                          type: 'error'
                        });
                        setDeletingAccount(false);
                        setShowCloseAccountModal(false);
                      }
                    }}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? 'Deleting Account...' : 'Close Account'}
                  </button>
                </div>
              </div>
            </div>
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

      {/* Toast Notification */}
      {toast.show && (
        <div className={`pf-toast pf-toast-${toast.type}`}>
          <div className="pf-toast-content">
            {toast.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span className="pf-toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

