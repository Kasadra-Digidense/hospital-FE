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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

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
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((currentState) => !currentState)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.85 2.96-5.06 5.46-6.41" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3 3 0 0 0 12 15a2.97 2.97 0 0 0 2.12-.88" />
                      <path d="M14.47 14.47 9.53 9.53" />
                      <path d="M20.54 14.12A12.58 12.58 0 0 0 23 12c-1.73-4.89-6-8-11-8-1.31 0-2.57.21-3.76.6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.06 12C3.79 7.11 8.06 4 13.06 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8Z" />
                      <circle cx="13.06" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? <p className="login-error-message">{error}</p> : null}

            {/* <div className="login-form-row">
              <label className="login-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="login-text-btn">
                Forgot password?
              </button>
            </div> */}

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
