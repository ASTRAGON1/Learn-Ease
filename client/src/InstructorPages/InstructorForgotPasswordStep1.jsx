import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InstructorForgotPassword.css";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function InstructorForgotPasswordStep1() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Simulate sending verification code (replace with actual API call)
  const sendVerificationCode = async (email) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/teachers/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo: generate a 6-digit code
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('instructor_reset_code', demoCode);
      localStorage.setItem('instructor_reset_email', email);
      console.log('Demo verification code:', demoCode); // Remove in production
      
      return { success: true, code: demoCode };
    } catch (error) {
      return { success: false, error: 'Failed to send verification code' };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!isEmail(email)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }

    const result = await sendVerificationCode(email);
    if (result.success) {
      setMessage("Verification code sent to your email");
      setTimeout(() => {
        navigate(`/InstructorForgotPassword/verify-code?email=${encodeURIComponent(email)}`);
      }, 1000);
    } else {
      setErrors({ general: result.error || "Failed to send verification code" });
    }
  };

  return (
    <div className="instructorForgotPassword-wrap">
      <div className="instructorForgotPassword-card">
        <div className="instructorForgotPassword-header">
          <h1 className="instructorForgotPassword-title">Reset Password</h1>
          <p className="instructorForgotPassword-subtitle">
            Enter your email to receive a verification code
          </p>
        </div>

        {message && (
          <div className="instructorForgotPassword-success" role="alert">
            {message}
          </div>
        )}

        {errors.general && (
          <div className="instructorForgotPassword-alert" role="alert">
            {errors.general}
          </div>
        )}

        <form className="instructorForgotPassword-form" onSubmit={handleSubmit}>
          <div className="instructorForgotPassword-field">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              className={`instructorForgotPassword-input ${errors.email ? "instructorForgotPassword-invalid" : ""}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="instructor@demo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <small className="instructorForgotPassword-error">{errors.email}</small>
            )}
          </div>

          <button className="instructorForgotPassword-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="instructorForgotPassword-spinner" />
                <span>Sending...</span>
              </>
            ) : (
              "Send Verification Code"
            )}
          </button>
        </form>

        <button
          type="button"
          className="instructorForgotPassword-back-btn"
          onClick={() => navigate("/InstructorLogin")}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}

export default InstructorForgotPasswordStep1;

