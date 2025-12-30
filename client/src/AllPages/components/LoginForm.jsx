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

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const LoginForm = ({
    formData,
    errors,
    serverError,
    loading,
    showPassword,
    onChange,
    onSubmit,
    onTogglePassword,
    onBlur
}) => {
    const navigate = useNavigate();

    return (
        <form className="all-login-form" onSubmit={onSubmit}>
            {serverError && (
                <div className="all-login-server-error" role="alert">
                    {serverError}
                </div>
            )}

            {/* Username Field */}
            <div className="all-login-form-field">
                <div className="all-login-input-wrapper">
                    <span className="all-login-input-icon">
                        <PersonIcon />
                    </span>
                    <input
                        type="text"
                        name="username"
                        className={`all-login-input ${errors.username ? "all-login-input-error" : ""}`}
                        placeholder="Enter your email or full name"
                        value={formData.username}
                        onChange={onChange}
                        onBlur={onBlur} // Use partial validation if desired
                        autoComplete="username"
                    />
                </div>
                {errors.username && <span className="all-login-error">{errors.username}</span>}
            </div>

            {/* Password Field */}
            <div className="all-login-form-field">
                <div className="all-login-input-wrapper">
                    <span className="all-login-input-icon">
                        <LockIcon />
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`all-login-input ${errors.password ? "all-login-input-error" : ""}`}
                        placeholder="Password"
                        value={formData.password}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                    <button
                        type="button"
                        className="all-login-eye-btn"
                        onClick={onTogglePassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                </div>
                {errors.password && <span className="all-login-error">{errors.password}</span>}
            </div>

            {/* Options: Forgot Password Only (Remember Me Deleted) */}
            <div className="all-login-options" style={{ justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    className="all-login-forgot-link"
                    onClick={() => navigate("/forgot-password")}
                >
                    Forgot Password?
                </button>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="all-login-signin-btn"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Log in"}
            </button>

            {/* Signup Link */}
            <div className="all-login-signup-link">
                <span>New user? </span>
                <button
                    type="button"
                    className="all-login-link-btn"
                    onClick={() => navigate("/all-signup")}
                >
                    Sign up
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
