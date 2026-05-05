import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/ayur_logo.png";
import "../styles/pages/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <button
          type="button"
          className="login-close-btn"
          onClick={() => {
            navigate("/");
          }}
          aria-label="Close login page"
        >
          X
        </button>

        <div className="login-form-card">
          <Link to="/" className="login-brand">
            <img src={logo} alt="Anjaneyam Ayurvedic Hospital" className="login-brand-logo" />
            <div>
              <h1 className="login-brand-title">Anjaneyam</h1>
              <p className="login-brand-subtitle">Ayurvedic Hospital</p>
            </div>
          </Link>

          <div className="login-form-header">
            <p className="login-form-kicker">Staff Login</p>
            <h2>Welcome back</h2>
            <span>Sign in to access the hospital dashboard.</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Email Address</span>
              <input type="email" placeholder="doctor@anjaneyam.com" required />
            </label>

            <label className="login-field">
              <span>Password</span>
              <input type="password" placeholder="Enter your password" required />
            </label>

            <div className="login-form-row">
              <label className="login-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="login-text-btn">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit-btn">
              Login
            </button>
          </form>

          <div className="login-footer-links">
            <Link to="/" className="login-secondary-link">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
