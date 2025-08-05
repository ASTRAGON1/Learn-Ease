// src/pages/InstructorLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import illustration from "../assets/InstructorLogin.png";
import "./InstructorLogin.css";

export default function InstructorLogin() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // field-specific errors
  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  // general login error (wrong creds, server down, etc)
  const [generalError, setGeneralError]   = useState("");
  // loading spinner state
  const [loading, setLoading]             = useState(false);

  // stub—your backend team will swap this out
  async function performLogin(email, password) {
    const res = await fetch("/api/instructor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res;
  }

  const handleLogin = async () => {
    // reset all errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    let valid = true;
    if (!email.trim()) {
      setEmailError("Please enter your email");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter your password");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const res = await performLogin(email, password);

      if (res.ok) {
        // success → go to dashboard
        navigate("/InstructorDash");
      } else if (res.status === 401) {
        // unauthorized
        setGeneralError("Incorrect email or password.");
      } else {
        // other server-side error
        setGeneralError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      // network or unexpected error
      console.error(err);
      setGeneralError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="login-back">‹ Back</Link>

        <div className="login-left">
          <img src={logo} alt="LearnEase" className="login-logo" />
          <h2 className="login-title">Instructor Login</h2>

          {/* general login error */}
          {generalError && (
            <div className="error-text">{generalError}</div>
          )}

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

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Checking…" : "Login"}
          </button>

          <p className="login-footer">
            Don’t you have an account?{" "}
            <a href="/InstructorSignUp1">Click here</a>
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
