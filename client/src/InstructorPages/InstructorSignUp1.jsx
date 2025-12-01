import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut } from "firebase/auth";
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

  // Sign out any existing Firebase user when component mounts or when user navigates back
  useEffect(() => {
    const checkAndSignOut = async () => {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        // If user exists but email not verified, sign them out to allow retry
        try {
          await signOut(auth);
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }
    };
    checkAndSignOut();
  }, []);

  const handleSignUp = async () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Please enter your full name";
    if (!email.trim()) errs.email = "Please enter your email";
    if (!password) errs.password = "Please enter a password";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
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

      // Step 1: Try to create user in Firebase or sign in if already exists
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        firebaseUID = firebaseUser.uid;
      } catch (createError) {
        // If email already exists, try to sign in
        if (createError.code === 'auth/email-already-in-use') {
          try {
            // Sign in with the existing account
            const signInCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = signInCredential.user;
            firebaseUID = firebaseUser.uid;

            // Check if email is verified
            if (firebaseUser.emailVerified) {
              setGeneralError("This account is already registered and verified.");
              setShowLoginPrompt(true);
              await signOut(auth);
              return;
            }

            // Email not verified, continue with verification flow
          } catch (signInError) {
            if (signInError.code === 'auth/wrong-password') {
              setGeneralError("This account is already registered, but the password is incorrect.");
              setShowLoginPrompt(true);
            } else if (signInError.code === 'auth/user-not-found') {
              // This shouldn't happen if email-already-in-use was true, but handle it
              setGeneralError("Account creation failed. Please try again.");
            } else {
              setGeneralError("This account is already registered.");
              setShowLoginPrompt(true);
            }
            return;
          }
        } else {
          // Other Firebase errors
          throw createError;
        }
      }

      // Step 2: Send email verification (if not already verified)
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
      }

      // Step 3: Create user in MongoDB via backend (only if doesn't exist)
      const response = await fetch(`${API_URL}/api/teachers/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email,
          password, // Backend will hash it
          firebaseUID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If MongoDB creation fails
        if (response.status === 409) {
          // Check if Firebase user was just created (new signup attempt)
          // or if it already existed (returning user)
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.emailVerified) {
            // Firebase user exists but not verified, MongoDB record exists
            // This means account is already registered - show login prompt
            setGeneralError("This account is already registered.");
            setShowLoginPrompt(true);
            await signOut(auth);
            return;
          }
          // User already exists in MongoDB, that's okay - just continue to verification
          // This can happen if Firebase user was created but MongoDB record exists
          console.log('User already exists in MongoDB, continuing with verification');
        } else {
          // Other errors - only delete Firebase user if we just created it
          // (not if it already existed)
          try {
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid === firebaseUID) {
              // Check if this user was just created (not verified and no MongoDB record)
              // We'll keep the Firebase user and let them try again
            }
          } catch (deleteError) {
            console.error('Error handling Firebase user:', deleteError);
          }
          
          setGeneralError(data.error || "Sign up failed. Please try again.");
          return;
        }
      }

      // Success - navigate to email verification page
      // Store email in sessionStorage for verification step
      sessionStorage.setItem('instructorSignupEmail', email);
      navigate("/instructorSignUp2");
    } catch (error) {
      console.error('Signup error:', error);
      // Handle any unhandled Firebase errors that weren't caught in inner try-catch
      if (error.code === 'auth/weak-password') {
        setGeneralError("Password is too weak. Please use a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        setGeneralError("Invalid email address. Please check your email.");
      } else if (error.code === 'auth/network-request-failed') {
        setGeneralError("Network error. Please check your connection and try again.");
      } else if (!error.code) {
        // Non-Firebase errors (network, etc.)
        setGeneralError(error.message || "Sign up failed. Please try again.");
      } else {
        // Other Firebase errors
        setGeneralError(error.message || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleGoogleSignUp = async () => {
    // Check if user agreed to terms
    if (!agree) {
      setGeneralError("You must accept the Terms of Service and Privacy Policy to continue.");
      setErrors({ agree: "You must accept the Terms & Privacy" });
      return;
    }

    setGeneralError("");
    setShowLoginPrompt(false);
    setErrors({});
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const firebaseUID = firebaseUser.uid;
      const email = firebaseUser.email;
      const displayName = firebaseUser.displayName || email; // Use email as fallback if no display name

      // Create user in MongoDB via backend
      const response = await fetch(`${API_URL}/api/teachers/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: displayName.trim(),
          email,
          password: 'google-signup', // Placeholder, backend will handle this
          firebaseUID,
          profilePic: firebaseUser.photoURL || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If MongoDB creation fails, sign out from Firebase
        try {
          await auth.signOut();
        } catch (signOutError) {
          console.error('Failed to sign out:', signOutError);
        }
        
        if (response.status === 409) {
          setGeneralError("This account is already registered.");
          setShowLoginPrompt(true);
        } else {
          setGeneralError(data.error || "Sign up failed. Please try again.");
        }
        return;
      }

      // Google signup doesn't require email verification
      // Navigate directly to information gathering
      navigate("/InformationGathering1");
    } catch (error) {
      console.error('Google signup error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setGeneralError("Sign up cancelled.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setGeneralError("An account with this email already exists. Please use email/password login.");
      } else {
        setGeneralError(error.message || "Google sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signupInst1-wrap">
      {generalError && showLoginPrompt && (
        <div className="signupInst1-notice">
          <div className="signupInst1-notice-content">
            <div className="signupInst1-notice-message">
              <strong>{generalError}</strong>
              <span style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>
                Would you like to go to the login page?
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/InstructorLogin")}
              className="signupInst1-notice-btn"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
      
      {generalError && !showLoginPrompt && (
        <div className="signupInst1-alert" style={{ marginBottom: '16px' }}>
          {generalError}
        </div>
      )}

      <div className="signupInst1-card">
        <button type="button" className="signupInst1-back" onClick={handleBack}>‹ Go Back</button>
        <h1 className="signupInst1-title">Create Instructor Account</h1>
        <p className="signupInst1-subtitle">Sign up to manage your courses and students.</p>

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
            onClick={handleGoogleSignUp}
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
