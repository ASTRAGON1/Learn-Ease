import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, Calendar, GraduationCap, Award, 
  Settings, Lock, Bell, Eye, EyeOff, Download, 
  Edit2, Save, X, Camera, TrendingUp, BookOpen,
  Clock, Star, Target, CheckCircle, ArrowLeft, Shield, Bell as BellIcon
} from "lucide-react";
import "./StudentProfile.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
              setProfile(prev => ({
                ...prev,
                name: student.name || student.fullName,
                email: student.email || prev.email,
                avatar: student.avatar || prev.avatar
              }));
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
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="sp-avatar-image-new" />
                  ) : (
                    <div className="sp-avatar-placeholder-new">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
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
                  {profile.diagnosis.map((d, idx) => (
                    <span key={idx} className="sp-badge-new">
                      <CheckCircle size={14} />
                      {d}
                    </span>
                  ))}
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
              <div className="sp-stat-icon-wrapper target">
                <Target size={24} />
              </div>
              <div className="sp-stat-content">
                <div className="sp-stat-value">{profile.attendancePercent}%</div>
                <div className="sp-stat-label">Attendance</div>
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
                    <span className="sp-info-value">{profile.coursesInProgress}</span>
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
                    {recentAchievements.map((ach) => (
                      <div key={ach.id} className="sp-achievement-item">
                        <div className="sp-achievement-icon">{ach.icon}</div>
                        <div className="sp-achievement-details">
                          <div className="sp-achievement-title">{ach.title}</div>
                          <div className="sp-achievement-desc">{ach.desc}</div>
                        </div>
                        <div className="sp-achievement-date">{ach.date}</div>
                      </div>
                    ))}
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
                    {recentActivity.map((act) => (
                      <div key={act.id} className="sp-activity-item">
                        <div className="sp-activity-dot"></div>
                        <div className="sp-activity-content">
                          <div className="sp-activity-action">{act.action}</div>
                          <div className="sp-activity-meta">
                            {act.course && <span>{act.course}</span>}
                            {act.achievement && <span>{act.achievement}</span>}
                            {act.score && <span className="sp-score">{act.score}</span>}
                          </div>
                        </div>
                        <div className="sp-activity-time">{act.time}</div>
                      </div>
                    ))}
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
                      <span>{profile.guardian.email}</span>
                    </div>
                    <div className="sp-contact-item">
                      <Phone size={18} />
                      <span>{profile.guardian.phone}</span>
                    </div>
                    <div className="sp-contact-item">
                      <User size={18} />
                      <span>Guardian: {profile.guardian.name}</span>
                    </div>
                    <div className="sp-contact-item">
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
                  <div className="sp-form-group">
                    <label>Pronouns</label>
                    <input
                      type="text"
                      value={profile.pronouns}
                      onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Grade Level</label>
                    <input
                      type="text"
                      value={profile.gradeLevel}
                      onChange={(e) => setProfile({ ...profile, gradeLevel: e.target.value })}
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

              <div className="sp-form-card">
                <h3 className="sp-form-title">Emergency Contact</h3>
                <div className="sp-form-grid">
                  <div className="sp-form-group">
                    <label>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profile.emergency.name}
                      onChange={(e) => setProfile({ ...profile, emergency: { ...profile.emergency, name: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
                    <label>Emergency Phone</label>
                    <input
                      type="tel"
                      value={profile.emergency.phone}
                      onChange={(e) => setProfile({ ...profile, emergency: { ...profile.emergency, phone: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sp-form-group">
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

              <div className="sp-form-card">
                <div className="sp-card-header-with-action">
                  <div>
                    <h3 className="sp-form-title">Download Your Data</h3>
                    <p className="sp-card-description">
                      Download a copy of your profile data, achievements, and progress in JSON format.
                    </p>
                  </div>
                  <button className="sp-btn-secondary" onClick={handleDownloadData}>
                    <Download size={18} />
                    Download
                  </button>
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
                        placeholder="Enter new password (min. 8 characters)"
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
