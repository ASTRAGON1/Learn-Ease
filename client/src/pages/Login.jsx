import React, { useState, useEffect } from 'react';
import './login.css';
import icon from "../assets/icon.png";
import LoginStudent from "../assets/LoginStudent.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      // This is where your backend friend will add the API call
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-title">Login</div>
        <div className="login-input-frame">
          <p className="login-label">Enter your username or Email</p>
        </div>
        <div className="login-input-frame">
          <div className="login-label">Enter Your Password</div>
        </div>
        <div className="login-btn-frame">
          <div className="login-btn-text">Login</div>
        </div>
        <img className="login-icon" alt="Icon" src={icon} />
        <div className="login-remember">Remember me</div>
        <div className="login-forgot">Forget password ?</div>
        <p className="login-no-account">
          <span className="login-no-account-span">Don't you have an account?</span>
          <span className="login-no-account-space">&nbsp;</span>
        </p>
        <p className="login-click-here">
          <span className="login-click-here-span">Click here</span>
          <span className="login-no-account-space">&nbsp;</span>
        </p>
        <div className="login-logo">Logo</div>
        <div className="login-subtitle">Enter your account details</div>
        <img className="login-image" alt="Login visual" src={loginStudent} />
      </div>
    </div>
  );
};

export default Login;
