import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/DashBoard.css';

const DashBoard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome to Anjaneyam Ayurvedic Hospital</p>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-cards-wrapper">
          
          {/* Register Patient Card */}
          <div className="dashboard-card dashboard-card-green">
            <div className="dashboard-card-icon-wrapper dashboard-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="22" y1="11" x2="16" y2="11"></line>
              </svg>
            </div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title dashboard-text-green">Create Patients</h3>
              <p className="dashboard-card-desc">Add new patient details to the system</p>
              <button className="dashboard-btn dashboard-btn-green" onClick={()=>navigate("/patient-register")}>
                Register Now
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dashboard-btn-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>

          {/* Create Invoice Card */}
          <div className="dashboard-card dashboard-card-orange">
            <div className="dashboard-card-icon-wrapper dashboard-icon-orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title dashboard-text-orange">Create Invoice</h3>
              <p className="dashboard-card-desc">Generate invoice for patient treatment</p>
              <button
                className="dashboard-btn dashboard-btn-orange"
                onClick={() => navigate('/invoice')}
              >
                Create Invoice
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dashboard-btn-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>

          {/* View Treatment Details Card */}
          {/* <div className="dashboard-card dashboard-card-green">
            <div className="dashboard-card-icon-wrapper dashboard-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title dashboard-text-green">View Treatment Details</h3>
              <p className="dashboard-card-desc">View and manage all treatment records</p>
              <button className="dashboard-btn dashboard-btn-green">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dashboard-btn-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default DashBoard;
