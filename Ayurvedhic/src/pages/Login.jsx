import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/ayur_logo.png";
import "../styles/pages/Login.css";
import { clearAuthError, loginUser } from "../features/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/dashboard", { replace: true });
    }
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
              <span>Username</span>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="login-error-message">{error}</p> : null}

            <div className="login-form-row">
              <label className="login-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="login-text-btn">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit-btn" disabled={status === "loading"}>
              {status === "loading" ? "Logging in..." : "Login"}
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
