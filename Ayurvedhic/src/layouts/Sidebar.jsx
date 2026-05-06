import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ayurLogo from "../assets/ayur_logo.png";
import "../styles/layouts/Sidebar.css";
import { logoutUser } from "../features/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Sidebar container */}
      <div className="sidebar-container">
        
        {/* Logo Section */}
        <div className="sidebar-logoSection">
          <img src={ayurLogo} alt="Anjaneyam Ayurvedic Hospital" className="sidebar-logoImage" />
        </div>

        {/* Menu */}
        <div className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <p>Dashboard</p>
          </NavLink>

          <NavLink to="/patient-register" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            <p>Register Patient</p>
          </NavLink>

          <NavLink to="/invoice" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <p>Create Invoice</p>
          </NavLink>

          <NavLink to="/treatments" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <p>View Treatments</p>
          </NavLink>
        </div>

        {/* Logout at the end */}
        <div className="sidebar-footer-menu">
          <button type="button" className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <p>Logout</p>
          </button>
        </div>

        {/* Sidebar Decoration */}
        <div className="sidebar-decoration"></div>
      </div>

      {/* Main Content wrapper */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
