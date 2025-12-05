import React, { useState, useEffect } from 'react';
import './login.css';
import LoginStudent from "../assets/LoginStudent.png";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Loads saved credentials from localStorage when component mounts
   * If credentials exist, automatically fills the form and checks remember me
   */
  useEffect(() => {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      setFormData(prev => ({
        ...prev,
        username,
        password,
        rememberMe: true
      }));
    }
  }, []);

  /**
   * Handles changes in form inputs
   * Updates form state and clears any existing errors for the changed field
   * @param {Event} e - The change event from the input
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validates the form inputs
   * Checks if username and password are not empty
   * @returns {boolean} - Returns true if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * Validates form, makes API call, and manages remember me functionality
   * @param {Event} e - The submit event from the form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // This is where your backend friend will add the API callz
      // Example:
      // const response = await axios.post('/api/auth/login', formData);
      // if (response.data.success) {
      //   // Handle successful login
      // }

      // Handle remember me functionality
      if (formData.rememberMe) {
        localStorage.setItem('savedCredentials', JSON.stringify({
          username: formData.username,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('savedCredentials');
      }

      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-card-left">
          <button className="back-home-btn" onClick={() => navigate('/')}>← Back to Home</button>
          <div className="login-logo">Logo</div>
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Enter your account details</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username or Email"
                className={`login-input ${errors.username ? 'error' : ''}`}
              />
              <span className="error-message">{errors.username || '\u00A0'}</span>
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Your Password"
                className={`login-input ${errors.password ? 'error' : ''}`}
              />
              <span className="error-message">{errors.password || '\u00A0'}</span>
            </div>
            <div className="login-options-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                /> Remember me
              </label>
              <a href="#" className="forgot-password">Forget password ?</a>
            </div>
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="register-link">
            Don't you have an account?{" "}
            <button
              type="button"
              className="register-link-btn"
              onClick={() => navigate("/signup")}
            >
              Click here
            </button>
          </p>
        </div>
        <div className="login-card-right">
          <img src={LoginStudent} alt="Student portal illustration" className="login-illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
