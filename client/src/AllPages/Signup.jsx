import React from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import SignupForm from "./components/SignupForm";
import { useSignup } from "./hooks/useSignup";

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function Signup() {
  const navigate = useNavigate();
  const {
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    generalError,
    loading,
    showLoginPrompt,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit,
    validate
  } = useSignup();

  return (
    <div className="all-signup-wrap">
      <div className="all-signup-card">
        {/* Branding Section */}
        <div className="all-signup-brand-section">
          <div className="all-signup-brand-content">
            <div className="all-signup-logo">
              <div className="all-signup-logo-badge">LE</div>
              <span>LearnEase</span>
            </div>
            <h2 className="all-signup-brand-title">
              {formData.userType === "student" ? "Start Your Learning Journey" : "Share Your Knowledge"}
            </h2>
            <p className="all-signup-brand-subtitle">
              {formData.userType === "student"
                ? "Join thousands of students learning new skills every day"
                : "Empower learners around the world with your expertise"}
            </p>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="all-signup-form-section">
          <div className="all-signup-title-section">
            <button
              type="button"
              className="all-signup-back-btn"
              onClick={() => navigate("/")}
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="all-signup-page-title">
              {formData.userType === "student" ? "Student SignUp" : "Instructor SignUp"}
            </h1>
          </div>

          <SignupForm
            formData={formData}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            errors={errors}
            generalError={generalError}
            loading={loading}
            showLoginPrompt={showLoginPrompt}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onBlur={validate}
          />
        </div>
      </div>
    </div>
  );
}
