import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, Calendar, GraduationCap, Award, 
  Settings, Lock, Bell, Eye, EyeOff, Download, 
  Edit2, Save, X, Camera, TrendingUp, BookOpen,
  Clock, Star, Target, CheckCircle
} from "lucide-react";
import "./StudentProfile.css";

// Demo data - replace with API calls
const initialProfile = {
  id: "st-001",
  name: "Layla Benali",
  email: "layla.benali@example.com",
  phone: "+213 555 123 456",
  age: 10,
  pronouns: "she/her",
  gradeLevel: "Grade 4",
  dateOfBirth: "2014-05-15",
  diagnosis: ["Down Syndrome"],
  avatar: "https://i.pravatar.cc/160?img=47",
  guardian: { 
    name: "Samira Benali", 
    phone: "+213 555 123 456", 
    email: "samira@example.com" 
  },
  emergency: { 
    name: "Youssef Benali", 
    phone: "+213 555 987 654",
    relation: "Father"
  },
  joinedDate: "2023-09-01",
  stars: 124,
  attendancePercent: 92,
  coursesCompleted: 5,
  coursesInProgress: 3,
  totalHours: 45,
  currentStreak: 7,
  longestStreak: 15,
};

const recentAchievements = [
  { id: "a1", title: "Course Completed", desc: "Finished Listening Skills", date: "2024-12-15", icon: "🏆" },
  { id: "a2", title: "7 Day Streak", desc: "Keep it up!", date: "2024-12-14", icon: "🔥" },
  { id: "a3", title: "Quiz Master", desc: "Scored 90%+ on 5 quizzes", date: "2024-12-10", icon: "⭐" },
];

const recentActivity = [
  { id: "act1", action: "Completed lesson", course: "Communication Skills", time: "2 hours ago" },
  { id: "act2", action: "Took quiz", course: "Social Skills", score: "92%", time: "1 day ago" },
  { id: "act3", action: "Earned achievement", achievement: "Course Completed", time: "2 days ago" },
];

