import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDiagnosticQuizCheck } from "../hooks/useDiagnosticQuizCheck";
import {
  User, Mail, Phone, Calendar, GraduationCap, Award,
  Settings, Lock, Bell, Eye, EyeOff,
  Edit2, Save, X, Camera, TrendingUp, BookOpen,
  Clock, Star, Target, CheckCircle, ArrowLeft, Shield, Bell as BellIcon
} from "lucide-react";
import "./StudentProfile.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialProfileState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  profilePic: "",
  joinedDate: null,
  stars: 0,
  coursesCompleted: 0,
  coursesInProgress: 0,
  totalHours: 0,
  currentStreak: 0,
  longestStreak: 0,
  diagnosis: [],
  age: 0,
  pronouns: "",
  gradeLevel: "",
  dateOfBirth: "",
  location: "",
  preferences: "",
  guardian: {
    name: "",
    email: "",
    phone: "",
    relationship: ""
  },
  emergency: {
    name: "",
    phone: "",
    relation: ""
  }
};


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

export default function StudentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(initialProfileState);
  const [initialProfile, setInitialProfile] = useState(initialProfileState);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Check if diagnostic quiz is completed
  useDiagnosticQuizCheck();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    achievements: true,
    courses: true,
    reminders: false,
    weeklyReport: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    achievementsVisible: true,
    progressVisible: false,
  });





  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      const storage = window.sessionStorage;
      const token = storage.getItem("token");

      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/students/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const student = data.data || data;

            if (student.name || student.fullName) {
              const updatedProfile = {
                ...initialProfileState,
                id: student._id || student.id || "",
                name: student.name || student.fullName || "",
                email: student.email || "",
                profilePic: student.profilePic || "",
                joinedDate: student.createdAt || null
              };
              setProfile(updatedProfile);
              setInitialProfile(updatedProfile);
            }

            // Fetch achievements and progress
            try {
              const progressResponse = await fetch(`${API_URL}/api/students/progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                if (progressData.success && progressData.data) {
                  const p = progressData.data;

                  // Determine active course name
                  let activeCourseName = "None";
                  if (p.courseProgress && p.courseProgress.length > 0) {
                    // Find first in_progress or the last started one
                    const active = p.courseProgress.find(c => c.status === 'in_progress');
                    if (active && active.course && active.course.title) {
                      activeCourseName = active.course.title;
                    } else if (p.coursesInProgress > 0) {
                      // Fallback logic if status not explicitly 'in_progress' but count > 0
                      // Just grab the latest accessed one
                      const latest = p.courseProgress.sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))[0];
                      if (latest && latest.course) activeCourseName = latest.course.title;
                    }
                  }

                  setProfile(prev => ({
                    ...prev,
                    coursesCompleted: p.coursesCompleted || 0,
                    coursesInProgress: activeCourseName === "None" ? 0 : activeCourseName,
                    coursesInProgressCount: p.coursesInProgress || 0,
                    currentStreak: p.currentStreak || 0,
                    stars: p.achievements ? p.achievements.length * 10 : 0,
                    totalHours: p.hoursStudied ? Math.round(p.hoursStudied * 10) / 10 : 0
                  }));

                  if (p.recentAchievementsDisplay) {
                    setRecentAchievements(p.recentAchievementsDisplay);
                  }

                  if (p.recentActivity) {
                    setRecentActivity(p.recentActivity);
                  }

                  // Map achievements for display
                  if (p.achievements && p.achievements.length > 0) {
                    // We need to map the backend achievement structure to frontend display
                    // Backend: { achievement: ID, completedAt: Date }
                    // We might need to fetch details if not populated, but for now let's assume simple count or Basic info
                    // Actually progress endpoint returns 'achievements' array on student object usually has populated fields if we used populate?
                    // Let's check studentAuthRoutes.js - looks like it returns student.achievements which has ID.
                    // The student object from /auth/me might have them populated or we might need to rely on the count.
                    // For 'Recent Achievements', let's just use the count for now to avoid complex mapping without full data.
                  }
                }
              }
            } catch (err) {
              console.error('Error fetching progress:', err);
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      } else {
        // Fallback to sessionStorage
        const storedName = storage.getItem("userName");
        const storedEmail = storage.getItem("userEmail");
        if (storedName || storedEmail) {
          setProfile(prev => ({
            ...prev,
            name: storedName || prev.name,
            email: storedEmail || prev.email
          }));
        }
      }
    };

    fetchStudentData();
  }, []);

  const handleSaveProfile = async () => {
    // API call would go here
    // await fetch("/api/student/profile", { method: "PUT", body: JSON.stringify(profile) });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.new.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    if (!passwordData.current) {
      alert("Please enter your current password!");
      return;
    }

    try {
      const token = window.sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/students/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordData({ current: "", new: "", confirm: "" });
        alert(data.message || "Password changed successfully!");
      } else {
        alert(data.error || "Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      // Show loading state (preview the image immediately)
      const loadingReader = new FileReader();
      loadingReader.onloadend = () => {
        setProfile((p) => ({ ...p, profilePic: loadingReader.result }));
      };
      loadingReader.readAsDataURL(file);

      // Convert to base64 and upload to MongoDB
      // This works for all users regardless of Firebase authentication
      console.log('📤 Converting image to base64 for upload...');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Update MongoDB via API with base64 image
        const token = window.sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/students/profile-picture`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profilePic: base64Image })
        });

        if (response.ok) {
          console.log('✅ Profile picture updated successfully');
          setProfile((p) => ({ ...p, profilePic: base64Image }));
          setInitialProfile((p) => ({ ...p, profilePic: base64Image }));
          alert('Profile picture updated successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to update profile picture:', errorData);
          alert('Failed to update profile picture. Please try again.');
          // Revert to original picture
          setProfile((p) => ({ ...p, profilePic: initialProfile.profilePic }));
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file. Please try again.');
        setProfile((p) => ({ ...p, profilePic: initialProfile.profilePic }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert(`Error uploading profile picture: ${error.message}`);
      // Revert to original picture
      setProfile((p) => ({ ...p, profilePic: initialProfile.profilePic }));
    }
  };

  return (
    <div className="sp-profile-layout">
      <div className="sp-profile-container">
        {/* Header Section */}
        <div className="sp-profile-header-section">
          <button className="sp-back-btn" onClick={() => navigate("/student-dashboard-2")}>
            <span className="sp-back-chev">‹</span> Dashboard
          </button>
          <div className="sp-header-content">
            <h1 className="sp-main-title">My Profile</h1>
            <p className="sp-subtitle">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Profile Hero Card - New Design */}
        <div className="sp-hero-card-new">
          <div className="sp-hero-main-content">
            <div className="sp-hero-left">
              <div className="sp-avatar-container-new">
                <div className="sp-avatar-wrapper-new">
                  <ProfileAvatar
                    src={profile.profilePic}
                    name={profile.name}
                    className="sp-avatar-image-new"
                    fallbackClassName="sp-avatar-placeholder-new"
                  />
                  <label className="sp-avatar-upload-btn-new">
                    <input type="file" accept="image/*" onChange={handleUploadAvatar} />
                    <Camera size={16} />
                  </label>
                </div>
              </div>
              <div className="sp-hero-info-new">
                <h2 className="sp-hero-name-new">{profile.name}</h2>
                <p className="sp-hero-email-new">{profile.email}</p>
                <div className="sp-badges-container-new">
                  {profile.diagnosis && profile.diagnosis.length > 0 ? (
                    profile.diagnosis.map((d, idx) => (
                      <span key={idx} className="sp-badge-new">
                        <CheckCircle size={14} />
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="sp-badge-new">
                      <CheckCircle size={14} />
                      Student
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isEditing && (
              <button className="sp-edit-profile-btn-new" onClick={() => setIsEditing(true)}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="sp-stats-grid-new">
            <div className="sp-stat-card">
              <div className="sp-stat-icon-wrapper star">
                <Star size={24} />
              </div>
              <div className="sp-stat-content">
                <div className="sp-stat-value">{profile.stars}</div>
                <div className="sp-stat-label">Stars Earned</div>
              </div>
            </div>

            <div className="sp-stat-card">
              <div className="sp-stat-icon-wrapper book">
                <BookOpen size={24} />
              </div>
              <div className="sp-stat-content">
                <div className="sp-stat-value">{profile.coursesCompleted}</div>
                <div className="sp-stat-label">Courses Completed</div>
              </div>
            </div>
            <div className="sp-stat-card">
              <div className="sp-stat-icon-wrapper fire">
                <TrendingUp size={24} />
              </div>
              <div className="sp-stat-content">
                <div className="sp-stat-value">{profile.currentStreak}</div>
                <div className="sp-stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="sp-tabs-container">
          <button
            className={`sp-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <User size={18} />
            <span>Overview</span>
          </button>
          <button
            className={`sp-tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <User size={18} />
            <span>Personal Info</span>
          </button>
          <button
            className={`sp-tab ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <Settings size={18} />
            <span>Account</span>
          </button>
          <button
            className={`sp-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} />
            <span>Security</span>
          </button>
          <button
            className={`sp-tab ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <BellIcon size={18} />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="sp-content-area">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="sp-overview-grid">
              <div className="sp-content-card">
                <div className="sp-card-header">
                  <GraduationCap className="sp-card-icon" />
                  <h3>Academic Progress</h3>
                </div>
                <div className="sp-card-body">
                  <div className="sp-info-row">
                    <span className="sp-info-label">Courses Completed</span>
                    <span className="sp-info-value">{profile.coursesCompleted}</span>
                  </div>
                  <div className="sp-info-row">
                    <span className="sp-info-label">In Progress</span>
                    <span className="sp-info-value" style={isNaN(profile.coursesInProgress) ? { fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' } : {}}>
                      {profile.coursesInProgress}
                    </span>
                  </div>
                  <div className="sp-info-row">
                    <span className="sp-info-label">Total Hours</span>
                    <span className="sp-info-value">{profile.totalHours}h</span>
                  </div>
                </div>
              </div>

              <div className="sp-content-card">
                <div className="sp-card-header">
                  <Award className="sp-card-icon" />
                  <h3>Recent Achievements</h3>
                </div>
                <div className="sp-card-body">
                  <div className="sp-achievements-list">
                    {recentAchievements.length > 0 ? (
                      recentAchievements.map((ach) => (
                        <div key={ach.id} className="sp-achievement-item">
                          <div className="sp-achievement-icon">{ach.icon || "🏆"}</div>
                          <div className="sp-achievement-details">
                            <div className="sp-achievement-title">{ach.title}</div>
                            <div className="sp-achievement-desc">{ach.desc}</div>
                          </div>
                          <div className="sp-achievement-date">{ach.date}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>No achievements yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sp-content-card">
                <div className="sp-card-header">
                  <Clock className="sp-card-icon" />
                  <h3>Recent Activity</h3>
                </div>
                <div className="sp-card-body">
                  <div className="sp-activity-list">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((act) => (
                        <div key={act.id} className="sp-activity-item">
                          <div className="sp-activity-dot"></div>
                          <div className="sp-activity-content">
                            <div className="sp-activity-action">{act.action}</div>
                            <div className="sp-activity-meta">
                              {act.course && <span>{act.course}</span>}
                              {act.score && <span className="sp-score">{act.score}</span>}
                            </div>
                          </div>
                          <div className="sp-activity-time">{act.time}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', color: '#666', textAlign: 'center' }}>No recent activity</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sp-content-card">
                <div className="sp-card-header">
                  <Mail className="sp-card-icon" />
                  <h3>Contact Information</h3>
                </div>
                <div className="sp-card-body">
                  <div className="sp-contact-list">
                    <div className="sp-contact-item">
                      <Mail size={18} />
                      <span>{profile.guardian?.email || "Not provided"}</span>
                    </div>
                    <div className="sp-contact-item">
                      <Phone size={18} />
                      <span>{profile.guardian?.phone || "Not provided"}</span>
                    </div>
                    <div className="sp-contact-item">
                      <User size={18} />
                      <span>Guardian: {profile.guardian?.name || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="sp-forms-container">
              <div className="sp-form-card">
                <h3 className="sp-form-title">Personal Information</h3>
                <div className="sp-form-grid">
                  <div className="sp-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group full-width">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="sp-form-actions">
                    <button className="sp-btn-secondary" onClick={() => { setIsEditing(false); setProfile(initialProfile); }}>
                      <X size={18} />
                      Cancel
                    </button>
                    <button className="sp-btn-primary" onClick={handleSaveProfile}>
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="sp-form-card">
                <h3 className="sp-form-title">Guardian Information</h3>
                <div className="sp-form-grid">
                  <div className="sp-form-group full-width">
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      value={profile.guardian.name}
                      onChange={(e) => setProfile({ ...profile, guardian: { ...profile.guardian, name: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Guardian Email</label>
                    <input
                      type="email"
                      value={profile.guardian.email}
                      onChange={(e) => setProfile({ ...profile, guardian: { ...profile.guardian, email: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Guardian Phone</label>
                    <input
                      type="tel"
                      value={profile.guardian.phone}
                      onChange={(e) => setProfile({ ...profile, guardian: { ...profile.guardian, phone: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="sp-forms-container">
              <div className="sp-form-card">
                <h3 className="sp-form-title">Account Information</h3>
                <div className="sp-form-grid">
                  <div className="sp-form-group">
                    <label>Account ID</label>
                    <input type="text" value={profile.id} disabled />
                  </div>
                  <div className="sp-form-group">
                    <label>Member Since</label>
                    <input type="text" value={new Date(profile.joinedDate).toLocaleDateString()} disabled />
                  </div>
                  <div className="sp-form-group full-width">
                    <label>Email Address</label>
                    <input type="email" value={profile.email} disabled />
                    <small>Contact support to change your email address</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="sp-forms-container">
              <div className="sp-form-card">
                <h3 className="sp-form-title">Change Password</h3>
                <div className="sp-form-grid">
                  <div className="sp-form-group full-width">
                    <label>Current Password</label>
                    <div className="sp-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="sp-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="sp-form-group full-width">
                    <label>New Password</label>
                    <div className="sp-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        placeholder="Enter new password (min. 6 characters)"
                      />
                    </div>
                  </div>
                  <div className="sp-form-group full-width">
                    <label>Confirm New Password</label>
                    <div className="sp-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
                <button className="sp-btn-primary" onClick={handleChangePassword}>
                  <Lock size={18} />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="sp-forms-container">
              <div className="sp-form-card">
                <h3 className="sp-form-title">Notification Preferences</h3>
                <div className="sp-preferences-list">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="sp-preference-item">
                      <div className="sp-preference-info">
                        <div className="sp-preference-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="sp-preference-desc">
                          {key === "email" && "Receive email notifications"}
                          {key === "achievements" && "Get notified when you earn achievements"}
                          {key === "courses" && "Updates about your courses"}
                          {key === "reminders" && "Daily learning reminders"}
                          {key === "weeklyReport" && "Weekly progress report"}
                        </div>
                      </div>
                      <label className="sp-toggle">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                        />
                        <span className="sp-toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sp-form-card">
                <h3 className="sp-form-title">Privacy Settings</h3>
                <div className="sp-preferences-list">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="sp-preference-item">
                      <div className="sp-preference-info">
                        <div className="sp-preference-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="sp-preference-desc">
                          {key === "profileVisible" && "Allow others to view your profile"}
                          {key === "achievementsVisible" && "Show your achievements publicly"}
                          {key === "progressVisible" && "Share your learning progress"}
                        </div>
                      </div>
                      <label className="sp-toggle">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                        />
                        <span className="sp-toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
