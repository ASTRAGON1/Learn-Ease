import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./signupStudent.css";
import signUpStudent from "../assets/signUpStudent.png";

const SignupStudent = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialNeed: '',
    agreeTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="signup-card">
      {/* Left Side: Image */}
      <div className="signup-card-left">
        <img src={signUpStudent} alt="Sign Up Visual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Right Side: Form */}
      <div className="signup-card-right">
        <div className="signup-logo">Logo</div>
        <div className="signup-title">Create Account</div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-input-group">
            <input
              className="signup-input"
              type="text"
              name="fullName"
              placeholder="Full Name*"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <input
              className="signup-input"
              type="email"
              name="email"
              placeholder="Email*"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <input
              className="signup-input"
              type="password"
              name="password"
              placeholder="Password*"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <input
              className="signup-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password*"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <select
              className="signup-select"
              name="specialNeed"
              value={formData.specialNeed}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Type of the special need*</option>
              <option value="down-syndrome">Down Syndrome</option>
              <option value="autism">Autism</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="signup-checkbox-row">
            <input
              className="signup-checkbox"
              type="checkbox"
              id="terms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              required
            />
            <label className="signup-checkbox-label" htmlFor="terms">
              I agree to the <a href="#">Terms Of Services</a> and <a href="#">privacy policy</a>
            </label>
          </div>
          <button className="signup-btn" type="submit">Create</button>
          <div className="signup-divider" />
          <button className="signup-google-btn" type="button">
            <img className="signup-google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
            Sign up with Google
          </button>
          <div className="signup-bottom-link">
            Already a member? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStudent;
