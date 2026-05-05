import React from "react";
import "../styles/Home.css";
import logo from "../assets/ayur_logo.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="home-navbar">
        <div className="home-nav-left">
          <img src={logo} alt="logo" className="home-logo" />
          
          <div>
            <h2 className="home-hospital-name">Anjaneyam</h2>
            <span className="home-tag">Ayurvedic Hospital</span>
          </div>
        </div>

        <button
          className="home-login-btn"
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="home-hero">
        
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Trusted Ayurvedic Care for Better Living
          </h1>
          <p className="home-hero-text">
            Manage hospital operations, staff activities, and patient workflows
            efficiently through our internal system.
          </p>

          <button className="home-hero-btn" onClick={()=>{
            navigate("/dashboard")
          }} >
            Access Dashboard
          </button>
        </div>
      </section>

      {/* SIMPLE INFO SECTION */}
      <section className="home-info">
        <div className="home-card">
          <h3>🌿 Natural Healing</h3>
          <p>Authentic Ayurvedic treatments with proven results.</p>
        </div>

        <div className="home-card">
          <h3>👩‍⚕️ Expert Doctors</h3>
          <p>Experienced professionals dedicated to patient care.</p>
        </div>

        <div className="home-card">
          <h3>⚙️ Smart Management</h3>
          <p>Streamlined internal system for hospital operations.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <h4>Contact Us</h4>
          <p>📞 +91 98765 43210</p>
          <p>📧 support@anjaneyam.com</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
