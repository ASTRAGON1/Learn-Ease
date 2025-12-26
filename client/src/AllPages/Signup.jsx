import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* Icons */
const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none" stroke="currentColor" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor" />
  </svg>
);

const EyeOff = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 1l22 22" strokeWidth="2" fill="none" stroke="currentColor" />
    <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none" stroke="currentColor" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Signup() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("student"); // "student" or "instructor"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Sign out any unverified Firebase users on component mount
  useEffect(() => {
    const checkAndSignOut = async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth);
      }
    };
    checkAndSignOut();
  }, []);

  const validate = () => {
    const e = {};
    if (!fullName.trim()) {
      e.fullName = "Full name is required.";
    }
    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!isEmail(email)) {
      e.email = "Enter a valid email.";
    }
    // Username is required for students, optional for instructors
    if (userType === "student" && !username.trim()) {
      e.username = "Username is required.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Minimum 6 characters.";
    }
    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    if (!agreeToTerms) {
      e.agreeToTerms = "You must agree to the terms and conditions.";
    }
    setErrors(e);
    setGeneralError(""); // Clear general error on validation
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    setGeneralError("");
    setShowLoginPrompt(false);
    setLoading(true);

    let mongoRegistrationSuccess = false;
    let firebaseUser = null;

    try {
      // Step 1: Check if email exists in MongoDB (both student and teacher databases)
      const emailCheckResponse = await fetch(`${API_URL}/api/students/auth/check-email/${encodeURIComponent(email)}`);
      if (emailCheckResponse.ok) {
        const emailCheckData = await emailCheckResponse.json();
        if (emailCheckData.exists) {
          if (emailCheckData.inStudent) {
            setGeneralError("This email is already registered as a student. Would you like to go to the login page?");
            setShowLoginPrompt(true);
          } else if (emailCheckData.inTeacher) {
            setGeneralError("This email is already registered as a teacher. Would you like to go to the login page?");
            setShowLoginPrompt(true);
          }
          setLoading(false);
          return;
        }
      }

      let firebaseUID;

      // Step 2: Create Firebase account (required for both students and instructors)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        firebaseUID = firebaseUser.uid;
      } catch (createError) {
        // If email already exists in Firebase, check if it's verified
        if (createError.code === 'auth/email-already-in-use') {
          try {
            // Try to sign in to check if the account exists and is verified
            const signInCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = signInCredential.user;
            firebaseUID = firebaseUser.uid;

            if (firebaseUser.emailVerified) {
              setGeneralError("This email is already registered and verified in Firebase. Would you like to go to the login page?");
              setShowLoginPrompt(true);
              await signOut(auth);
              setLoading(false);
              return;
            } else {
              // Email exists in Firebase but not verified - this shouldn't happen if MongoDB check passed
              // But we'll handle it by cleaning up and showing error
              await signOut(auth);
              setGeneralError("This email is already registered in Firebase. Would you like to go to the login page?");
              setShowLoginPrompt(true);
              setLoading(false);
              return;
            }
          } catch (signInError) {
            if (signInError.code === 'auth/wrong-password') {
              setGeneralError("An account with this email already exists in Firebase, but the password is incorrect. Would you like to go to the login page?");
              setShowLoginPrompt(true);
            } else {
              setGeneralError("This email is already registered in Firebase. Would you like to go to the login page?");
              setShowLoginPrompt(true);
            }
            setLoading(false);
            return;
          }
        } else {
          // Other Firebase errors - show error and stop registration
          if (createError.code === 'auth/weak-password') {
            setGeneralError("Password is too weak. Please use a stronger password.");
          } else if (createError.code === 'auth/invalid-email') {
            setGeneralError("Invalid email address. Please check your email.");
          } else if (createError.code === 'auth/network-request-failed') {
            setGeneralError("Network error. Please check your internet connection and try again.");
          } else {
            setGeneralError(`Firebase error: ${createError.message || 'Failed to create account'}`);
          }
          setLoading(false);
          return;
        }
      }

      // Register in MongoDB based on user type
      let response;

      if (userType === "instructor") {
        // Register as instructor
        if (!firebaseUID && firebaseUser) {
          firebaseUID = firebaseUser.uid;
        }

        response = await fetch(`${API_URL}/api/teachers/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email,
            password,
            firebaseUID
          }),
        });
      } else {
        // Register as student
        if (!firebaseUID && firebaseUser) {
          firebaseUID = firebaseUser.uid;
        }

        response = await fetch(`${API_URL}/api/students/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email,
            password,
            username: username.trim(),
            firebaseUID
          }),
        });
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);

        // MongoDB registration failed - clean up Firebase user
        if (firebaseUser) {
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error('Error signing out:', signOutError);
          }
        }

        if (response.status === 404) {
          setGeneralError("Server endpoint not found. Please check if the server is running.");
        } else if (response.status >= 500) {
          setGeneralError("Server error. Please try again later.");
        } else {
          setGeneralError("Sign up failed. Please check your connection and try again.");
        }
        setLoading(false);
        return;
      }

      // Check if MongoDB registration succeeded
      if (!response.ok) {
        // MongoDB registration failed - clean up Firebase user
        if (firebaseUser) {
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error('Error signing out:', signOutError);
          }
        }

        if (response.status === 409) {
          setGeneralError("An account with this email already exists. Would you like to go to the login page?");
          setShowLoginPrompt(true);
        } else {
          setGeneralError(data.error || "Sign up failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // MongoDB registration succeeded
      mongoRegistrationSuccess = true;

      // Send email verification AFTER successful MongoDB registration
      if (firebaseUser && !firebaseUser.emailVerified) {
        try {
          const verificationUrl = window.location.origin + '/verify-email';

          await sendEmailVerification(firebaseUser, {
            url: verificationUrl,
            handleCodeInApp: false
          });
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Don't fail the registration if email sending fails - user can request resend later
        }
      }

      // Success - redirect to email verification page for BOTH user types
      // Store student data temporarily (will be used after verification)
      if (userType === "student" && data.data?.token) {
        sessionStorage.setItem("tempToken", data.data.token);
        sessionStorage.setItem("tempRole", "student");
        sessionStorage.setItem("tempUserId", data.data.student?.id || "");
        sessionStorage.setItem("tempUserName", data.data.student?.fullName || fullName);
        sessionStorage.setItem("tempUserEmail", email);
      }

      setLoading(false);
      navigate("/verify-email", {
        state: {
          email: email,
          userType: userType,
          fullName: fullName
        }
      });
    } catch (error) {
      console.error('Signup error:', error);

      // Clean up Firebase user if registration failed
      // Only sign out if MongoDB registration didn't succeed
      // (mongoRegistrationSuccess will be false if we never got to that point or if it failed)
      if (auth.currentUser && !mongoRegistrationSuccess) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      }

      // Handle specific Firebase errors
      if (error.code === 'auth/weak-password') {
        setGeneralError("Password is too weak. Please use a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        setGeneralError("Invalid email address. Please check your email.");
      } else if (error.code === 'auth/email-already-in-use') {
        setGeneralError("This email is already registered. Would you like to go to the login page?");
        setShowLoginPrompt(true);
      } else if (error.code === 'auth/network-request-failed') {
        setGeneralError("Network error. Please check your internet connection and try again.");
      } else {
        // Generic error message
        const errorMessage = error.message || "Sign up failed. Please try again.";
        setGeneralError(errorMessage);
      }

      setLoading(false);
      // Don't navigate on error - let user see the error message and stay on signup page
    }
  };

  return (
    <div className="all-signup-wrap">
      <div className="all-signup-card">
        {/* Branding Section */}
        <div className="all-signup-brand-section">
          <div className="all-signup-brand-content">
            <div className="all-signup-logo">
              <div className="all-signup-logo-badge">LE</div>
              <span>LearnEase</span>
            </div>
            <h2 className="all-signup-brand-title">
              {userType === "student" ? "Start Your Learning Journey" : "Share Your Knowledge"}
            </h2>
            <p className="all-signup-brand-subtitle">
              {userType === "student"
                ? "Join thousands of students learning new skills every day"
                : "Empower learners around the world with your expertise"}
            </p>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="all-signup-form-section">
          <div className="all-signup-title-section">
            <button
              type="button"
              className="all-signup-back-btn"
              onClick={() => navigate("/")}
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="all-signup-page-title">
              {userType === "student" ? "Student SignUp" : "Instructor SignUp"}
            </h1>
          </div>

          {/* Signup Form */}
          <form className="all-signup-form" onSubmit={handleSubmit}>
            {showLoginPrompt && (
              <div className="all-signup-notice-banner">
                <div className="all-signup-notice-content">
                  <p>{generalError}</p>
                  <button
                    type="button"
                    className="all-signup-notice-btn"
                    onClick={() => navigate("/all-login")}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}

            {generalError && !showLoginPrompt && (
              <div className="all-signup-server-error" role="alert">
                {generalError}
              </div>
            )}

            {/* User Type Selection */}
            <div className="all-signup-form-field">
              <label className="all-signup-field-label">Sign up as</label>
              <div className="all-signup-user-type-selection">
                <label className={`all-signup-radio-option ${userType === "student" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={userType === "student"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <span>Student</span>
                </label>
                <label className={`all-signup-radio-option ${userType === "instructor" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="instructor"
                    checked={userType === "instructor"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <span>Instructor</span>
                </label>
              </div>
            </div>

            <div className="all-signup-form-field">
              <div className="all-signup-input-wrapper">
                <span className="all-signup-input-icon">
                  <PersonIcon />
                </span>
                <input
                  type="text"
                  className={`all-signup-input ${errors.fullName ? "all-signup-input-error" : ""}`}
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={validate}
                />
              </div>
              {errors.fullName && <span className="all-signup-error">{errors.fullName}</span>}
            </div>

            <div className="all-signup-form-field">
              <div className="all-signup-input-wrapper">
                <span className="all-signup-input-icon">
                  <EmailIcon />
                </span>
                <input
                  type="email"
                  className={`all-signup-input ${errors.email ? "all-signup-input-error" : ""}`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validate}
                />
              </div>
              {errors.email && <span className="all-signup-error">{errors.email}</span>}
            </div>

            {userType === "student" && (
              <div className="all-signup-form-field">
                <div className="all-signup-input-wrapper">
                  <span className="all-signup-input-icon">
                    <PersonIcon />
                  </span>
                  <input
                    type="text"
                    className={`all-signup-input ${errors.username ? "all-signup-input-error" : ""}`}
                    placeholder="Username *"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={validate}
                  />
                </div>
                {errors.username && <span className="all-signup-error">{errors.username}</span>}
              </div>
            )}

            <div className="all-signup-form-field">
              <div className="all-signup-input-wrapper">
                <span className="all-signup-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`all-signup-input ${errors.password ? "all-signup-input-error" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={validate}
                />
                <button
                  type="button"
                  className="all-signup-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <span className="all-signup-error">{errors.password}</span>}
            </div>

            <div className="all-signup-form-field">
              <div className="all-signup-input-wrapper">
                <span className="all-signup-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`all-signup-input ${errors.confirmPassword ? "all-signup-input-error" : ""}`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validate}
                />
                <button
                  type="button"
                  className="all-signup-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="all-signup-error">{errors.confirmPassword}</span>}
            </div>

            <div className="all-signup-form-field">
              <label className="all-signup-terms-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeToTerms && <span className="all-signup-error">{errors.agreeToTerms}</span>}
            </div>

            <button
              type="submit"
              className="all-signup-signup-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>

            <div className="all-signup-divider">
              <span>Or</span>
            </div>

            <button
              type="button"
              className="all-signup-google-btn"
              onClick={() => {
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign up with Google</span>
            </button>

            <div className="all-signup-login-link">
              <span>Already have an account? </span>
              <button
                type="button"
                className="all-signup-link-btn"
                onClick={() => navigate("/all-login")}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

