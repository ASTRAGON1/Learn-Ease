import React, { useState } from "react";

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

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function AdminLogin({ loginForm, setLoginForm, loginBusy, loginError, onLogin }) {
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
    <div className="adminLogin-wrap">
      <div className="adminLogin-card">
        <div className="adminLogin-header">
          <div className="adminLogin-logo">
            <div className="adminLogin-logo-badge">LE</div>
            <span>LearnEase Admin</span>
          </div>
          <p className="adminLogin-subtitle">Access the admin dashboard to manage the platform</p>
        </div>

        {loginError && (
          <div className="adminLogin-alert" role="alert">
            {loginError}
          </div>
        )}

        <form className="adminLogin-form" onSubmit={handleSubmit} noValidate>
          <div className="adminLogin-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              className={`adminLogin-input ${errors.email ? "adminLogin-invalid" : ""}`}
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
            {errors.email && (
              <small id="email-err" className="adminLogin-error">{errors.email}</small>
            )}
          </div>

          <div className="adminLogin-field">
            <label htmlFor="admin-password">Password</label>
            <div className={`adminLogin-input-group ${errors.password ? "adminLogin-invalid" : ""}`}>
              <input
                id="admin-password"
                className="adminLogin-input"
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
                className="adminLogin-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <small id="pw-err" className="adminLogin-error">{errors.password}</small>
            )}
          </div>

          <button 
            className="adminLogin-btn" 
            type="submit" 
            disabled={loginBusy}
          >
            {loginBusy ? (
              <>
                <span className="adminLogin-spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

