import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import { sendEmailVerification, onAuthStateChanged, reload } from "firebase/auth";
import "./EmailVerification.css";

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("student");
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    // Get email and userType from location state or Firebase
    const stateEmail = location.state?.email;
    const stateUserType = location.state?.userType || "student";
    
    if (stateEmail) {
      setEmail(stateEmail);
      setUserType(stateUserType);
    } else if (auth.currentUser) {
      setEmail(auth.currentUser.email || "");
      setIsVerified(auth.currentUser.emailVerified);
    }

    // Listen for auth state changes to check verification status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || "");
        setIsVerified(user.emailVerified);
        
        // If verified, reload user to get latest status
        if (user.emailVerified) {
          reload(user).catch(console.error);
        }
      } else {
        // No user signed in - but for students, they might not have Firebase
        // Only redirect if we don't have email from state
        if (!stateEmail) {
          navigate("/all-signup");
        }
      }
    });

    // Check verification status periodically (only for Firebase users)
    const checkInterval = setInterval(() => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        reload(auth.currentUser)
          .then(() => {
            if (auth.currentUser?.emailVerified) {
              setIsVerified(true);
            }
          })
          .catch(console.error);
      }
    }, 3000); // Check every 3 seconds

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setResendError("No Firebase user found. If you're a student, please check your email or contact support.");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const verificationUrl = window.location.origin + '/verify-email';
      
      await sendEmailVerification(auth.currentUser, {
        url: verificationUrl,
        handleCodeInApp: false
      });
      
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendError(error.message || "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    if (userType === "instructor") {
      // For instructors, go to information gathering or dashboard
      navigate("/InformationGathering-1");
    } else {
      // For students, check if they have a temp token in sessionStorage
      const tempToken = sessionStorage.getItem("tempToken");
      if (tempToken) {
        // Move temp data to permanent storage
        sessionStorage.setItem("token", tempToken);
        sessionStorage.setItem("role", sessionStorage.getItem("tempRole") || "student");
        sessionStorage.setItem("userId", sessionStorage.getItem("tempUserId") || "");
        sessionStorage.setItem("userName", sessionStorage.getItem("tempUserName") || "");
        sessionStorage.setItem("userEmail", sessionStorage.getItem("tempUserEmail") || email);
        
        // Clean up temp data
        sessionStorage.removeItem("tempToken");
        sessionStorage.removeItem("tempRole");
        sessionStorage.removeItem("tempUserId");
        sessionStorage.removeItem("tempUserName");
        sessionStorage.removeItem("tempUserEmail");
        
        navigate("/student-dashboard-2");
      } else {
        navigate("/all-login");
      }
    }
  };

  if (isVerified) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card verified">
          <div className="email-verification-icon verified-icon">
            <CheckIcon />
          </div>
          <h1 className="email-verification-title">Email Verified!</h1>
          <p className="email-verification-message">
            Your email address has been successfully verified. You can now continue to your dashboard.
          </p>
          <button 
            className="email-verification-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="email-verification-icon">
          <EmailIcon />
        </div>
        <h1 className="email-verification-title">Verify Your Email</h1>
        <p className="email-verification-message">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        <p className="email-verification-instructions">
          Please check your email and click on the verification link to activate your account. 
          The link will expire in 1 hour.
        </p>
        
        {resendSuccess && (
          <div className="email-verification-success">
            Verification email sent successfully! Please check your inbox.
          </div>
        )}
        
        {resendError && (
          <div className="email-verification-error">
            {resendError}
          </div>
        )}

        <div className="email-verification-actions">
          <button 
            className="email-verification-button secondary"
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
          <button 
            className="email-verification-button link"
            onClick={() => navigate("/all-login")}
          >
            Back to Login
          </button>
        </div>

        <div className="email-verification-note">
          <p>Didn't receive the email?</p>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try resending</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

