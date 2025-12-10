import React, { useState } from "react";
import "./AdminLogin2.css";

// Icons
const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none" stroke="currentColor"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor"/>
  </svg>
);

const EyeOff = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 1l22 22" strokeWidth="2" fill="none" stroke="currentColor"/>
    <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none" stroke="currentColor"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function AdminLogin2({ loginForm, setLoginForm, loginBusy, loginError, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!loginForm.email) {
      e.email = "Email is required";
    } else if (!isEmail(loginForm.email)) {
      e.email = "Enter a valid email";
    }
    if (!loginForm.password) {
      e.password = "Password is required";
    } else if (loginForm.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onLogin(e);
  };

  const handleChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        {/* Image Section */}
        <div className="admin-login-image-section">
          <div className="admin-login-image-content">
            <div className="admin-login-logo">
              <div className="admin-login-logo-badge">LE</div>
              <span>LearnEase</span>
            </div>
            <h2 className="admin-login-image-title">Admin Portal</h2>
            <p className="admin-login-image-subtitle">Manage your platform with ease</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="admin-login-form-section">
          <div className="admin-login-title-section">
            <h1 className="admin-login-page-title">Admin Login</h1>
            <p className="admin-login-subtitle">Sign in to access the admin dashboard</p>
          </div>

          {loginError && (
            <div className="admin-login-server-error" role="alert">
              {loginError}
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-login-form-field">
              <label htmlFor="admin-email">Email</label>
              <div className="admin-login-input-wrapper">
                <span className="admin-login-input-icon">
                  <EmailIcon />
                </span>
                <input
                  id="admin-email"
                  className={`admin-login-input ${errors.email ? "admin-login-input-error" : ""}`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="admin@learnease.com"
                  value={loginForm.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={validate}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-err" : undefined}
                />
              </div>
              {errors.email && (
                <small id="email-err" className="admin-login-error">{errors.email}</small>
              )}
            </div>

            <div className="admin-login-form-field">
              <label htmlFor="admin-password">Password</label>
              <div className={`admin-login-input-wrapper ${errors.password ? "admin-login-input-error" : ""}`}>
                <span className="admin-login-input-icon">
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  className="admin-login-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={validate}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "pw-err" : undefined}
                />
                <button
                  type="button"
                  className="admin-login-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <small id="pw-err" className="admin-login-error">{errors.password}</small>
              )}
            </div>

            <button 
              className="admin-login-btn" 
              type="submit" 
              disabled={loginBusy}
            >
              {loginBusy ? (
                <>
                  <span className="admin-login-spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin2;

