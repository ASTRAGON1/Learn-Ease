import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./InstructorForgotPassword.css";

// Icons
const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none" stroke="currentColor"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor"/>
  </svg>
);

const EyeOff = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
    <path d="M1 1l22 22" strokeWidth="2" fill="none" stroke="currentColor"/>
    <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none" stroke="currentColor"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor"/>
  </svg>
);

function InstructorForgotPasswordStep3() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !code) {
      navigate("/InstructorForgotPassword");
    }
  }, [email, code, navigate]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Reset password via API
  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/teachers/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, code })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to reset password' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (!newPassword) {
      setErrors({ newPassword: "Password is required" });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const result = await resetPassword(email, newPassword);
    if (result.success) {
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/InstructorLogin");
      }, 2000);
    } else {
      setErrors({ general: result.error || "Failed to reset password" });
    }
  };

  return (
    <div className="instructorForgotPassword-wrap">
      <div className="instructorForgotPassword-card">
        <div className="instructorForgotPassword-header">
          <h1 className="instructorForgotPassword-title">Reset Password</h1>
          <p className="instructorForgotPassword-subtitle">
            Enter your new password
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
            <label htmlFor="new-password">New Password</label>
            <div className={`instructorForgotPassword-input-group ${errors.newPassword ? "instructorForgotPassword-invalid" : ""}`}>
              <input
                id="new-password"
                className="instructorForgotPassword-input"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                className="instructorForgotPassword-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.newPassword && (
              <small className="instructorForgotPassword-error">{errors.newPassword}</small>
            )}
          </div>

          <div className="instructorForgotPassword-field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className={`instructorForgotPassword-input-group ${errors.confirmPassword ? "instructorForgotPassword-invalid" : ""}`}>
              <input
                id="confirm-password"
                className="instructorForgotPassword-input"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                className="instructorForgotPassword-eye"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <small className="instructorForgotPassword-error">{errors.confirmPassword}</small>
            )}
          </div>

          <button className="instructorForgotPassword-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="instructorForgotPassword-spinner" />
                <span>Resetting...</span>
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <button
          type="button"
          className="instructorForgotPassword-back-btn"
          onClick={() => navigate(`/InstructorForgotPassword/verify-code?email=${encodeURIComponent(email)}`)}
        >
          ← Back to code verification
        </button>
      </div>
    </div>
  );
}

export default InstructorForgotPasswordStep3;

