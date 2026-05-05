// src/pages/PatientRegister.jsx

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/pages/PatientRegister.css";

const PatientRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    place: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👉 For now just console (later connect API)
    console.log("Patient Data:", formData);

    alert("Patient Registered Successfully!");

    // Reset form
    setFormData({
      name: "",
      phone: "",
      place: "",
    });
  };

  return (
    <div className="patient-page">
      <div className="patient-card">
        <h2 className="title">Patient Registration</h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control custom-input"
              placeholder="Enter patient name"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control custom-input"
              placeholder="Enter phone number"
              pattern="[0-9]{10}"
              required
            />
          </div>

          {/* Place */}
          <div className="mb-3">
            <label className="form-label">Place</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="form-control custom-input"
              placeholder="Enter place"
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn register-btn w-100">
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegister;

