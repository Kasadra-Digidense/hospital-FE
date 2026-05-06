import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch, useSelector } from "react-redux";
import "../styles/pages/PatientRegister.css";
import {
  clearPatientError,
  createPatient,
  fetchPatients,
} from "../features/patientSlice";

const PatientRegister = () => {
  const dispatch = useDispatch();
  const { patients, fetchStatus, createStatus, error } = useSelector((state) => state.patients);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    place: "",
  });

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchPatients());
    }
  }, [dispatch, fetchStatus]);

  useEffect(() => {
    return () => {
      dispatch(clearPatientError());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (error) {
      dispatch(clearPatientError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const resultAction = await dispatch(createPatient(formData));

    if (createPatient.fulfilled.match(resultAction)) {
      setFormData({
        name: "",
        phone: "",
        place: "",
      });
      dispatch(fetchPatients());
    }
  };

  return (
    <div className="patient-page">
      <div className="patient-shell">
        <div className="patient-hero">
          <div>
            <p className="patient-kicker">Front Desk</p>
            <h1 className="patient-title">Patient Registration</h1>
            <p className="patient-subtitle">
              Add new patients to the hospital system and review recently registered records.
            </p>
          </div>
        </div>

        <div className="patient-grid">
          <section className="patient-card patient-form-card">
            <div className="patient-section-header">
              <h2>New Patient</h2>
              <span>Fill in the basic details below.</span>
            </div>

            <form className="patient-form" onSubmit={handleSubmit}>
              <div className="patient-field">
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

              <div className="patient-field">
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

              <div className="patient-field">
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

              <button
                type="submit"
                className="register-btn"
                disabled={createStatus === "loading"}
              >
                {createStatus === "loading" ? "Registering..." : "Register Patient"}
              </button>
            </form>
          </section>

          <section className="patient-card patient-list-card">
            <div className="patient-list-header">
              <div>
                <h3>Registered Patients</h3>
                <p>Latest patient records from the hospital database.</p>
              </div>
              <button
                type="button"
                className="patient-refresh-btn"
                onClick={() => dispatch(fetchPatients())}
                disabled={fetchStatus === "loading"}
              >
                {fetchStatus === "loading" ? "Loading..." : "Refresh"}
              </button>
            </div>

            {error ? <span className="patient-status-text">{error}</span> : null}

            {patients.length === 0 && fetchStatus === "succeeded" ? (
              <p className="patient-empty-state">No patients found.</p>
            ) : null}

            <div className="patient-list">
              {patients.map((patient) => (
                <div
                  className="patient-record-card"
                  key={patient.id ?? `${patient.phone}-${patient.name}`}
                >
                  <div className="patient-record-top">
                    <h4>{patient.name}</h4>
                    <span className="patient-record-badge">Patient</span>
                  </div>
                  <p>Phone: {patient.phone}</p>
                  <p>Place: {patient.place}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
