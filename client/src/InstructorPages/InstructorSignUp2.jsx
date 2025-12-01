import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InstructorSignUp2.css';

// Stub – replace with your real API call
async function performConfirm(code) {
  await new Promise((r) => setTimeout(r, 800));
  if (code.length < 6) {
    return { ok: false, status: 400 };
  }
  return { ok: true };
}

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!code.trim() || code.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setGeneralError('');
    setLoading(true);

    try {
      const res = await performConfirm(code);

      if (res.ok) {
        navigate('/InformationGathering1');
      } else if (res.status === 400) {
        setGeneralError('Invalid verification code.');
      } else {
        setGeneralError('Confirmation failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setGeneralError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
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
          A 6-digit code has been sent to your email address. Please enter it below to verify your account.
        </p>

        {(generalError || error) && (
          <div className="signupInst2-alert" role="alert">
            {generalError || error}
          </div>
        )}

        <div className="signupInst2-form">
          <div className="signupInst2-field">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              placeholder="Enter code"
              className="signupInst2-input"
              value={code}
              maxLength={6}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(val);
                setError('');
                setGeneralError('');
              }}
              style={{
                textAlign: 'center',
                letterSpacing: '8px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            />
            <small className="signupInst2-hint">Enter the 6-digit code sent to your email</small>
          </div>

          <button
            className="signupInst2-btn"
            onClick={handleConfirm}
            disabled={loading || code.length < 6}
            type="button"
          >
            {loading ? 'Confirming…' : 'Confirm'}
          </button>

          <p className="signupInst2-resend">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="signupInst2-link"
              onClick={() => {
                // Resend logic here
                alert('Verification code resent to your email');
              }}
            >
              Resend code
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
