import React from "react";
import { useNavigate } from "react-router-dom";

/* Icons */
const Eye = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeWidth="2" fill="none" stroke="currentColor" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor" />
    </svg>
);

const EyeOff = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
        <path d="M1 1l22 22" strokeWidth="2" fill="none" stroke="currentColor" />
        <path d="M3 7s4-5 9-5 9 5 9 5m-4.5 9.5C14.9 17.8 13.5 18 12 18 7 18 3 12 3 12a26 26 0 0 1 2.5-3.3" strokeWidth="2" fill="none" stroke="currentColor" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" stroke="currentColor" />
    </svg>
);

const PersonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const SignupForm = ({
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    generalError,
    loading,
    showLoginPrompt,
    setShowPassword,
    setShowConfirmPassword,
    onChange,
    onSubmit,
    onBlur
}) => {
    const navigate = useNavigate();

    return (
        <form className="all-signup-form" onSubmit={onSubmit}>
            {showLoginPrompt && (
                <div className="all-signup-notice-banner">
                    <div className="all-signup-notice-content">
                        <p>{generalError}</p>
                        <button
                            type="button"
                            className="all-signup-notice-btn"
                            onClick={() => navigate("/all-login")}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}

            {generalError && !showLoginPrompt && (
                <div className="all-signup-server-error" role="alert">
                    {generalError}
                </div>
            )}

            {/* User Type Selection */}
            <div className="all-signup-form-field">
                <label className="all-signup-field-label">Sign up as</label>
                <div className="all-signup-user-type-selection">
                    <label className={`all-signup-radio-option ${formData.userType === "student" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="userType"
                            value="student"
                            checked={formData.userType === "student"}
                            onChange={onChange}
                        />
                        <span>Student</span>
                    </label>
                    <label className={`all-signup-radio-option ${formData.userType === "instructor" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="userType"
                            value="instructor"
                            checked={formData.userType === "instructor"}
                            onChange={onChange}
                        />
                        <span>Instructor</span>
                    </label>
                </div>
            </div>

            {/* Full Name */}
            <div className="all-signup-form-field">
                <div className="all-signup-input-wrapper">
                    <span className="all-signup-input-icon"><PersonIcon /></span>
                    <input
                        type="text"
                        name="fullName"
                        className={`all-signup-input ${errors.fullName ? "all-signup-input-error" : ""}`}
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                </div>
                {errors.fullName && <span className="all-signup-error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="all-signup-form-field">
                <div className="all-signup-input-wrapper">
                    <span className="all-signup-input-icon"><EmailIcon /></span>
                    <input
                        type="email"
                        name="email"
                        className={`all-signup-input ${errors.email ? "all-signup-input-error" : ""}`}
                        placeholder="Email"
                        value={formData.email}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                </div>
                {errors.email && <span className="all-signup-error">{errors.email}</span>}
            </div>

            {/* Username (Student Only) */}
            {formData.userType === "student" && (
                <div className="all-signup-form-field">
                    <div className="all-signup-input-wrapper">
                        <span className="all-signup-input-icon"><PersonIcon /></span>
                        <input
                            type="text"
                            name="username"
                            className={`all-signup-input ${errors.username ? "all-signup-input-error" : ""}`}
                            placeholder="Username *"
                            value={formData.username}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </div>
                    {errors.username && <span className="all-signup-error">{errors.username}</span>}
                </div>
            )}

            {/* Password */}
            <div className="all-signup-form-field">
                <div className="all-signup-input-wrapper">
                    <span className="all-signup-input-icon"><LockIcon /></span>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`all-signup-input ${errors.password ? "all-signup-input-error" : ""}`}
                        placeholder="Password"
                        value={formData.password}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                    <button
                        type="button"
                        className="all-signup-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                </div>
                {errors.password && <span className="all-signup-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="all-signup-form-field">
                <div className="all-signup-input-wrapper">
                    <span className="all-signup-input-icon"><LockIcon /></span>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className={`all-signup-input ${errors.confirmPassword ? "all-signup-input-error" : ""}`}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                    <button
                        type="button"
                        className="all-signup-eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                </div>
                {errors.confirmPassword && <span className="all-signup-error">{errors.confirmPassword}</span>}
            </div>

            {/* Terms */}
            <div className="all-signup-form-field">
                <label className="all-signup-terms-label">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={onChange}
                    />
                    <span>
                        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </span>
                </label>
                {errors.agreeToTerms && <span className="all-signup-error">{errors.agreeToTerms}</span>}
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="all-signup-signup-btn"
                disabled={loading}
            >
                {loading ? "Creating account..." : "Sign up"}
            </button>

            {/* Login Link */}
            <div className="all-signup-login-link">
                <span>Already have an account? </span>
                <button
                    type="button"
                    className="all-signup-link-btn"
                    onClick={() => navigate("/all-login")}
                >
                    Sign in
                </button>
            </div>
        </form>
    );
};

export default SignupForm;
