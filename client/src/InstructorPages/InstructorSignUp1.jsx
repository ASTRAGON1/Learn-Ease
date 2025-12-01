import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InstructorSignUp1.css";

/* Fake signup handler (replace with backend later) */
async function performSignUp({ fullName, email, password }) {
  await new Promise((r) => setTimeout(r, 800));
  if (email === "instructor@demo.com") {
    return { ok: false, status: 409 }; // already exists
  }
  return { ok: true };
}

export default function InstructorSignUp1() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Please enter your full name";
    if (!email.trim()) errs.email = "Please enter your email";
    if (!password) errs.password = "Please enter a password";
    if (password !== confirm) errs.confirm = "Passwords must match";
    if (!agree) errs.agree = "You must accept the Terms & Privacy";

    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setGeneralError("");
    setLoading(true);
    try {
      const res = await performSignUp({ fullName, email, password });
      if (res.ok) {
        navigate("/instructorSignUp2");
      } else if (res.status === 409) {
        setGeneralError("An account with that email already exists.");
      } else {
        setGeneralError("Sign up failed. Please try again.");
      }
    } catch {
      setGeneralError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="signupInst1-wrap">
      <div className="signupInst1-card">
        <button type="button" className="signupInst1-back" onClick={handleBack}>‹ Go Back</button>
        <h1 className="signupInst1-title">Create Instructor Account</h1>
        <p className="signupInst1-subtitle">Sign up to manage your courses and students.</p>

        {generalError && <div className="signupInst1-alert">{generalError}</div>}

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
