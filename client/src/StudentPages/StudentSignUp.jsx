import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import illustration from "../assets/signUpStudent.png";

import "./StudentSignUp.css";

export default function StudentSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialNeed: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Student Data:", formData);
    // Add validation + API logic
  };

  return (
    <div className="student-signup-container">
      <div className="student-signup-box">
        <div className="student-left-panel">
          <img src={logo} alt="Logo" className="student-logo" />
          <h2 className="student-title">Create Account</h2>
          <form className="student-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name*"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="student-input"
            />
            <input
              type="email"
              placeholder="Email*"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="student-input"
            />
            <input
              type="password"
              placeholder="Password*"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="student-input"
            />
            <input
              type="password"
              placeholder="Confirm Password*"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="student-input"
            />
            <select
              name="specialNeed"
              value={formData.specialNeed}
              onChange={handleChange}
              className="student-input"
            >
              <option value="">Type of the special need*</option>
              <option value="autism">Autism</option>
              <option value="down-syndrome">Down Syndrome</option>
            </select>
            <div className="student-checkbox">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
              />
              <label>
                I agree to the{" "}
                <a href="#">Terms Of Services and privacy policy</a>
              </label>
            </div>
            <button type="submit" className="student-create-btn">
              Create
            </button>
            <div className="student-divider">Or</div>
            <button type="button" className="student-google-btn">
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" />
              Sign up with Google
            </button>
            <p className="student-login-link">
              Already a member? <a href="/login">Login</a>
            </p>
          </form>
        </div>
        <div className="student-right-panel">
          <img src={illustration} alt="Student visual" className="student-illustration" />
        </div>
      </div>
    </div>
  );
}