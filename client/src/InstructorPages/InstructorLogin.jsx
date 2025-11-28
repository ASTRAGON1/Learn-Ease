import React, { useState } from "react";
import "./InstructorLogin.css";

/* Demo auth stub (swap with your backend later) */
const DEMO_INSTRUCTOR = {
  id: "inst-demo-1",
  name: "Demo Instructor",
  email: "instructor@demo.com",
  password: "Teach123!",
};

async function loginInstructor({ email, password }) {
  await new Promise((r) => setTimeout(r, 600));
  if (email === DEMO_INSTRUCTOR.email && password === DEMO_INSTRUCTOR.password) {
    return { ok: true, token: "demo.jwt.token", user: { id: DEMO_INSTRUCTOR.id, name: DEMO_INSTRUCTOR.name, email } };
  }
  return { ok: false, error: "Invalid email or password." };
}

/* Icons */
const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 1l22 22" strokeWidth="2" fill="none"/>
    <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none"/>
  </svg>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function InstructorLogin({
  onSuccess,
  redirectTo = "/InstructorDash",
  backHref = "/",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required.";
    else if (!isEmail(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Minimum 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    const res = await loginInstructor({ email, password });
    setLoading(false);
    if (!res.ok) return setServerError(res.error || "Login failed.");

    const storage = remember ? window.localStorage : window.sessionStorage;
    if (res.token) storage.setItem("le_instructor_token", res.token);
    storage.setItem("le_instructor_name", res.user?.name || "Instructor");
    storage.setItem("le_instructor_id", res.user?.id || "");
    if (typeof onSuccess === "function") onSuccess(res);
    else window.location.assign(redirectTo);
  };

  return (
    <div className="instructorLogin-wrap">
      

      <div className="instructorLogin-card">
        <button 
          type="button"
          className="instructorLogin-back" 
          onClick={() => window.location.href = backHref}
          aria-label="Back to landing"
        >
          ‹ Back
        </button>
        <h1 className="instructorLogin-title">Instructor Login</h1>
        <p className="instructorLogin-subtitle">Access your dashboard to manage courses and students.</p>

        {serverError && <div className="instructorLogin-alert" role="alert">{serverError}</div>}

        <form className="instructorLogin-form" onSubmit={handleSubmit} noValidate>
          <div className="instructorLogin-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className={`instructorLogin-input ${errors.email ? "instructorLogin-invalid" : ""}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="instructor@demo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validate}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-err" : undefined}
            />
            {errors.email && <small id="email-err" className="instructorLogin-error">{errors.email}</small>}
          </div>

          <div className="instructorLogin-field">
            <label htmlFor="password">Password</label>
            <div className={`instructorLogin-input-group ${errors.password ? "instructorLogin-invalid" : ""}`}>
              <input
                id="password"
                className="instructorLogin-input"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validate}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "pw-err" : undefined}
              />
              <button
                type="button"
                className="instructorLogin-eye"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <small id="pw-err" className="instructorLogin-error">{errors.password}</small>}
          </div>

          <div className="instructorLogin-row">
            <label className="instructorLogin-switch">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="instructorLogin-switch-track" aria-hidden="true"></span>
              <span className="instructorLogin-switch-label">Remember me</span>
            </label>
            <a className="instructorLogin-link" href="/instructor/forgot-password">Forgot password?</a>
          </div>

          <button className="instructorLogin-btn" type="submit" disabled={loading}>
            {loading ? <span className="instructorLogin-spinner" /> : "Log in"}
          </button>
        </form>

        <div className="instructorLogin-foot">
          <span>New instructor?</span>
          <a className="instructorLogin-link" href="/InstructorSignUp1">Create an account</a>
        </div>
      </div>
    </div>
  );
}
