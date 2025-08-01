import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo                from "../assets/logo.png";
import illustration        from "../assets/InstructorLogin.png";
import "./InstructorSignUp1.css";

export default function InstructorSignUp1() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [errors, setErrors]     = useState({});

  const SignUp = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Please enter your full name";
    if (!email.trim())    errs.email    = "Please enter your email";
    if (!password)        errs.password = "Please enter a password";
    if (password !== confirm)
                          errs.confirm  = "Passwords must match";
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      // TODO: send verification code
      navigate("/instructorSignUp2");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <Link to="/" className="go-back">
            ‹ Go Back
          </Link>
          <img src={logo} alt="LearnEase" className="signup-logo" />
          
          <h2 className="signup-title">Create Account</h2>

          {errors.fullName && (
            <div className="signup-error-text">{errors.fullName}</div>
          )}
          <input
            type="text"
            placeholder="Full Name*"
            className="signup-input"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          {errors.email && (
            <div className="signup-error-text">{errors.email}</div>
          )}
          <input
            type="email"
            placeholder="Email*"
            className="signup-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {errors.password && (
            <div className="signup-error-text">{errors.password}</div>
          )}
          <input
            type="password"
            placeholder="Password*"
            className="signup-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {errors.confirm && (
            <div className="signup-error-text">{errors.confirm}</div>
          )}
          <input
            type="password"
            placeholder="Confirm Password*"
            className="signup-input"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />

          <label className="signup-checkbox">
            <input type="checkbox" />
            I agree to the Terms Of Services and privacy policy
          </label>

          <button className="signup-button" onClick={SignUp}>
            Create
          </button>

          <div className="signup-or"><span>Or</span></div>

          <button className="signup-google">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="signup-google-icon"
            />
            Sign up with Google
          </button>

          <p className="signup-footer">
            Already a member? <a href="/InstructorLogin">Login</a>
          </p>
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