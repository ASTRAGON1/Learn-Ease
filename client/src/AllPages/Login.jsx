import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import LoginForm from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    serverError,
    loading,
    showPassword,
    handleChange,
    togglePassword,
    handleSubmit,
    validate
  } = useLogin();

  return (
    <div className="all-login-wrap">
      <div className="all-login-card">
        {/* Branding Section */}
        <div className="all-login-brand-section">
          <div className="all-login-brand-content">
            <div className="all-login-logo">
              <div className="all-login-logo-badge">LE</div>
              <span>LearnEase</span>
            </div>
            <h2 className="all-login-brand-title">Welcome Back</h2>
            <p className="all-login-brand-subtitle">Sign in to continue your learning journey</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="all-login-form-section">
          <div className="all-login-title-section">
            <button
              type="button"
              className="all-login-back-btn"
              onClick={() => navigate("/")}
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="all-login-page-title">Login</h1>
          </div>

          <LoginForm
            formData={formData}
            errors={errors}
            serverError={serverError}
            loading={loading}
            showPassword={showPassword}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onTogglePassword={togglePassword}
            onBlur={validate}
          />
        </div>
      </div>
    </div>
  );
}
