import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import "./InstructorSignUp1.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InstructorSignUp1() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const navigate = useNavigate();

  // Sign out any unverified Firebase users on component mount
  useEffect(() => {
    const checkAndSignOut = async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth);
      }
    };
    checkAndSignOut();
  }, []);

  const handleSignUp = async () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Please enter your full name";
    if (!email.trim()) errs.email = "Please enter your email";
    if (!password) errs.password = "Please enter a password";
    if (password !== confirm) errs.confirm = "Passwords must match";
    if (!agree) errs.agree = "You must accept the Terms & Privacy";

    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setGeneralError("");
    setShowLoginPrompt(false);
    setLoading(true);

    try {
      let firebaseUser;
      let firebaseUID;

      try {
        // Try to create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        firebaseUID = firebaseUser.uid;
      } catch (createError) {
        if (createError.code === 'auth/email-already-in-use') {
          // Email already exists in Firebase
          try {
            // Try to sign in to check if account is verified
            const signInCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = signInCredential.user;
            firebaseUID = firebaseUser.uid;

            if (firebaseUser.emailVerified) {
              setGeneralError("This account is already registered and verified. Would you like to go to the login page?");
              setShowLoginPrompt(true);
              await signOut(auth);
              return;
            }
          } catch (signInError) {
            if (signInError.code === 'auth/wrong-password') {
              setGeneralError("An account with this email already exists, but the password is incorrect. Would you like to go to the login page?");
              setShowLoginPrompt(true);
            } else {
              setGeneralError("An account with this email already exists. Would you like to go to the login page?");
              setShowLoginPrompt(true);
            }
            return;
          }
        } else {
          throw createError;
        }
      }

      // Send email verification
      if (!firebaseUser.emailVerified) {
        try {
          await sendEmailVerification(firebaseUser, {
            url: window.location.origin + '/InstructorSignUp2',
            handleCodeInApp: false
          });
          console.log('Verification email sent successfully');
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          // Continue anyway - user can resend from Step 2
        }
      }

      // Create user in MongoDB
      const response = await fetch(`${API_URL}/api/teachers/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email, password, firebaseUID }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text to see what we got
        const text = await response.text();
        console.error('Non-JSON response:', text);
        await signOut(auth);
        
        if (response.status === 404) {
          setGeneralError("Server endpoint not found. Please check if the server is running.");
        } else if (response.status >= 500) {
          setGeneralError("Server error. Please try again later.");
        } else {
          setGeneralError("Sign up failed. Please check your connection and try again.");
        }
        return;
      }

      if (!response.ok) {
        if (response.status === 409) {
          // User already exists in MongoDB, but Firebase account was created
          // Sign out and show error
          await signOut(auth);
          setGeneralError("An account with this email already exists. Would you like to go to the login page?");
          setShowLoginPrompt(true);
          return;
        } else {
          // If MongoDB registration fails, delete Firebase user
          await signOut(auth);
          setGeneralError(data.error || "Sign up failed. Please try again.");
          return;
        }
      }

      // Success - navigate to verification page
      sessionStorage.setItem('instructorSignupEmail', email);
      navigate("/instructorSignUp2");
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/weak-password') {
        setGeneralError("Password is too weak. Please use a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        setGeneralError("Invalid email address. Please check your email.");
      } else {
        setGeneralError(error.message || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="signupInst1-wrap">
      {showLoginPrompt && (
        <div className="signupInst1-notice-banner">
          <div className="signupInst1-notice-content">
            <p>{generalError}</p>
            <button
              type="button"
              className="signupInst1-notice-btn"
              onClick={() => navigate("/InstructorLogin")}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
      <div className="signupInst1-card">
        <button type="button" className="signupInst1-back" onClick={handleBack}>‹ Go Back</button>
        <h1 className="signupInst1-title">Create Instructor Account</h1>
        <p className="signupInst1-subtitle">Sign up to manage your courses and students.</p>

        {generalError && !showLoginPrompt && <div className="signupInst1-alert">{generalError}</div>}

        <div className="signupInst1-form">
          <div className="signupInst1-field">
            <label>Full Name</label>
            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} />
            {errors.fullName && <small className="signupInst1-error">{errors.fullName}</small>}
          </div>

          <div className="signupInst1-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            {errors.email && <small className="signupInst1-error">{errors.email}</small>}
          </div>

          <div className="signupInst1-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {errors.password && <small className="signupInst1-error">{errors.password}</small>}
          </div>

          <div className="signupInst1-field">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
            {errors.confirm && <small className="signupInst1-error">{errors.confirm}</small>}
          </div>

          <label className="signupInst1-terms">
            <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
            <span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></span>
          </label>
          {errors.agree && <small className="signupInst1-error">{errors.agree}</small>}

          <button
            className="signupInst1-btn"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>

          <button 
            className="signupInst1-google" 
            type="button"
            disabled={loading}
          >
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google"
            />
            Sign up with Google
          </button>
        </div>

        <div className="signupInst1-foot">
          <span>Already have an account?</span>
          <button
            type="button"
            className="signupInst1-link-btn"
            onClick={() => navigate("/InstructorLogin")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
