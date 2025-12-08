import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* Icons */
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

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Try to login as teacher
async function loginTeacher({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response from teacher login:', text);
      return { ok: false, error: 'Server error. Please try again later.' };
    }

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: null }; // User not found, try student
      } else if (response.status === 401) {
        return { ok: false, error: 'Invalid email or password.' };
      } else {
        return { ok: false, error: data.error || 'Login failed. Please try again.' };
      }
    }

    return {
      ok: true,
      userType: 'teacher',
      token: data.data.token,
      user: {
        id: data.data.teacher.id,
        name: data.data.teacher.fullName || 'Instructor',
        email: data.data.teacher.email,
        areasOfExpertise: data.data.teacher.areasOfExpertise || [],
        cv: data.data.teacher.cv || '',
        informationGatheringComplete: data.data.teacher.informationGatheringComplete || false
      }
    };
  } catch (error) {
    console.error('Teacher login error:', error);
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}

// Try to login as student
async function loginStudent({ email, password }) {
  try {
    // Try student login endpoint - adjust endpoint if different
    const response = await fetch(`${API_URL}/api/students/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Not JSON response - endpoint might not exist
      return { ok: false, error: null };
    }

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: null }; // User not found, try teacher
      } else if (response.status === 401) {
        return { ok: false, error: 'Invalid email or password.' };
      } else {
        return { ok: false, error: null }; // Other error, try teacher
      }
    }

    return {
      ok: true,
      userType: 'student',
      token: data.data?.token || data.token,
      user: {
        id: data.data?.student?.id || data.data?.id || data.student?.id,
        name: data.data?.student?.fullName || data.data?.student?.name || data.student?.fullName || 'Student',
        email: data.data?.student?.email || data.data?.email || data.student?.email,
      }
    };
  } catch (error) {
    console.error('Student login error:', error);
    // Network error or endpoint doesn't exist - try teacher
    return { ok: false, error: null };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    // Accept both email and username
    if (!username.trim()) {
      e.username = "Username or email is required.";
    } else if (username.includes('@') && !isEmail(username)) {
      e.username = "Enter a valid email.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Minimum 6 characters.";
    }
    setErrors(e);
    setServerError(""); // Clear server error on validation
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);

    try {
      // Determine if username is an email
      const email = username.includes('@') ? username : null;
      const loginIdentifier = email || username;
      
      // Try both teacher and student databases
      // If it's an email, try teacher first (most teachers use email)
      // If it's a username, try student first (students might use username)
      let loginResult = null;
      let triedBoth = false;

      if (email) {
        // Try teacher login first
        loginResult = await loginTeacher({ email: loginIdentifier, password });
        
        // If teacher login failed (not found or network error), try student
        if (!loginResult.ok) {
          const studentResult = await loginStudent({ email: loginIdentifier, password });
          if (studentResult.ok) {
            loginResult = studentResult;
          } else {
            // If student also failed with an error message, use that
            if (studentResult.error) {
              loginResult = studentResult;
            }
            triedBoth = true;
          }
        }
      } else {
        // Try student login first
        loginResult = await loginStudent({ email: loginIdentifier, password });
        
        // If student login failed (not found or network error), try teacher
        if (!loginResult.ok) {
          const teacherResult = await loginTeacher({ email: loginIdentifier, password });
          if (teacherResult.ok) {
            loginResult = teacherResult;
          } else {
            // If teacher also failed with an error message, use that
            if (teacherResult.error) {
              loginResult = teacherResult;
            }
            triedBoth = true;
          }
        }
      }

      if (!loginResult.ok) {
        const errorMsg = loginResult.error || 
          (triedBoth ? "User not found in either database. Please check your credentials or sign up." : 
           "Invalid credentials. Please check your username/email and password.");
        setServerError(errorMsg);
        setLoading(false);
        return;
      }

      // Store authentication data
      const storage = remember ? window.localStorage : window.sessionStorage;
      if (loginResult.token) {
        storage.setItem("token", loginResult.token);
      }
      storage.setItem("role", loginResult.userType);
      storage.setItem("userId", loginResult.user?.id || "");
      storage.setItem("userName", loginResult.user?.name || (loginResult.userType === 'teacher' ? 'Instructor' : 'Student'));
      storage.setItem("userEmail", loginResult.user?.email || "");

      // For teachers, also store compatibility fields
      if (loginResult.userType === 'teacher') {
        storage.setItem("le_instructor_token", loginResult.token);
        storage.setItem("le_instructor_id", loginResult.user?.id || "");
        storage.setItem("le_instructor_name", loginResult.user?.name || "Instructor");

        // Try Firebase authentication (optional, won't block login if it fails)
        try {
          await signInWithEmailAndPassword(auth, loginResult.user?.email || email || username, password);
        } catch (firebaseError) {
          console.log('Firebase authentication not available:', firebaseError.code);
          // Don't block login - user can still access the app
        }

        // Check if information gathering is complete for teachers
        const isInfoGatheringComplete = loginResult.user?.informationGatheringComplete === true;
        
        if (!isInfoGatheringComplete) {
          const areasOfExpertise = loginResult.user?.areasOfExpertise || [];
          const cv = loginResult.user?.cv || '';
          
          if (areasOfExpertise.length === 0 || cv.trim() === '') {
            // Missing data - redirect to Step 1
            navigate('/InformationGathering-1');
            return;
          } else {
            // All data exists but not marked complete - automatically mark as complete
            try {
              await fetch(`${API_URL}/api/teachers/me`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${loginResult.token}`
                },
                body: JSON.stringify({ informationGatheringComplete: true })
              });
            } catch (error) {
              console.error('Error marking information gathering as complete:', error);
            }
          }
        }

        // Navigate to instructor dashboard
        navigate('/instructor-dashboard-2');
      } else {
        // Navigate to student dashboard
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-login-wrap">
      <div className="all-login-card">
          {/* Go Back Button */}
          <button
            type="button"
            className="all-login-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
            <span>Go back</span>
          </button>

          {/* Curved Purple Header */}
          <div className="all-login-form-header">
            <div className="all-login-profile-icon-wrapper">
              <ProfileIcon />
            </div>
            <h2 className="all-login-user-type">Sign into your account</h2>
          </div>

          {/* Login Form */}
          <form className="all-login-form" onSubmit={handleSubmit}>
            {serverError && (
              <div className="all-login-server-error" role="alert">
                {serverError}
              </div>
            )}
            <div className="all-login-form-field">
              <div className="all-login-input-wrapper">
                <span className="all-login-input-icon">
                  <PersonIcon />
                </span>
                <input
                  type="text"
                  className={`all-login-input ${errors.username ? "all-login-input-error" : ""}`}
                  placeholder="Enter your email or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={validate}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="all-login-error">{errors.username}</span>}
            </div>

            <div className="all-login-form-field">
              <div className="all-login-input-wrapper">
                <span className="all-login-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`all-login-input ${errors.password ? "all-login-input-error" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={validate}
                />
                <button
                  type="button"
                  className="all-login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <span className="all-login-error">{errors.password}</span>}
            </div>

            <div className="all-login-options">
              <label className="all-login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="all-login-forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="all-login-signin-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="all-login-signup-link">
              <span>New user? </span>
              <button
                type="button"
                className="all-login-link-btn"
                onClick={() => navigate("/all-signup")}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}

