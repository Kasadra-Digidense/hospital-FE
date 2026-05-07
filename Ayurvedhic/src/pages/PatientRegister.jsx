// src/pages/PatientRegister.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/pages/PatientRegister.css";
import {
  clearPatientError,
  createPatient,
  fetchPatients,
} from "../features/patientSlice";

// ── helpers ───────────────────────────────────────────────────────────────────

// const CONSULTANT_DOCTORS = [
//   { id: "D001", name: "Dr. Anil Kumar — Ayurveda General" },
//   { id: "D002", name: "Dr. Meera Nair — Panchakarma" },
//   { id: "D003", name: "Dr. Suresh Menon — Ortho & Spine" },
//   { id: "D004", name: "Dr. Priya Pillai — Women's Health" },
//   { id: "D005", name: "Dr. Rajesh Varma — Skin & Cosmetology" },
// ];

const generateMRD = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MRD-${yy}${mm}-${rand}`;
};

const getTodayDate = () => {
  const now = new Date();
  return now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── initial form ──────────────────────────────────────────────────────────────

const buildInitialForm = () => ({
  // Section 1 — Personal
  name: "",
  gender: "",
  age: "",
  phone: "",
  altPhone: "",
  email: "",
  // Section 2 — Address
  houseName: "",
  street: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pincode: "",
  // Section 3 — Hospital
  mrdNumber: generateMRD(),
  registrationDate: getTodayDate(),
  consultantDoctor: "",
});

// ── component ─────────────────────────────────────────────────────────────────

const PatientRegister = () => {
  const dispatch = useDispatch();
  const { patients, fetchStatus, createStatus, error } = useSelector(
    (state) => state.patients
  );

  const [formData, setFormData] = useState(buildInitialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // fetch existing patients on mount
  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchPatients());
  }, [dispatch, fetchStatus]);

  // clear redux error on unmount
  useEffect(() => {
    return () => dispatch(clearPatientError());
  }, [dispatch]);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) dispatch(clearPatientError());
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Patient name is required.";
    if (!formData.gender) newErrors.gender = "Please select a gender.";
    if (!formData.age || isNaN(formData.age) || formData.age < 0 || formData.age > 120)
      newErrors.age = "Enter a valid age (0–120).";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number.";
    if (formData.altPhone && !/^\d{10}$/.test(formData.altPhone))
      newErrors.altPhone = "Enter a valid 10-digit number.";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address.";
    if (!formData.city.trim()) newErrors.city = "Village / City is required.";
    if (!formData.district.trim()) newErrors.district = "District is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode.";
    // if (!formData.consultantDoctor)
    //   newErrors.consultantDoctor = "Please select a consultant doctor.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // scroll to first error
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`pr-field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone,
      place: formData.city.trim(),
      gender: formData.gender,
      age: Number(formData.age),
      altPhone: formData.altPhone || null,
      email: formData.email || null,
      address: {
        houseName: formData.houseName,
        street: formData.street,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      },
      mrdNumber: formData.mrdNumber,
      registrationDate: formData.registrationDate,
      // consultantDoctor: formData.consultantDoctor,
    };

    const result = await dispatch(createPatient(payload));
    if (createPatient.fulfilled.match(result)) {
      dispatch(fetchPatients());
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData(buildInitialForm());
    setErrors({});
    setSubmitted(false);
    dispatch(clearPatientError());
  };

  // ── success screen ───────────────────────────────────────────────────────────

  if (submitted) {
    // const doctorObj = CONSULTANT_DOCTORS.find(
    //   (d) => d.id === formData.consultantDoctor
    // );
    return (
      <div className="pr-wrapper">
        <div className="pr-success-card">
          <div className="pr-success-icon">✓</div>
          <h2 className="pr-success-title">Patient Registered!</h2>
          <p className="pr-success-sub">
            The patient has been successfully added to the hospital system.
          </p>
          <div className="pr-success-details">
            <div className="pr-success-row">
              <span className="pr-success-label">Patient Name</span>
              <span className="pr-success-value">{formData.name}</span>
            </div>
            <div className="pr-success-row">
              <span className="pr-success-label">MRD Number</span>
              <span className="pr-success-value pr-success-mrd">{formData.mrdNumber}</span>
            </div>
            <div className="pr-success-row">
              <span className="pr-success-label">Registration Date</span>
              <span className="pr-success-value">{formData.registrationDate}</span>
            </div>
            {/* {doctorObj && (
              <div className="pr-success-row">
                <span className="pr-success-label">Consultant</span>
                <span className="pr-success-value">{doctorObj.name}</span>
              </div>
            )} */}
          </div>
          <button className="pr-btn-primary" onClick={handleReset}>
            Register Another Patient
          </button>
        </div>
      </div>
    );
  }

  // ── form ─────────────────────────────────────────────────────────────────────

  return (
    <div className="pr-wrapper">
      <div className="pr-shell">

        {/* ── Page Header ── */}
        <div className="pr-page-header">
          <div className="pr-page-header-left">
            <span className="pr-kicker">Front Desk</span>
            <h1 className="pr-page-title">Patient Registration</h1>
            <p className="pr-page-sub">
              Register a new patient with Anjaneyam Ayurvedic Hospital.
            </p>
          </div>
        </div>

        {/* ── API Error Banner ── */}
        {error && (
          <div className="pr-error-banner">
            <span className="pr-error-banner-icon">⚠</span>
            {error}
          </div>
        )}

        {/* ── Form ── */}
        <form className="pr-form" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1 — Personal Information ── */}
          <div className="pr-section">
            <div className="pr-section-head">
              <div className="pr-section-num">1</div>
              <div>
                <h2 className="pr-section-title">Personal Information</h2>
                <p className="pr-section-desc">Basic details of the patient.</p>
              </div>
            </div>

            <div className="pr-fields">

              {/* Full Name */}
              <div className="pr-field pr-field--full" id="pr-field-name">
                <label className="pr-label" htmlFor="pr-name">
                  Patient Full Name <span className="pr-req">*</span>
                </label>
                <input
                  id="pr-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pr-input${errors.name ? " pr-input--error" : ""}`}
                  placeholder="e.g. Ramesh Kumar Nair"
                />
                {errors.name && <span className="pr-field-error">{errors.name}</span>}
              </div>

              {/* Gender */}
              <div className="pr-field" id="pr-field-gender">
                <label className="pr-label">
                  Gender <span className="pr-req">*</span>
                </label>
                <div className="pr-gender-group">
                  {["Male", "Female", "Other"].map((g) => (
                    <label
                      key={g}
                      className={`pr-gender-pill${formData.gender === g ? " pr-gender-pill--active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                      />
                      <span>{g === "Male" ? "♂" : g === "Female" ? "♀" : "⚧"} {g}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <span className="pr-field-error">{errors.gender}</span>}
              </div>

              {/* Age */}
              <div className="pr-field" id="pr-field-age">
                <label className="pr-label" htmlFor="pr-age">
                  Age (years) <span className="pr-req">*</span>
                </label>
                <input
                  id="pr-age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`pr-input${errors.age ? " pr-input--error" : ""}`}
                  placeholder="e.g. 35"
                  min="0"
                  max="120"
                />
                {errors.age && <span className="pr-field-error">{errors.age}</span>}
              </div>

              {/* Mobile */}
              <div className="pr-field" id="pr-field-phone">
                <label className="pr-label" htmlFor="pr-phone">
                  Mobile Number <span className="pr-req">*</span>
                </label>
                <div className="pr-input-prefix-wrap">
                  <span className="pr-input-prefix">+91</span>
                  <input
                    id="pr-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pr-input pr-input--prefixed${errors.phone ? " pr-input--error" : ""}`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
                {errors.phone && <span className="pr-field-error">{errors.phone}</span>}
              </div>

              {/* Alternate Mobile */}
              <div className="pr-field" id="pr-field-altPhone">
                <label className="pr-label" htmlFor="pr-alt-phone">
                  Alternate Mobile
                  <span className="pr-optional"> (optional)</span>
                </label>
                <div className="pr-input-prefix-wrap">
                  <span className="pr-input-prefix">+91</span>
                  <input
                    id="pr-alt-phone"
                    type="tel"
                    name="altPhone"
                    value={formData.altPhone}
                    onChange={handleChange}
                    className={`pr-input pr-input--prefixed${errors.altPhone ? " pr-input--error" : ""}`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
                {errors.altPhone && (
                  <span className="pr-field-error">{errors.altPhone}</span>
                )}
              </div>

              {/* Email */}
              <div className="pr-field" id="pr-field-email">
                <label className="pr-label" htmlFor="pr-email">
                  Email Address
                  <span className="pr-optional"> (optional)</span>
                </label>
                <input
                  id="pr-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pr-input${errors.email ? " pr-input--error" : ""}`}
                  placeholder="patient@example.com"
                />
                {errors.email && <span className="pr-field-error">{errors.email}</span>}
              </div>

            </div>
          </div>

          {/* ── Section 2 — Address ── */}
          <div className="pr-section">
            <div className="pr-section-head">
              <div className="pr-section-num">2</div>
              <div>
                <h2 className="pr-section-title">Address Information</h2>
                <p className="pr-section-desc">Patient's residential address.</p>
              </div>
            </div>

            <div className="pr-fields">

              {/* House Name */}
              <div className="pr-field pr-field--full" id="pr-field-houseName">
                <label className="pr-label" htmlFor="pr-house">
                  House Name / Building Name
                </label>
                <input
                  id="pr-house"
                  type="text"
                  name="houseName"
                  value={formData.houseName}
                  onChange={handleChange}
                  className="pr-input"
                  placeholder="e.g. Krishna Bhavanam"
                />
              </div>

              {/* Street */}
              <div className="pr-field pr-field--full" id="pr-field-street">
                <label className="pr-label" htmlFor="pr-street">
                  Street / Area
                </label>
                <input
                  id="pr-street"
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="pr-input"
                  placeholder="e.g. MG Road, Near Bus Stand"
                />
              </div>

              {/* City */}
              <div className="pr-field" id="pr-field-city">
                <label className="pr-label" htmlFor="pr-city">
                  Village / City <span className="pr-req">*</span>
                </label>
                <input
                  id="pr-city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`pr-input${errors.city ? " pr-input--error" : ""}`}
                  placeholder="e.g. Thrissur"
                />
                {errors.city && <span className="pr-field-error">{errors.city}</span>}
              </div>

              {/* District */}
              <div className="pr-field" id="pr-field-district">
                <label className="pr-label" htmlFor="pr-district">
                  District <span className="pr-req">*</span>
                </label>
                <input
                  id="pr-district"
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`pr-input${errors.district ? " pr-input--error" : ""}`}
                  placeholder="e.g. Thrissur"
                />
                {errors.district && (
                  <span className="pr-field-error">{errors.district}</span>
                )}
              </div>

              {/* State */}
              <div className="pr-field" id="pr-field-state">
                <label className="pr-label" htmlFor="pr-state">
                  State <span className="pr-req">*</span>
                </label>
                <input
                  id="pr-state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`pr-input${errors.state ? " pr-input--error" : ""}`}
                  placeholder="e.g. Kerala"
                />
                {errors.state && <span className="pr-field-error">{errors.state}</span>}
              </div>

              {/* Country */}
              <div className="pr-field" id="pr-field-country">
                <label className="pr-label" htmlFor="pr-country">
                  Country
                </label>
                <input
                  id="pr-country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="pr-input"
                  placeholder="e.g. India"
                />
              </div>

              {/* Pincode */}
              <div className="pr-field" id="pr-field-pincode">
                <label className="pr-label" htmlFor="pr-pincode">
                  Pincode
                </label>
                <input
                  id="pr-pincode"
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`pr-input${errors.pincode ? " pr-input--error" : ""}`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && (
                  <span className="pr-field-error">{errors.pincode}</span>
                )}
              </div>

            </div>
          </div>

          {/* ── Section 3 — Hospital Details ── */}
          <div className="pr-section">
            <div className="pr-section-head">
              <div className="pr-section-num">3</div>
              <div>
                <h2 className="pr-section-title">Hospital Details</h2>
                <p className="pr-section-desc">Auto-generated hospital records.</p>
              </div>
            </div>

            <div className="pr-fields">

              {/* MRD Number */}
              <div className="pr-field" id="pr-field-mrdNumber">
                <label className="pr-label">MRD Number</label>
                <div className="pr-auto-field">
                  <span className="pr-auto-badge">Auto</span>
                  <span className="pr-auto-value">{formData.mrdNumber}</span>
                </div>
              </div>

              {/* Registration Date */}
              <div className="pr-field" id="pr-field-registrationDate">
                <label className="pr-label">Registration Date</label>
                <div className="pr-auto-field">
                  <span className="pr-auto-badge">Auto</span>
                  <span className="pr-auto-value">{formData.registrationDate}</span>
                </div>
              </div>

              {/* Consultant Doctor */}
              {/* <div className="pr-field pr-field--full" id="pr-field-consultantDoctor">
                <label className="pr-label" htmlFor="pr-doctor">
                  Consultant Doctor <span className="pr-req">*</span>
                </label>
                <select
                  id="pr-doctor"
                  name="consultantDoctor"
                  value={formData.consultantDoctor}
                  onChange={handleChange}
                  className={`pr-select${errors.consultantDoctor ? " pr-input--error" : ""}`}
                >
                  <option value="">— Select a Doctor —</option>
                  {CONSULTANT_DOCTORS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.consultantDoctor && (
                  <span className="pr-field-error">{errors.consultantDoctor}</span>
                )}
              </div> */}

            </div>
          </div>

          {/* ── Actions ── */}
          <div className="pr-actions">
            <button
              type="button"
              className="pr-btn-ghost"
              onClick={handleReset}
              disabled={createStatus === "loading"}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="pr-btn-primary"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading" ? (
                <><span className="pr-spinner" />Registering…</>
              ) : (
                "Register Patient"
              )}
            </button>
          </div>

        </form>




      </div>
    </div>
  );
};

export default PatientRegister;
