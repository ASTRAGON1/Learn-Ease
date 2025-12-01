import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, reload } from 'firebase/auth';
import './InstructorSignUp2.css';

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('instructorSignupEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email in sessionStorage, check Firebase auth state
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.email) {
          setEmail(user.email);
          sessionStorage.setItem('instructorSignupEmail', user.email);
        } else {
          // No user found, redirect back to signup
          navigate('/InstructorSignUp1');
        }
      });
      return () => unsubscribe();
    }
  }, [navigate]);

  const handleConfirm = async () => {
    setGeneralError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setGeneralError('No user found. Please sign up again.');
        navigate('/InstructorSignUp1');
        return;
      }

      // Reload user to check if email is verified
      await reload(user);
      
      // Check if email is verified
      if (user.emailVerified) {
        // Email is verified, proceed to next step
        sessionStorage.removeItem('instructorSignupEmail');
        navigate('/InformationGathering1');
      } else {
        // Email not verified yet - the code might be for manual verification
        // For now, we'll check if they entered a valid code
        // In a real implementation, you might want to use Firebase's email verification link
        // or implement a custom verification code system
        setGeneralError('Email not verified. Please check your email and click the verification link.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setGeneralError('Session expired. Please sign up again.');
        navigate('/InstructorSignUp1');
      } else {
        setGeneralError(err.message || 'Verification failed. Please check your email and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Firebase doesn't have a resend verification code function
        // Instead, we can send the verification email again
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(user);
        alert('Verification email resent to your email address');
      }
    } catch (err) {
      console.error('Resend error:', err);
      alert('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="signupInst2-wrap">
      <div className="signupInst2-card">
        <Link to="/InstructorSignUp1" className="signupInst2-back">
          ‹ Go Back
        </Link>

        <h1 className="signupInst2-title">Confirm Your Email</h1>
        <p className="signupInst2-subtitle">
          A verification email has been sent to <strong>{email || 'your email'}</strong>. Please check your inbox and click the verification link to verify your account.
        </p>
        <p className="signupInst2-subtitle" style={{ fontSize: '14px', marginTop: '8px', color: '#666' }}>
          After clicking the verification link, click the button below to continue.
        </p>

        {generalError && (
          <div className="signupInst2-alert" role="alert">
            {generalError}
          </div>
        )}

        <div className="signupInst2-form">
          <button
            className="signupInst2-btn"
            onClick={handleConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? 'Checking…' : 'I\'ve Verified My Email'}
          </button>

          <p className="signupInst2-resend">
            Didn't receive the email?{' '}
            <button
              type="button"
              className="signupInst2-link"
              onClick={handleResendCode}
            >
              Resend verification email
            </button>
          </p>
        </div>

        <div className="signupInst2-foot">
          <span>Need help?</span>
          <Link to="/contact" className="signupInst2-link">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
