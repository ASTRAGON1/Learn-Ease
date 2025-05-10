import React from 'react';
import './Login.css';
import logo from '../assets/image.png'; // Replace with the actual logo file path

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>Login</h2>
        <p>Enter your account details</p>
        <form className="login-form">
          <input type="text" placeholder="Enter your username or Email" />
          <input type="password" placeholder="Enter Your Password" />
          <div className="login-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot password?</a>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p>
          Don't you have an account? <a href="/register">Click here</a>
        </p>
      </div>
      <div className="login-right">
        <div className="illustration"></div>
      </div>
    </div>
  );
};

export default Login;
