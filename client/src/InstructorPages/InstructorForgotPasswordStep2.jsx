import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./InstructorForgotPassword.css";

function InstructorForgotPasswordStep2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/InstructorForgotPassword");
    }
  }, [email, navigate]);

  // Verify code
  const verifyCode = async (email, code) => {
    const storedCode = localStorage.getItem('instructor_reset_code');
    const storedEmail = localStorage.getItem('instructor_reset_email');
    
    if (storedEmail === email && storedCode === code) {
      return { success: true };
    }
    return { success: false, error: 'Invalid verification code' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (!code) {
      setErrors({ code: "Verification code is required" });
      return;
    }
    if (code.length !== 6) {
      setErrors({ code: "Code must be 6 digits" });
      return;
    }

    const result = await verifyCode(email, code);
    if (result.success) {
      setMessage("Code verified successfully");
      setTimeout(() => {
        navigate(`/InstructorForgotPassword/new-password?email=${encodeURIComponent(email)}&code=${code}`);
      }, 1000);
    } else {
      setErrors({ general: result.error || "Invalid verification code" });
    }
  };

  return (
    <div className="instructorForgotPassword-wrap">
      <div className="instructorForgotPassword-card">
        <div className="instructorForgotPassword-header">
          <h1 className="instructorForgotPassword-title">Reset Password</h1>
          <p className="instructorForgotPassword-subtitle">
            Enter the 6-digit code sent to your email
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
            <label htmlFor="reset-code">Verification Code</label>
            <input
              id="reset-code"
              className={`instructorForgotPassword-input ${errors.code ? "instructorForgotPassword-invalid" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px", fontWeight: "600" }}
              aria-invalid={!!errors.code}
            />
            {errors.code && (
              <small className="instructorForgotPassword-error">{errors.code}</small>
            )}
            <p className="instructorForgotPassword-hint">
              Check your email for the 6-digit code
            </p>
          </div>

          <button className="instructorForgotPassword-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="instructorForgotPassword-spinner" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <button
          type="button"
          className="instructorForgotPassword-back-btn"
          onClick={() => navigate("/InstructorForgotPassword")}
        >
          ← Back to email
        </button>
      </div>
    </div>
  );
}

export default InstructorForgotPasswordStep2;

