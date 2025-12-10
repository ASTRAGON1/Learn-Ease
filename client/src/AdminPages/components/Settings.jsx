import React, { useState } from "react";
import api from "../utils/api";

function Settings() {
  const [tab, setTab] = useState("user"); // 'user' | 'security'
  const [saving, setSaving] = useState(false);

  // local form state (controlled → fixes single-letter focus loss)
  const [form, setForm] = useState({
    // General settings
    language: "English",
    respLimit: 50,
    picLimit: "Default - 4096 Kb (4Mb)",
    dateFormat: "DD/MM/YYYY",
    allowPics: true,
    aiOffOnMaintenance: false,
    allowProfileEdit: true,
    sysUpdate: "Monthly",
    allowSignup: true,
    notifyUsers: true,
    theme: "Light Theme",
    // Account creation
    account: {
      fieldTitle: "",
      fieldDesc: "",
      userName: "",
      userType: "instructor", // 'instructor' | 'student'
      password: "",
      canUpload: true,
    },
    // Security
    twoFA: true,
    encryptData: true,
    emailAfterLogin: true,
    emailNewDevice: true,
    securityQuestion: true,
    lockoutAttempts: "5",
    encryptionMethod: "AES - Advanced Encryption Standard",
    reportFrequency: "Weekly",
    maintenanceTime: "Every Saturday, 12:00 AM CET",
    passwordPolicy: ["Uppercase Letter", "Lowercase Letter", "Number", "Special Character", "Min 8 chars"],
    storeData: "3 Months",
    suspiciousAction: "Temporarily Block and Alert Admin",
    sessionTimeout: "10 min",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const updateAcc = (k, v) =>
    setForm((p) => ({ ...p, account: { ...p.account, [k]: v } }));

  const saveUser = async () => {
    setSaving(true);
    try {
      const res = await api.saveSettings({ type: "user", form });
      if (!res.ok) {
        alert("Failed to save settings");
        return;
      }
      alert("Settings saved successfully");
    } catch (error) {
      console.error("Error saving user settings:", error);
      alert("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const saveSec = async () => {
    setSaving(true);
    try {
      const res = await api.saveSettings({ type: "security", form });
      if (!res.ok) {
        alert("Failed to save settings");
        return;
      }
      alert("Settings saved successfully");
    } catch (error) {
      console.error("Error saving security settings:", error);
      alert("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const createUser = async () => {
    if (!form.account.fieldTitle || !form.account.userName || !form.account.password) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      const res = await api.createUser(form.account);
      if (!res.ok) {
        alert("Failed to create user");
        return;
      }
      alert("User created successfully");
      // Reset form
      updateAcc("fieldTitle", "");
      updateAcc("fieldDesc", "");
      updateAcc("userName", "");
      updateAcc("userType", "instructor");
      updateAcc("password", "");
      updateAcc("canUpload", true);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating user");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", padding: "24px" }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "32px",
        background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 24px rgba(74, 15, 173, 0.2)",
        color: "white"
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "800",
            margin: "0 0 8px 0",
            color: "white",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            Settings
          </h1>
          <p style={{
            fontSize: "16px",
            margin: "0",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "500",
            fontFamily: "'Poppins', sans-serif"
          }}>
            Manage platform settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: "0"
      }}>
        <button
          type="button"
          onClick={() => setTab("user")}
          style={{
            border: "none",
            borderBottom: tab === "user" ? "2px solid #4A0FAD" : "2px solid transparent",
            background: "transparent",
            color: tab === "user" ? "#4A0FAD" : "#6b7280",
            padding: "12px 24px",
            borderRadius: "12px 12px 0 0",
            fontWeight: tab === "user" ? "700" : "600",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "-2px",
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseEnter={(e) => {
            if (tab !== "user") {
              e.target.style.background = "#f9fafb";
              e.target.style.color = "#1a1a1a";
            }
          }}
          onMouseLeave={(e) => {
            if (tab !== "user") {
              e.target.style.background = "transparent";
              e.target.style.color = "#6b7280";
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          User Settings
        </button>
        <button
          type="button"
          onClick={() => setTab("security")}
          style={{
            border: "none",
            borderBottom: tab === "security" ? "2px solid #4A0FAD" : "2px solid transparent",
            background: "transparent",
            color: tab === "security" ? "#4A0FAD" : "#6b7280",
            padding: "12px 24px",
            borderRadius: "12px 12px 0 0",
            fontWeight: tab === "security" ? "700" : "600",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "-2px",
            fontFamily: "'Poppins', sans-serif"
          }}
          onMouseEnter={(e) => {
            if (tab !== "security") {
              e.target.style.background = "#f9fafb";
              e.target.style.color = "#1a1a1a";
            }
          }}
          onMouseLeave={(e) => {
            if (tab !== "security") {
              e.target.style.background = "transparent";
              e.target.style.color = "#6b7280";
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Security Settings
        </button>
      </div>

      {/* USER SETTINGS */}
      {tab === "user" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    General Settings
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Configure basic platform preferences
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              <div style={{ display: "grid", gap: "6px" }}>
                <label style={{ display: "grid", gap: "3px" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Default Language</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "11px", fontFamily: "'Poppins', sans-serif" }}>Set the default language for the platform</small>
                </label>
                <select 
                  value={form.language} 
                  onChange={(e) => update("language", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Turkish</option>
                  <option>Arabic</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Date Format</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Choose how dates are displayed</small>
                </label>
                <select 
                  value={form.dateFormat} 
                  onChange={(e) => update("dateFormat", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Default Theme</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Set the default theme for new users</small>
                </label>
                <select 
                  value={form.theme} 
                  onChange={(e) => update("theme", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>Light Theme</option>
                  <option>Dark Theme</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>System Update Frequency</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>How often the system should check for updates</small>
                </label>
                <select 
                  value={form.sysUpdate} 
                  onChange={(e) => update("sysUpdate", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Response Limit</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Maximum responses for reports and feedback</small>
                </label>
                <select
                  value={String(form.respLimit)}
                  onChange={(e) => update("respLimit", Number(e.target.value))}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} Responses
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Profile Picture Size Limit</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Maximum file size for profile pictures</small>
                </label>
                <select 
                  value={form.picLimit} 
                  onChange={(e) => update("picLimit", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>Default - 4096 Kb (4Mb)</option>
                  <option>2048 Kb (2Mb)</option>
                  <option>1024 Kb (1Mb)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    User Permissions
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Control what users can do on the platform
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {[
                { key: "allowPics", label: "Profile Pictures", desc: "Allow users to upload profile pictures" },
                { key: "allowProfileEdit", label: "Profile Editing", desc: "Allow users to edit their profiles" },
                { key: "allowSignup", label: "User Sign Up", desc: "Allow new users to create accounts" },
                { key: "aiOffOnMaintenance", label: "AI Chat During Maintenance", desc: "Disable AI chat for students during maintenance", invert: true },
                { key: "notifyUsers", label: "User Notifications", desc: "Send notifications to users" }
              ].map(({ key, label, desc, invert }) => (
                <div key={key} style={{ display: "grid", gap: "8px" }}>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>{label}</span>
                    <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>{desc}</small>
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4A0FAD";
                    e.currentTarget.style.background = "#F3EFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => update(key, e.target.checked)}
                      style={{
                        width: "18px",
                        height: "18px",
                        background: form[key] ? "#4A0FAD" : "#ffffff",
                        border: "2px solid",
                        borderColor: form[key] ? "#4A0FAD" : "#e5e7eb",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        appearance: "none",
                        position: "relative"
                      }}
                    />
                    <span style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: form[key] ? "#4A0FAD" : "#6b7280",
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {invert ? (form[key] ? "Disabled" : "Enabled") : (form[key] ? "Enabled" : "Disabled")}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Account Creation
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Create new instructor or student accounts
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Field Title *</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Title for the account field</small>
                </label>
                <input
                  value={form.account.fieldTitle}
                  onChange={(e) => updateAcc("fieldTitle", e.target.value)}
                  placeholder="Email Address"
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>User Type *</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Select whether to create an instructor or student account</small>
                </label>
                <select
                  value={form.account.userType}
                  onChange={(e) => updateAcc("userType", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>User Name *</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Full name of the {form.account.userType}</small>
                </label>
                <input
                  value={form.account.userName}
                  onChange={(e) => updateAcc("userName", e.target.value)}
                  placeholder={`${form.account.userType === "instructor" ? "Instructor" : "Student"} name`}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Field Description</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Additional description for the field</small>
                </label>
                <input
                  value={form.account.fieldDesc}
                  onChange={(e) => updateAcc("fieldDesc", e.target.value)}
                  placeholder="Add a description"
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Password *</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Set a password for the account</small>
                </label>
                <input
                  type="password"
                  value={form.account.password}
                  onChange={(e) => updateAcc("password", e.target.value)}
                  placeholder="Enter password"
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {form.account.userType !== "student" && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Poppins', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4A0FAD";
                  e.currentTarget.style.background = "#F3EFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#ffffff";
                }}
                >
                  <input
                    type="checkbox"
                    checked={form.account.canUpload}
                    onChange={(e) => updateAcc("canUpload", e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      background: form.account.canUpload ? "#4A0FAD" : "#ffffff",
                      border: "2px solid",
                      borderColor: form.account.canUpload ? "#4A0FAD" : "#e5e7eb",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      appearance: "none",
                      position: "relative"
                    }}
                  />
                  <span style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: form.account.canUpload ? "#4A0FAD" : "#6b7280",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Give access to upload content
                  </span>
                </label>
              </div>
            )}

            <div style={{ marginTop: "16px" }}>
              <button 
                onClick={createUser} 
                type="button"
                style={{
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: "0 2px 8px rgba(74, 15, 173, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(74, 15, 173, 0.3)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14m-7-7h14"></path>
                </svg>
                Create User
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            marginTop: "8px",
            position: "sticky",
            bottom: "0",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <button 
              onClick={saveUser} 
              type="button"
              disabled={saving}
              style={{
                background: saving ? "#9ca3af" : "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Poppins', sans-serif",
                boxShadow: saving ? "none" : "0 2px 8px rgba(74, 15, 173, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "150px",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(74, 15, 173, 0.3)";
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* SECURITY SETTINGS */}
      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Authentication & Notifications
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Configure authentication and security notifications
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {[
                { key: "twoFA", label: "Two Factor Authentication (2FA)", desc: "Require Two Factor Authentication for all users" },
                { key: "emailAfterLogin", label: "Login Notification", desc: "Send email notification after login" },
                { key: "emailNewDevice", label: "New Device Notification", desc: "Send email when login from new device" },
                { key: "securityQuestion", label: "Security Question", desc: "Enable Security Question for account recovery" }
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: "grid", gap: "8px" }}>
                  <label style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>{label}</span>
                    <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>{desc}</small>
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4A0FAD";
                    e.currentTarget.style.background = "#F3EFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => update(key, e.target.checked)}
                      style={{
                        width: "18px",
                        height: "18px",
                        background: form[key] ? "#4A0FAD" : "#ffffff",
                        border: "2px solid",
                        borderColor: form[key] ? "#4A0FAD" : "#e5e7eb",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        appearance: "none",
                        position: "relative"
                      }}
                    />
                    <span style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: form[key] ? "#4A0FAD" : "#6b7280",
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {form[key] ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Data Protection & Sessions
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Configure data encryption and session management
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Data Encryption</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Encrypt stored user data</small>
                </label>
                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Poppins', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4A0FAD";
                  e.currentTarget.style.background = "#F3EFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#ffffff";
                }}
                >
                  <input
                    type="checkbox"
                    checked={form.encryptData}
                    onChange={(e) => update("encryptData", e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      background: form.encryptData ? "#4A0FAD" : "#ffffff",
                      border: "2px solid",
                      borderColor: form.encryptData ? "#4A0FAD" : "#e5e7eb",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      appearance: "none",
                      position: "relative"
                    }}
                  />
                  <span style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: form.encryptData ? "#4A0FAD" : "#6b7280",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    {form.encryptData ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Encryption Method</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Choose the encryption algorithm</small>
                </label>
                <select
                  value={form.encryptionMethod}
                  onChange={(e) => update("encryptionMethod", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>AES - Advanced Encryption Standard</option>
                  <option>RSA - Rivest–Shamir–Adleman</option>
                  <option>ChaCha20-Poly1305</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Login Attempts Before Lockout</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Number of failed attempts before account lockout</small>
                </label>
                <select
                  value={form.lockoutAttempts}
                  onChange={(e) => update("lockoutAttempts", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {["3", "5", "7", "10"].map((n) => (
                    <option key={n} value={n}>
                      {n} attempts
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Session Timeout</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Automatic logout after inactivity</small>
                </label>
                <select
                  value={form.sessionTimeout}
                  onChange={(e) => update("sessionTimeout", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>5 min</option>
                  <option>10 min</option>
                  <option>30 min</option>
                  <option>60 min</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Data Retention Period</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>How long to store user data</small>
                </label>
                <select 
                  value={form.storeData} 
                  onChange={(e) => update("storeData", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>12 Months</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Report Frequency</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>How often to generate student reports</small>
                </label>
                <select
                  value={form.reportFrequency}
                  onChange={(e) => update("reportFrequency", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Scheduled Maintenance</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>When to perform system maintenance</small>
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={form.maintenanceTime}
                    onChange={(e) => update("maintenanceTime", e.target.value)}
                    placeholder="Every Saturday, 12:00 AM CET"
                    style={{
                      flex: 1,
                      background: "#ffffff",
                      color: "#1a1a1a",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      boxShadow: "none",
                      outline: "none",
                      transition: "all 0.2s ease",
                      fontFamily: "'Poppins', sans-serif"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4A0FAD";
                      e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button 
                    type="button" 
                    title="Pick date/time"
                    style={{
                      background: "transparent",
                      color: "#4A0FAD",
                      border: "1px solid #4A0FAD",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "'Poppins', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#4A0FAD";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#4A0FAD";
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Suspicious Activity Action</span>
                  <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>What to do when suspicious activity is detected</small>
                </label>
                <select
                  value={form.suspiciousAction}
                  onChange={(e) => update("suspiciousAction", e.target.value)}
                  style={{
                    background: "#ffffff",
                    color: "#1a1a1a",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4A0FAD";
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 15, 173, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option>Temporarily Block and Alert Admin</option>
                  <option>Require 2FA and Alert Admin</option>
                  <option>Alert Admin Only</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(74, 15, 173, 0.3)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "0 0 4px 0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Password Policy
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "0",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    Configure password requirements
                  </p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              <label style={{ display: "grid", gap: "4px" }}>
                <span style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a", fontFamily: "'Poppins', sans-serif" }}>Current Password Requirements</span>
                <small style={{ lineHeight: "1.4", color: "#6b7280", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>These requirements are enforced for all new passwords</small>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {form.passwordPolicy.map((p) => (
                  <span 
                    key={p}
                    style={{
                      background: "#F3EFFF",
                      border: "1px solid #6B2FD4",
                      padding: "8px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      fontFamily: "'Poppins', sans-serif",
                      color: "#4A0FAD"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#4A0FAD";
                      e.target.style.color = "white";
                      e.target.style.borderColor = "#4A0FAD";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#F3EFFF";
                      e.target.style.color = "#4A0FAD";
                      e.target.style.borderColor = "#6B2FD4";
                    }}
                  >
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "20px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            marginTop: "8px",
            position: "sticky",
            bottom: "0",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <button 
              onClick={saveSec} 
              type="button"
              disabled={saving}
              style={{
                background: saving ? "#9ca3af" : "linear-gradient(135deg, #4A0FAD 0%, #6B2FD4 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Poppins', sans-serif",
                boxShadow: saving ? "none" : "0 2px 8px rgba(74, 15, 173, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "150px",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(74, 15, 173, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(74, 15, 173, 0.3)";
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
