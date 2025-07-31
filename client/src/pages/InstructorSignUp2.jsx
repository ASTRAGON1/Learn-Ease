import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import illustration from "../assets/InstructorLogin.png";
import "./InstructorSignUp2.css";

export default function InstructorSignUp2() {
  const navigate = useNavigate();
  const [code, setCode]   = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }
    // TODO: verify code via your API
    navigate("/InstructorLogin");
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <h2 className="signup-title">Confirm Your Email</h2>

          {error && (
            <div className="signup-error-text">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="signup-input"
            value={code}
            onChange={e => {
              setError("");
              setCode(e.target.value);
            }}
          />

          <button
            className="signup-button"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>

        <div className="signup-right">
          <img
            src={illustration}
            alt="Illustration"
            className="signup-illustration"
          />
        </div>
      </div>
    </div>
  );
}
