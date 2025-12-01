import React, { useState } from "react";
import api from "../utils/api";

function Settings({ search }) {
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
      instructorName: "",
      category: "Autism",
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
    if (!form.account.fieldTitle || !form.account.instructorName) {
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
      updateAcc("instructorName", "");
      updateAcc("category", "Autism");
      updateAcc("canUpload", true);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating user");
    }
  };

  return (
    <div className="le-content">
      <div className="section-title">
        <div>
          <h2>Settings</h2>
          <div className="sub">Manage platform settings and preferences</div>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === "user" ? "is-active" : ""}
          onClick={() => setTab("user")}
        >
          <span>👤</span> User Settings
        </button>
        <button
          type="button"
          className={tab === "security" ? "is-active" : ""}
          onClick={() => setTab("security")}
        >
          <span>🔒</span> Security Settings
        </button>
      </div>

      {/* USER SETTINGS */}
      {tab === "user" && (
        <div className="settings-container">
          <details className="settings-acc" open>
            <summary className="settings-summary">
              <span>⚙️ General Settings</span>
              <small>Configure basic platform preferences</small>
            </summary>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">
                  <span>Default Language</span>
                  <small>Set the default language for the platform</small>
                </label>
                <select value={form.language} onChange={(e) => update("language", e.target.value)}>
                  <option>English</option>
                  <option>French</option>
                  <option>Turkish</option>
                  <option>Arabic</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Date Format</span>
                  <small>Choose how dates are displayed</small>
                </label>
                <select value={form.dateFormat} onChange={(e) => update("dateFormat", e.target.value)}>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Default Theme</span>
                  <small>Set the default theme for new users</small>
                </label>
                <select value={form.theme} onChange={(e) => update("theme", e.target.value)}>
                  <option>Light Theme</option>
                  <option>Dark Theme</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>System Update Frequency</span>
                  <small>How often the system should check for updates</small>
                </label>
                <select value={form.sysUpdate} onChange={(e) => update("sysUpdate", e.target.value)}>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Response Limit</span>
                  <small>Maximum responses for reports and feedback</small>
                </label>
                <select
                  value={String(form.respLimit)}
                  onChange={(e) => update("respLimit", Number(e.target.value))}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} Responses
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Profile Picture Size Limit</span>
                  <small>Maximum file size for profile pictures</small>
                </label>
                <select value={form.picLimit} onChange={(e) => update("picLimit", e.target.value)}>
                  <option>Default - 4096 Kb (4Mb)</option>
                  <option>2048 Kb (2Mb)</option>
                  <option>1024 Kb (1Mb)</option>
                </select>
              </div>
            </div>
          </details>

          <details className="settings-acc" open>
            <summary className="settings-summary">
              <span>👥 User Permissions</span>
              <small>Control what users can do on the platform</small>
            </summary>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">
                  <span>Profile Pictures</span>
                  <small>Allow users to upload profile pictures</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.allowPics}
                    onChange={(e) => update("allowPics", e.target.checked)}
                  />
                  <span>{form.allowPics ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Profile Editing</span>
                  <small>Allow users to edit their profiles</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.allowProfileEdit}
                    onChange={(e) => update("allowProfileEdit", e.target.checked)}
                  />
                  <span>{form.allowProfileEdit ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>User Sign Up</span>
                  <small>Allow new users to create accounts</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.allowSignup}
                    onChange={(e) => update("allowSignup", e.target.checked)}
                  />
                  <span>{form.allowSignup ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>AI Chat During Maintenance</span>
                  <small>Disable AI chat for students during maintenance</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.aiOffOnMaintenance}
                    onChange={(e) => update("aiOffOnMaintenance", e.target.checked)}
                  />
                  <span>{form.aiOffOnMaintenance ? "Disabled" : "Enabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>User Notifications</span>
                  <small>Send notifications to users</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.notifyUsers}
                    onChange={(e) => update("notifyUsers", e.target.checked)}
                  />
                  <span>{form.notifyUsers ? "Enabled" : "Disabled"}</span>
                </label>
              </div>
            </div>
          </details>

          <details className="settings-acc">
            <summary className="settings-summary">
              <span>➕ Account Creation</span>
              <small>Create new instructor accounts</small>
            </summary>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">
                  <span>Field Title *</span>
                  <small>Title for the account field</small>
                </label>
                <input
                  className="input"
                  value={form.account.fieldTitle}
                  onChange={(e) => updateAcc("fieldTitle", e.target.value)}
                  placeholder="Email Address"
                />
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Instructor Name *</span>
                  <small>Full name of the instructor</small>
                </label>
                <input
                  className="input"
                  value={form.account.instructorName}
                  onChange={(e) => updateAcc("instructorName", e.target.value)}
                  placeholder="Instructor name"
                />
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Field Description</span>
                  <small>Additional description for the field</small>
                </label>
                <input
                  className="input"
                  value={form.account.fieldDesc}
                  onChange={(e) => updateAcc("fieldDesc", e.target.value)}
                  placeholder="Add a description"
                />
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Category</span>
                  <small>Select the category for this instructor</small>
                </label>
                <select
                  value={form.account.category}
                  onChange={(e) => updateAcc("category", e.target.value)}
                >
                  <option>Autism</option>
                  <option>Down Syndrome</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label className="switcher">
                <input
                  type="checkbox"
                  checked={form.account.canUpload}
                  onChange={(e) => updateAcc("canUpload", e.target.checked)}
                />
                <span>Give access to upload content</span>
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn" onClick={createUser} type="button">
                ➕ Create User
              </button>
            </div>
          </details>

          <div className="savebar">
            <button 
              className="btn" 
              onClick={saveUser} 
              type="button"
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* SECURITY SETTINGS */}
      {tab === "security" && (
        <div className="settings-container">
          <details className="settings-acc" open>
            <summary className="settings-summary">
              <span>🔐 Authentication & Notifications</span>
              <small>Configure authentication and security notifications</small>
            </summary>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">
                  <span>Two Factor Authentication (2FA)</span>
                  <small>Require Two Factor Authentication for all users</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.twoFA}
                    onChange={(e) => update("twoFA", e.target.checked)}
                  />
                  <span>{form.twoFA ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Login Notification</span>
                  <small>Send email notification after login</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.emailAfterLogin}
                    onChange={(e) => update("emailAfterLogin", e.target.checked)}
                  />
                  <span>{form.emailAfterLogin ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>New Device Notification</span>
                  <small>Send email when login from new device</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.emailNewDevice}
                    onChange={(e) => update("emailNewDevice", e.target.checked)}
                  />
                  <span>{form.emailNewDevice ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Security Question</span>
                  <small>Enable Security Question for account recovery</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.securityQuestion}
                    onChange={(e) => update("securityQuestion", e.target.checked)}
                  />
                  <span>{form.securityQuestion ? "Enabled" : "Disabled"}</span>
                </label>
              </div>
            </div>
          </details>

          <details className="settings-acc" open>
            <summary className="settings-summary">
              <span>🛡️ Data Protection & Sessions</span>
              <small>Configure data encryption and session management</small>
            </summary>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">
                  <span>Data Encryption</span>
                  <small>Encrypt stored user data</small>
                </label>
                <label className="switcher">
                  <input
                    type="checkbox"
                    checked={form.encryptData}
                    onChange={(e) => update("encryptData", e.target.checked)}
                  />
                  <span>{form.encryptData ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Encryption Method</span>
                  <small>Choose the encryption algorithm</small>
                </label>
                <select
                  value={form.encryptionMethod}
                  onChange={(e) => update("encryptionMethod", e.target.value)}
                >
                  <option>AES - Advanced Encryption Standard</option>
                  <option>RSA - Rivest–Shamir–Adleman</option>
                  <option>ChaCha20-Poly1305</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Login Attempts Before Lockout</span>
                  <small>Number of failed attempts before account lockout</small>
                </label>
                <select
                  value={form.lockoutAttempts}
                  onChange={(e) => update("lockoutAttempts", e.target.value)}
                >
                  {["3", "5", "7", "10"].map((n) => (
                    <option key={n} value={n}>
                      {n} attempts
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Session Timeout</span>
                  <small>Automatic logout after inactivity</small>
                </label>
                <select
                  value={form.sessionTimeout}
                  onChange={(e) => update("sessionTimeout", e.target.value)}
                >
                  <option>5 min</option>
                  <option>10 min</option>
                  <option>30 min</option>
                  <option>60 min</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Data Retention Period</span>
                  <small>How long to store user data</small>
                </label>
                <select value={form.storeData} onChange={(e) => update("storeData", e.target.value)}>
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>12 Months</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Report Frequency</span>
                  <small>How often to generate student reports</small>
                </label>
                <select
                  value={form.reportFrequency}
                  onChange={(e) => update("reportFrequency", e.target.value)}
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Scheduled Maintenance</span>
                  <small>When to perform system maintenance</small>
                </label>
                <div className="row">
                  <input
                    className="input"
                    value={form.maintenanceTime}
                    onChange={(e) => update("maintenanceTime", e.target.value)}
                    placeholder="Every Saturday, 12:00 AM CET"
                  />
                  <button className="btn ghost small" type="button" title="Pick date/time">
                    📅
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field-label">
                  <span>Suspicious Activity Action</span>
                  <small>What to do when suspicious activity is detected</small>
                </label>
                <select
                  value={form.suspiciousAction}
                  onChange={(e) => update("suspiciousAction", e.target.value)}
                >
                  <option>Temporarily Block and Alert Admin</option>
                  <option>Require 2FA and Alert Admin</option>
                  <option>Alert Admin Only</option>
                </select>
              </div>
            </div>
          </details>

          <details className="settings-acc">
            <summary className="settings-summary">
              <span>🔑 Password Policy</span>
              <small>Configure password requirements</small>
            </summary>
            <div className="field">
              <label className="field-label">
                <span>Current Password Requirements</span>
                <small>These requirements are enforced for all new passwords</small>
              </label>
              <div className="chips">
                {form.passwordPolicy.map((p) => (
                  <span className="chip" key={p}>
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </details>

          <div className="savebar">
            <button 
              className="btn" 
              onClick={saveSec} 
              type="button"
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
