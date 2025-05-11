import React from 'react';
import './login.css';
import illustration from '../assets/image.png';

const Login = () => {
  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-card-left">
          <div className="login-logo">Logo</div>
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Enter your account details</p>
          <form className="login-form">
            <input type="text" placeholder="Enter your username or Email" className="login-input" />
            <input type="password" placeholder="Enter Your Password" className="login-input" />
            <div className="login-options-row">
              <label className="remember-me">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a href="#" className="forgot-password">Forget password ?</a>
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
          <p className="register-link">
            Don't you have an account? <a href="#">Click here</a>
          </p>
        </div>
        <div className="login-card-right">
          <div className="welcome-text-block">
            <h1><span className="bold">Welcome to</span><br /><span className="portal">student portal</span></h1>
            <p className="access-text">Login to access your account</p>
          </div>
          <img src={illustration} alt="Student portal illustration" className="login-illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
