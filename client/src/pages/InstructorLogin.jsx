// InstructorLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import illustration from "../assets/InstructorLogin.png";
import "./InstructorLogin.css";

export default function InstructorLogin() {
  const navigate = useNavigate();
  
  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // error state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = () => {
    // reset errors
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!email.trim()) {
      setEmailError("Please enter your email");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter your password");
      valid = false;
    }

    if (valid) {
      navigate("/InstructorDash");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <img src={logo} alt="LearnEase" className="login-logo" />
          <h2 className="login-title">Instructor Login</h2>
          
          {/* email */}
          {emailError && <div className="error-text">{emailError}</div>}
          <label className="login-label">Enter your account details</label>
          <input
            type="text"
            placeholder="Enter your username or Email"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {/* password */}
          {passwordError && <div className="error-text">{passwordError}</div>}
          <label className="login-label">Enter your account details</label>
          <input
            type="password"
            placeholder="Enter Your Password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="login-button" onClick={handleLogin}>
            Login
          </button>

          <p className="login-footer">
            Don’t you have an account?{" "}
            <a href="/InstructorSignUp">Click here</a>
          </p>
        </div>

        <div className="login-right">
          <img
            src={illustration}
            alt="Instructor illustration"
            className="login-illustration"
          />
        </div>
      </div>
    </div>
  );
}
