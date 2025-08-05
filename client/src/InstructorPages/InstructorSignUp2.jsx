// src/pages/InstructorSignUp2.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import illustration from '../assets/InstructorLogin.png';
import './InstructorSignUp2.css';

// Stub – replace with your real API call
async function performConfirm(code) {
  const res = await fetch('/api/instructor/confirm-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return res;
}

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [code, setCode]             = useState('');
  const [error, setError]           = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading]       = useState(false);

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
        navigate('/InstructorDash');
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
    <div className="signup-page-2">
      <div className="signup-container-2">

        {/* ← LEFT PANEL: image */}
        <div className="signup-left-2">
          <img
            src={illustration}
            alt="Illustration"
            className="signup-illustration-2"
          />
        </div>

        {/* → RIGHT PANEL: form */}
        <div className="signup-right-2">
          <Link to="/InstructorSignUp1" className="go-back-2">
            Back
          </Link>

          <h2 className="signup-title-2">Confirm Your Email</h2>
          <p className="signup-subtitle-2">
            A 6-digit code is sent to your email
          </p>

          {generalError && (
            <div className="signup-error-text-2">{generalError}</div>
          )}
          {error && <div className="signup-error-text-2">{error}</div>}

          <input
            type="text"
            placeholder="__ __ __ __ __ __"
            className="signup-input-2"
            value={code}
            maxLength={6}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(val);
              setError('');
              setGeneralError('');
            }}
          />

          <button
            className="signup-button-2"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirming…' : 'Confirm'}
          </button>

          <p className="signup-resend-2">
            Didn’t receive it yet?{' '}
            <Link to="/InstructorSignUp2" className="resend-link-2">
              Send again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
