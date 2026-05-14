import React, { useState } from "react";
import "../styles/pages/DoctorRegister.css";

const DoctorRegister = () => {
  const [doctorName, setDoctorName] = useState("");
  const [doctors, setDoctors] = useState([
    { id: 1, name: "Dr. Sanal" },
    { id: 2, name: "Dr. Anjali" },
    { id: 3, name: "Dr. Krishna" },
    { id: 4, name: "Dr. Rajesh" },
    { id: 5, name: "Dr. Meera" },
    { id: 6, name: "Dr. Arjun" },
    { id: 7, name: "Dr. Kavitha" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (doctorName.trim()) {
      const newDoctor = {
        id: Date.now(),
        name: `Dr. ${doctorName.trim()}`,
      };
      setDoctors([newDoctor, ...doctors]);
      setDoctorName("");
    }
  };

  return (
    <div className="dr-container">
      <div className="dr-header">
        <h1 className="dr-title">Doctor Registration</h1>
        <p className="dr-subtitle">
          Add new specialists to the hospital network
        </p>
      </div>

      <div className="dr-layout">
        {/* Registration Form */}
        <div className="dr-form-card">
          <form onSubmit={handleSubmit} className="dr-form">
            <div className="dr-input-group">
              <label htmlFor="doctorName" className="dr-label">
                Doctor Name
              </label>
              <div className="dr-input-wrapper">
                <span className="dr-prefix">Dr.</span>
                <input
                  id="doctorName"
                  type="text"
                  placeholder="Enter doctor's name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="dr-input"
                  required
                />
              </div>
            </div>
            <div className="dr-btn-container">
              <button type="submit" className="dr-submit-btn">
                Register Doctor
              </button>
            </div>
          </form>

          <div className="dr-trust-section">
            <div className="dr-badge">
              <span className="dr-badge-icon">✓</span>
              <span className="dr-badge-text">Verified Profiles</span>
            </div>
            <div className="dr-badge">
              <span className="dr-badge-icon">✦</span>
              <span className="dr-badge-text">Premium Care</span>
            </div>
            <div className="dr-badge">
              <span className="dr-badge-icon">🛡</span>
              <span className="dr-badge-text">Secure Data</span>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="dr-list-card">
          <h2 className="dr-list-title">Registered Doctors</h2>
          <div className="dr-list-wrapper">
            {doctors.length > 0 ? (
              <div className="dr-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="dr-item">
                    <div className="dr-avatar">
                      {doctor.name.charAt(4).toUpperCase()}
                    </div>
                    <div className="dr-info">
                      <span className="dr-item-name">{doctor.name}</span>
                      <span className="dr-item-tag">Specialist</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty">No doctors registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
