import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import illustration from '../assets/InstructorLogin.png';
import './InstructorSignUp2.css';

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }
    navigate('/InstructorDash');
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

          {error && <div className="signup-error-text-2">{error}</div>}

          <input
            type="text"
            placeholder="__ __ __ __ __ __"
            className="signup-input-2"
            value={code}
            maxLength={6}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setError('');
              setCode(val);
              if (val.length === 6) {
                handleConfirm();
              }
            }}
          />

          <button className="signup-button-2" onClick={handleConfirm}>
            Confirm
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
