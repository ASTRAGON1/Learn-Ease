import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
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

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Try to login as teacher
async function loginTeacher({ email, password }) {
  try {
    console.log('Attempting teacher login with:', { email: email?.substring(0, 5) + '...' });
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
      console.log('Teacher login failed:', { status: response.status, error: data.error });
      if (response.status === 404) {
        return { ok: false, error: null }; // User not found, try student
      } else if (response.status === 401) {
        return { ok: false, error: 'Invalid email or password.' };
      } else {
        return { ok: false, error: data.error || 'Login failed. Please try again.' };
      }
    }

    console.log('Teacher login successful');
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
    console.log('Attempting student login with:', { email: email?.substring(0, 5) + '...' });
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
      
      // If it's an email, check which database it exists in first
      let loginResult = null;
      
      if (email) {
        // Check which database the email exists in
        const emailCheckResponse = await fetch(`${API_URL}/api/students/auth/check-email/${encodeURIComponent(email)}`);
        if (emailCheckResponse.ok) {
          const emailCheckData = await emailCheckResponse.json();
          
          if (emailCheckData.inTeacher) {
            // Email exists in teacher database - try teacher login only
            loginResult = await loginTeacher({ email: loginIdentifier, password });
            if (!loginResult.ok) {
              // Teacher login failed - show error
              setServerError(loginResult.error || "Invalid credentials. Please check your email and password.");
              setLoading(false);
              return;
            }
          } else if (emailCheckData.inStudent) {
            // Email exists in student database - try student login only
            loginResult = await loginStudent({ email: loginIdentifier, password });
            if (!loginResult.ok) {
              // Student login failed - show error
              setServerError(loginResult.error || "Invalid credentials. Please check your email and password.");
              setLoading(false);
              return;
            }
          } else {
            // Email doesn't exist in either database
            setServerError("User not found. Please check your email or sign up.");
            setLoading(false);
            return;
          }
        } else {
          // If check fails, try both (fallback)
          loginResult = await loginTeacher({ email: loginIdentifier, password });
          if (!loginResult.ok) {
            loginResult = await loginStudent({ email: loginIdentifier, password });
          }
        }
      } else {
        // Username (not email) - try student first, then teacher
        loginResult = await loginStudent({ email: loginIdentifier, password });
        if (!loginResult.ok) {
          loginResult = await loginTeacher({ email: loginIdentifier, password });
        }
      }

      if (!loginResult.ok) {
        const errorMsg = loginResult.error || "Invalid credentials. Please check your username/email and password.";
        setServerError(errorMsg);
        setLoading(false);
        return;
      }

      // Debug logging
      console.log('Login result:', { 
        ok: loginResult.ok, 
        userType: loginResult.userType, 
        email: loginResult.user?.email 
      });

      // Route based on user type: Teachers → instructor-dashboard-2, Students → student-dashboard-2
      if (loginResult.userType === 'teacher') {
        console.log('Routing to instructor dashboard');
        // Sign in with Firebase - this is REQUIRED for instructors
        let firebaseUID = null;
        try {
          const firebaseCredential = await signInWithEmailAndPassword(auth, loginResult.user?.email || email || username, password);
          firebaseUID = firebaseCredential.user.uid;
          
          // Wait for Firebase Auth state to propagate (up to 2 seconds)
          await new Promise((resolve) => {
            let resolved = false;
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              if (user && user.uid === firebaseUID && !resolved) {
                resolved = true;
                unsubscribe();
                resolve();
              }
            });
            // If already authenticated, resolve immediately
            if (auth.currentUser && auth.currentUser.uid === firebaseUID) {
              if (!resolved) {
                resolved = true;
                unsubscribe();
                resolve();
              }
            }
            // Timeout after 2 seconds
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                unsubscribe();
                resolve();
              }
            }, 2000);
          });
          
          // Verify Firebase Auth is properly initialized
          if (!auth.currentUser || auth.currentUser.uid !== firebaseUID) {
            throw new Error('Firebase authentication not properly initialized');
          }
          
          // Verify token is available
          try {
            await auth.currentUser.getIdToken();
          } catch (tokenError) {
            throw new Error('Firebase token not available');
          }
          
          // Update MongoDB with firebaseUID if not already set
          try {
            const updateResponse = await fetch(`${API_URL}/api/teachers/me`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.token}`
              },
              body: JSON.stringify({ firebaseUID })
            });
            
            if (!updateResponse.ok) {
              console.log('Could not update firebaseUID (may already be set)');
            }
          } catch (updateError) {
            console.log('Could not update firebaseUID (may already be set):', updateError);
            // Continue anyway - firebaseUID might already be set
          }
        } catch (firebaseError) {
          console.error('Firebase authentication failed:', firebaseError.code, firebaseError.message);
          
          // Provide specific error messages
          let errorMessage = 'Firebase authentication failed. Please try again.';
          
          if (firebaseError.code === 'auth/user-not-found') {
            errorMessage = 'Firebase account not found. Please sign up first or contact support.';
          } else if (firebaseError.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password for Firebase account. Please check your password.';
          } else if (firebaseError.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address. Please check your email.';
          } else if (firebaseError.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
          } else if (firebaseError.message && firebaseError.message.includes('not properly initialized')) {
            errorMessage = 'Authentication error. Please refresh the page and try again.';
          }
          
          setServerError(errorMessage);
          setLoading(false);
          return;
        }
        
        // Double-check Firebase Auth is still valid before proceeding
        if (!auth.currentUser) {
          setServerError('Firebase authentication session expired. Please try again.');
          setLoading(false);
          return;
        }

        // Check if information gathering is complete for teachers
        const isInfoGatheringComplete = loginResult.user?.informationGatheringComplete === true;
        
        if (!isInfoGatheringComplete) {
          const areasOfExpertise = loginResult.user?.areasOfExpertise || [];
          const cv = loginResult.user?.cv || '';
          
          // Determine which step to redirect to based on what data is missing
          if (areasOfExpertise.length === 0) {
            // Missing areas of expertise - redirect to Step 1
            navigate('/InformationGathering-1');
            return;
          } else if (!cv || cv.trim() === '') {
            // Has areas of expertise but missing CV - redirect to Step 2
            navigate('/InformationGathering-2');
            return;
          } else {
            // All data exists but not marked complete - automatically mark as complete
            try {
              const completeResponse = await fetch(`${API_URL}/api/teachers/me`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${loginResult.token}`
                },
                body: JSON.stringify({ informationGatheringComplete: true })
              });
              
              if (completeResponse.ok) {
                // Successfully marked as complete - go to dashboard
                navigate('/instructor-dashboard-2');
                return;
              } else {
                // Failed to mark complete - redirect to Step 3 to let user complete manually
                navigate('/InformationGathering-3');
                return;
              }
            } catch (error) {
              console.error('Error marking information gathering as complete:', error);
              // On error, redirect to Step 3 to let user complete manually
              navigate('/InformationGathering-3');
              return;
            }
          }
        }

        // Information gathering is complete - navigate to instructor dashboard
        navigate('/instructor-dashboard-2');
      } else {
        // For students: Store in sessionStorage and navigate to student-dashboard-2
        const storage = window.sessionStorage;
        if (loginResult.token) {
          storage.setItem("token", loginResult.token);
        }
        storage.setItem("role", loginResult.userType);
        storage.setItem("userId", loginResult.user?.id || "");
        storage.setItem("userName", loginResult.user?.name || 'Student');
        storage.setItem("userEmail", loginResult.user?.email || "");
        // Navigate to student dashboard-2
        console.log('Routing to student dashboard-2');
        navigate('/student-dashboard-2');
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
        {/* Branding Section */}
        <div className="all-login-brand-section">
          <div className="all-login-brand-content">
            <div className="all-login-logo">
              <div className="all-login-logo-badge">LE</div>
              <span>LearnEase</span>
            </div>
            <h2 className="all-login-brand-title">Welcome Back</h2>
            <p className="all-login-brand-subtitle">Sign in to continue your learning journey</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="all-login-form-section">
          <div className="all-login-title-section">
          <button
            type="button"
            className="all-login-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
          </button>
            <h1 className="all-login-page-title">Login</h1>
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

            <div className="all-login-divider">
              <span>Or</span>
            </div>

            <button
              type="button"
              className="all-login-google-btn"
              onClick={() => {
                // Add Google login logic here
                console.log("Login with Google");
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Log in with Google</span>
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
    </div>
  );
}

