import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import "./InstructorLogin.css";

// Combined authentication: Firebase + MongoDB
async function loginInstructor({ email, password }) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Step 1: Check if user exists in MongoDB and get their auth method
    const checkResponse = await fetch(`${API_URL}/api/teachers/auth/check-auth-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const checkData = await checkResponse.json();

    if (!checkResponse.ok) {
      if (checkResponse.status === 404) {
        return { ok: false, error: 'Teacher not found. Please check your email.' };
      }
      return { ok: false, error: checkData.error || 'Login failed. Please try again.' };
    }

    // Step 2: Authenticate based on auth method
    if (checkData.hasFirebase) {
      // User has Firebase UID - authenticate with Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Check if email is verified (for email/password signups)
        if (!firebaseUser.emailVerified) {
          await auth.signOut();
          return { 
            ok: false, 
            error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
          };
        }

        // Firebase authentication successful - get MongoDB token
        const loginResponse = await fetch(`${API_URL}/api/teachers/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, firebaseUID: firebaseUser.uid }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          await auth.signOut();
          return { ok: false, error: loginData.error || 'Login failed. Please try again.' };
        }

        return {
          ok: true,
          token: loginData.data.token,
          user: {
            id: loginData.data.teacher.id,
            name: loginData.data.teacher.fullName,
            email: loginData.data.teacher.email
          }
        };
      } catch (firebaseError) {
        console.error('Firebase login error:', firebaseError);
        if (firebaseError.code === 'auth/wrong-password') {
          return { ok: false, error: 'Invalid email or password.' };
        } else if (firebaseError.code === 'auth/user-not-found') {
          return { ok: false, error: 'Teacher not found. Please check your email.' };
        } else if (firebaseError.code === 'auth/too-many-requests') {
          return { ok: false, error: 'Too many login attempts. Please try again later.' };
        }
        return { ok: false, error: firebaseError.message || 'Firebase authentication failed.' };
      }
    } else {
      // User doesn't have Firebase - use MongoDB password authentication
      const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return { ok: false, error: 'Teacher not found. Please check your email.' };
        } else if (response.status === 401) {
          return { ok: false, error: 'Invalid email or password.' };
        } else {
          return { ok: false, error: data.error || 'Login failed. Please try again.' };
        }
      }

      return {
        ok: true,
        token: data.data.token,
        user: {
          id: data.data.teacher.id,
          name: data.data.teacher.fullName,
          email: data.data.teacher.email
        }
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
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
  const navigate = useNavigate();
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

    // Store authentication data
    const storage = remember ? window.localStorage : window.sessionStorage;
    if (res.token) {
      storage.setItem("token", res.token);
      storage.setItem("le_instructor_token", res.token); // Keep for compatibility
    }
    storage.setItem("role", "teacher");
    storage.setItem("userId", res.user?.id || "");
    storage.setItem("le_instructor_id", res.user?.id || ""); // Keep for compatibility
    storage.setItem("userName", res.user?.name || "Instructor");
    storage.setItem("le_instructor_name", res.user?.name || "Instructor"); // Keep for compatibility
    storage.setItem("userEmail", res.user?.email || "");
    
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
            <button
              type="button"
              className="instructorLogin-link-btn"
              onClick={() => navigate("/InstructorForgotPassword")}
            >
              Forgot password?
            </button>
          </div>

          <button 
            className="instructorLogin-btn" 
            type="submit" 
            disabled={loading}
            style={{ outline: 'none', border: 'none' }}
          >
            {loading ? <span className="instructorLogin-spinner" /> : "Log in"}
          </button>
        </form>

        <div className="instructorLogin-foot">
          <span>New instructor?</span>
          <button
            type="button"
            className="instructorLogin-link-btn"
            onClick={() => navigate("/InstructorSignUp1")}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