export default function StudentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(initialProfile);
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
    if (passwordData.new.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
    }
    // API call would go here
    // await fetch("/api/student/password", { method: "PUT", body: JSON.stringify(passwordData) });
    setPasswordData({ current: "", new: "", confirm: "" });
    alert("Password changed successfully!");
  };

  const handleUploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadData = () => {
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile-data-${profile.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-layout">
      <div className="profile-content">
        {/* Breadcrumb Navigation */}
        <nav className="profile-breadcrumb">
          <Link to="/student-dashboard-2" className="breadcrumb-link">Dashboard</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Profile</span>
        </nav>

        {/* Header */}
        <header className="profile-header">
          <div className="profile-header-left">
            <button className="profile-back-btn" onClick={() => navigate("/student-dashboard-2")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </button>
            <div>
              <h1 className="profile-title">My Profile</h1>
              <p className="profile-subtitle">Manage your account settings and preferences</p>
            </div>
          </div>
          {!isEditing && (
            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
        </header>

        {/* Profile Card */}
        <div className="profile-card-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
              <label className="profile-avatar-upload">
                <input type="file" accept="image/*" onChange={handleUploadAvatar} />
                <Camera size={20} />
              </label>
            </div>
            <div className="profile-info-header">
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
              <div className="profile-badges">
                {profile.diagnosis.map((d, idx) => (
                  <span key={idx} className="profile-badge">{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="profile-quick-stats">
            <div className="quick-stat">
              <Star className="quick-stat-icon" />
              <div>
                <div className="quick-stat-value">{profile.stars}</div>
                <div className="quick-stat-label">Stars</div>
              </div>
            </div>
            <div className="quick-stat">
              <Target className="quick-stat-icon" />
              <div>
                <div className="quick-stat-value">{profile.attendancePercent}%</div>
                <div className="quick-stat-label">Attendance</div>
              </div>
            </div>
            <div className="quick-stat">
              <BookOpen className="quick-stat-icon" />
              <div>
                <div className="quick-stat-value">{profile.coursesCompleted}</div>
                <div className="quick-stat-label">Courses</div>
              </div>
            </div>
            <div className="quick-stat">
              <TrendingUp className="quick-stat-icon" />
              <div>
                <div className="quick-stat-value">{profile.currentStreak}</div>
                <div className="quick-stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </button>
          <button 
            className={`profile-tab ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button 
            className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button 
            className={`profile-tab ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="profile-overview">
              <div className="profile-stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <GraduationCap className="stat-card-icon" />
                    <h3>Academic Progress</h3>
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-item">
                      <span className="stat-label">Courses Completed</span>
                      <span className="stat-value">{profile.coursesCompleted}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">In Progress</span>
                      <span className="stat-value">{profile.coursesInProgress}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Hours</span>
                      <span className="stat-value">{profile.totalHours}h</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <Award className="stat-card-icon" />
                    <h3>Recent Achievements</h3>
                  </div>
                  <div className="achievements-list">
                    {recentAchievements.map((ach) => (
                      <div key={ach.id} className="achievement-item">
                        <span className="achievement-icon">{ach.icon}</span>
                        <div className="achievement-content">
                          <div className="achievement-title">{ach.title}</div>
                          <div className="achievement-desc">{ach.desc}</div>
                        </div>
                        <div className="achievement-date">{ach.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <Clock className="stat-card-icon" />
                    <h3>Recent Activity</h3>
                  </div>
                  <div className="activity-list">
                    {recentActivity.map((act) => (
                      <div key={act.id} className="activity-item">
                        <div className="activity-content">
                          <div className="activity-action">{act.action}</div>
                          <div className="activity-details">
                            {act.course && <span>{act.course}</span>}
                            {act.achievement && <span>{act.achievement}</span>}
                            {act.score && <span className="activity-score">Score: {act.score}</span>}
                          </div>
                        </div>
                        <div className="activity-time">{act.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <User className="stat-card-icon" />
                    <h3>Contact Information</h3>
                  </div>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Mail size={18} />
                      <span>{profile.guardian.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={18} />
                      <span>{profile.guardian.phone}</span>
                    </div>
                    <div className="contact-item">
                      <User size={18} />
                      <span>Guardian: {profile.guardian.name}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={18} />
                      <span>Emergency: {profile.emergency.name} ({profile.emergency.phone})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="profile-form-section">
              <div className="profile-form-card">
                <h3>Personal Information</h3>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pronouns</label>
                      <input
                        type="text"
                        value={profile.pronouns}
                        onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label>Grade Level</label>
                      <input
                        type="text"
                        value={profile.gradeLevel}
                        onChange={(e) => setProfile({ ...profile, gradeLevel: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <div className="form-actions">
                      <button className="btn-secondary" onClick={() => { setIsEditing(false); setProfile(initialProfile); }}>
                        <X size={18} />
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleSaveProfile}>
                        <Save size={18} />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-form-card">
                <h3>Guardian Information</h3>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      value={profile.guardian.name}
                      onChange={(e) => setProfile({ ...profile, guardian: { ...profile.guardian, name: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Guardian Email</label>
                      <input
                        type="email"
                        value={profile.guardian.email}
                        onChange={(e) => setProfile({ ...profile, guardian: { ...profile.guardian, email: e.target.value } })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
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

              <div className="profile-form-card">
                <h3>Emergency Contact</h3>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profile.emergency.name}
                      onChange={(e) => setProfile({ ...profile, emergency: { ...profile.emergency, name: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Emergency Phone</label>
                      <input
                        type="tel"
                        value={profile.emergency.phone}
                        onChange={(e) => setProfile({ ...profile, emergency: { ...profile.emergency, phone: e.target.value } })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        value={profile.emergency.relation}
                        onChange={(e) => setProfile({ ...profile, emergency: { ...profile.emergency, relation: e.target.value } })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="profile-form-section">
              <div className="profile-form-card">
                <h3>Account Information</h3>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Account ID</label>
                    <input type="text" value={profile.id} disabled />
                  </div>
                  <div className="form-group">
                    <label>Member Since</label>
                    <input type="text" value={new Date(profile.joinedDate).toLocaleDateString()} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={profile.email} disabled />
                    <small>Contact support to change your email address</small>
                  </div>
                </div>
              </div>

              <div className="profile-form-card">
                <div className="card-header-with-action">
                  <h3>Download Your Data</h3>
                  <button className="btn-secondary" onClick={handleDownloadData}>
                    <Download size={18} />
                    Download Data
                  </button>
                </div>
                <p className="card-description">
                  Download a copy of your profile data, achievements, and progress in JSON format.
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="profile-form-section">
              <div className="profile-form-card">
                <h3>Change Password</h3>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        placeholder="Enter new password (min. 8 characters)"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handleChangePassword}>
                    <Lock size={18} />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="profile-form-section">
              <div className="profile-form-card">
                <h3>Notification Preferences</h3>
                <div className="preferences-list">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="preference-item">
                      <div>
                        <div className="preference-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="preference-desc">
                          {key === "email" && "Receive email notifications"}
                          {key === "achievements" && "Get notified when you earn achievements"}
                          {key === "courses" && "Updates about your courses"}
                          {key === "reminders" && "Daily learning reminders"}
                          {key === "weeklyReport" && "Weekly progress report"}
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-form-card">
                <h3>Privacy Settings</h3>
                <div className="preferences-list">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="preference-item">
                      <div>
                        <div className="preference-label">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="preference-desc">
                          {key === "profileVisible" && "Allow others to view your profile"}
                          {key === "achievementsVisible" && "Show your achievements publicly"}
                          {key === "progressVisible" && "Share your learning progress"}
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
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
