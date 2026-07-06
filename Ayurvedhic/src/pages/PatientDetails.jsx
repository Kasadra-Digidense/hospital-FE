import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    deletePatient,
    editPatient,
    fetchPatients,
} from "../features/patientDetailsSlice";
import "../styles/pages/PatientDetails.css";

const normalizePatient = (patient) => ({
    ...patient,
    altPhone: patient?.altPhone ?? patient?.alt_phone ?? null,
    mrdNumber: patient?.mrdNumber ?? patient?.mrd_number ?? "",
    ipNumber: patient?.ipNumber ?? patient?.ip_number ?? "",
    registrationDate: patient?.registrationDate ?? patient?.registration_date ?? "",
    address: {
        houseName: patient?.address?.houseName ?? patient?.houseName ?? "",
        street: patient?.address?.street ?? patient?.street ?? "",
        city: patient?.address?.city ?? patient?.city ?? "",
        district: patient?.address?.district ?? patient?.district ?? "",
        state: patient?.address?.state ?? patient?.state ?? "",
        country: patient?.address?.country ?? patient?.country ?? "",
        pincode: patient?.address?.pincode ?? patient?.pincode ?? "",
    },
    medicalInfo: {
        allergies: patient?.medicalInfo?.allergies ?? "",
        chronicConditions: patient?.medicalInfo?.chronicConditions ?? "",
    },
    notes: patient?.notes ?? "",
    lastVisit: patient?.lastVisit ?? "",
});

const PatientDetails = () => {
    const dispatch = useDispatch();
    const {
        patients,
        patientsLoading,
        patientsError,
        editPatientLoading,
        editPatientError,
        deletePatientLoading,
        deletePatientError,
    } = useSelector((state) => state.patientDetails);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterSort, setFilterSort] = useState("newest");

    // Modals state
    const [viewModal, setViewModal] = useState({ isOpen: false, patient: null });
    const [editModal, setEditModal] = useState({ isOpen: false, patient: null });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        patient: null,
    });

    useEffect(() => {
        dispatch(fetchPatients());
    }, [dispatch]);

    const patientsWithDefaults = useMemo(
        () => patients.map(normalizePatient),
        [patients],
    );

    // â”€â”€ Handlers â”€â”€
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleViewClick = (patient) => {
        setViewModal({ isOpen: true, patient });
    };

    const handleEditClick = (patient) => {
        // Deep clone to avoid mutating state directly during edits
        setEditModal({ isOpen: true, patient: JSON.parse(JSON.stringify(patient)) });
    };

    const handleEditChange = (e, section) => {
        const { name, value } = e.target;
        if (section) {
            setEditModal((prev) => ({
                ...prev,
                patient: {
                    ...prev.patient,
                    [section]: {
                        ...prev.patient[section],
                        [name]: value,
                    },
                },
            }));
        } else {
            setEditModal((prev) => ({
                ...prev,
                patient: { ...prev.patient, [name]: value },
            }));
        }
    };

    const saveEdit = async () => {
        if (!editModal.patient?.id) return;

        const payload = {
            name: editModal.patient.name,
            gender: editModal.patient.gender,
            age: Number(editModal.patient.age) || 0,
            phone: editModal.patient.phone,
            altPhone: editModal.patient.altPhone || null,
            email: editModal.patient.email || null,
            place: editModal.patient.place || editModal.patient.address?.city || "",
            registrationDate: editModal.patient.registrationDate,
            address: {
                houseName: editModal.patient.address?.houseName || "",
                street: editModal.patient.address?.street || "",
                city: editModal.patient.address?.city || "",
                district: editModal.patient.address?.district || "",
                state: editModal.patient.address?.state || "",
                country: editModal.patient.address?.country || "",
                pincode: editModal.patient.address?.pincode || "",
            },
        };

        const result = await dispatch(
            editPatient({ id: editModal.patient.id, patientData: payload }),
        );

        if (editPatient.fulfilled.match(result)) {
            setEditModal({ isOpen: false, patient: null });
        }
    };

    const handleDeleteClick = (patient) => {
        setDeleteModal({ isOpen: true, patient });
    };

    const confirmDelete = async () => {
        if (!deleteModal.patient?.id) return;

        const result = await dispatch(deletePatient(deleteModal.patient.id));

        if (deletePatient.fulfilled.match(result)) {
            setDeleteModal({ isOpen: false, patient: null });
        }
    };

    // â”€â”€ Derived State â”€â”€
    let filteredPatients = patientsWithDefaults.filter(
        (p) =>
            (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.mrdNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.phone || "").includes(searchTerm),
    );

    if (filterSort === "name-asc") {
        filteredPatients.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterSort === "name-desc") {
        filteredPatients.sort((a, b) => b.name.localeCompare(a.name));
    }
    // "newest" sorting could rely on date parsing, using default list order here for dummy data

    return (
        <div className="patient-details-wrapper">
            <div className="patient-details-shell">
                {/* â”€â”€ Toolbar â”€â”€ */}
                <div className="patient-details-toolbar">
                    <div className="patient-details-page-info">
                        <span className="patient-details-kicker">Patient Management</span>
                        <h1 className="patient-details-page-title">Patient Directory</h1>
                        <p className="patient-details-page-sub">
                            View, edit, and manage all registered patients in the hospital system.
                        </p>
                    </div>

                    <div className="patient-details-controls">
                        <div className="patient-details-search">
                            <svg className="patient-details-search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                className="patient-details-search-input"
                                placeholder="Search by Name, MRD, or Phone..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        <select
                            className="patient-details-filter-select"
                            value={filterSort}
                            onChange={(e) => setFilterSort(e.target.value)}
                        >
                            <option value="newest">Sort by: Newest</option>
                            <option value="name-asc">Sort by: Name (A-Z)</option>
                            <option value="name-desc">Sort by: Name (Z-A)</option>
                        </select>

                        <Link to="/patient-register" className="patient-details-btn-primary">
                            <span>+</span> Add Patient
                        </Link>
                    </div>
                </div>

                {patientsLoading ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>?</div>
                        <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>Loading patients</h3>
                        <p style={{ margin: 0 }}>Please wait while patient records are being loaded.</p>
                    </div>
                ) : patientsError ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>?</div>
                        <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>Unable to load patients</h3>
                        <p style={{ margin: 0 }}>{patientsError}</p>
                    </div>
                ) : filteredPatients.length > 0 ? (
                    <div className="patient-details-grid">
                        {filteredPatients.map((patient) => (
                            <div key={patient.id} className="patient-details-card">
                                <div className="patient-details-card-header">
                                    <div className="patient-details-avatar">
                                        {patient.name?.charAt(0)}
                                    </div>
                                    <div className="patient-details-header-info">
                                        <h3 className="patient-details-name">{patient.name}</h3>
                                        <span className="patient-details-mrd">{patient.mrdNumber}</span>
                                    </div>
                                </div>

                                <div className="patient-details-card-body">
                                    <div className="patient-details-info-item">
                                        <span className="patient-details-label">Age / Gender</span>
                                        <span className="patient-details-value">
                                            {patient.age} yrs • {patient.gender}
                                        </span>
                                    </div>
                                    <div className="patient-details-info-item">
                                        <span className="patient-details-label">Mobile Number</span>
                                        <span className="patient-details-value">{patient.phone}</span>
                                    </div>
                                    {/* <div className="patient-details-info-item patient-details-info-item--full">
                    <span className="patient-details-label">Last Visit Date</span>
                    <span className="patient-details-value">{patient.lastVisit}</span>
                  </div> */}
                                </div>

                                <div className="patient-details-card-footer">
                                    <button
                                        className="patient-details-action-btn patient-details-action-btn--delete"
                                        onClick={() => handleDeleteClick(patient)}
                                        title="Delete Patient"
                                        disabled={deletePatientLoading}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="patient-details-action-btn patient-details-action-btn--edit"
                                        onClick={() => handleEditClick(patient)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="patient-details-action-btn patient-details-action-btn--view"
                                        onClick={() => handleViewClick(patient)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>??</div>
                        <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>No patients found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* â”€â”€ View Details Modal â”€â”€ */}
            {viewModal.isOpen && viewModal.patient && (
                <div className="patient-details-modal-overlay">
                    <div className="patient-details-modal patient-details-modal--large">
                        <div className="patient-details-modal-header">
                            <h2 className="patient-details-modal-title">Patient Profile</h2>
                            <button
                                className="patient-details-modal-close"
                                onClick={() => setViewModal({ isOpen: false, patient: null })}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="patient-details-modal-body">
                            {/* Basic Information */}
                            <div className="patient-details-section">
                                <h3 className="patient-details-section-title">Basic Information</h3>
                                <div className="patient-details-data-grid">
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">Full Name</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.name}
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">MRD Number / ID</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.mrdNumber}
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">Age</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.age} years
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">Gender</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.gender}
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group patient-details-data-group--full">
                                        <span className="patient-details-data-label">Registration Date</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.registrationDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Address Information */}
                            <div className="patient-details-section">
                                <h3 className="patient-details-section-title">
                                    Contact & Address Information
                                </h3>
                                <div className="patient-details-data-grid">
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">Mobile Number</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.phone}
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group">
                                        <span className="patient-details-data-label">Email Address</span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.email || "—"}
                                        </span>
                                    </div>
                                    <div className="patient-details-data-group patient-details-data-group--full">
                                        <span className="patient-details-data-label">
                                            Residential Address
                                        </span>
                                        <span className="patient-details-data-value">
                                            {viewModal.patient.address.houseName
                                                ? viewModal.patient.address.houseName + ", "
                                                : ""}
                                            {viewModal.patient.address.city}, {viewModal.patient.address.district}, <br />
                                            {viewModal.patient.address.state}, {viewModal.patient.address.country} - {viewModal.patient.address.pincode}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="patient-details-modal-footer">
                            <button
                                className="patient-details-btn-primary"
                                onClick={() => setViewModal({ isOpen: false, patient: null })}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* â”€â”€ Edit Patient Modal â”€â”€ */}
            {editModal.isOpen && editModal.patient && (
                <div className="patient-details-modal-overlay">
                    <div className="patient-details-modal patient-details-modal--large">
                        <div className="patient-details-modal-header">
                            <h2 className="patient-details-modal-title">Edit Patient Details</h2>
                            <button
                                className="patient-details-modal-close"
                                onClick={() => setEditModal({ isOpen: false, patient: null })}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="patient-details-modal-body">
                            {/* Basic Information */}
                            <div className="patient-details-section">
                                <h3 className="patient-details-section-title">Personal Information</h3>
                                <div className="patient-details-form-grid">
                                    <div className="patient-details-form-group patient-details-form-group--full">
                                        <label className="patient-details-label">Patient Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="patient-details-input"
                                            value={editModal.patient.name}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">Age (years) *</label>
                                        <input
                                            type="number"
                                            name="age"
                                            className="patient-details-input"
                                            value={editModal.patient.age}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">Gender *</label>
                                        <select
                                            name="gender"
                                            className="patient-details-input"
                                            value={editModal.patient.gender}
                                            onChange={handleEditChange}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">Mobile Number *</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            className="patient-details-input"
                                            value={editModal.patient.phone}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">
                                            Email Address (optional)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="patient-details-input"
                                            value={editModal.patient.email}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="patient-details-section">
                                <h3 className="patient-details-section-title">Address Information</h3>
                                <div className="patient-details-form-grid">
                                    <div className="patient-details-form-group patient-details-form-group--full">
                                        <label className="patient-details-label">
                                            House Name / Building Name
                                        </label>
                                        <input
                                            type="text"
                                            name="houseName"
                                            className="patient-details-input"
                                            value={editModal.patient.address.houseName}
                                            onChange={(e) => handleEditChange(e, "address")}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">Village / City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="patient-details-input"
                                            value={editModal.patient.address.city}
                                            onChange={(e) => handleEditChange(e, "address")}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">District *</label>
                                        <input
                                            type="text"
                                            name="district"
                                            className="patient-details-input"
                                            value={editModal.patient.address.district}
                                            onChange={(e) => handleEditChange(e, "address")}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="patient-details-input"
                                            value={editModal.patient.address.state}
                                            onChange={(e) => handleEditChange(e, "address")}
                                        />
                                    </div>
                                    <div className="patient-details-form-group">
                                        <label className="patient-details-label">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className="patient-details-input"
                                            value={editModal.patient.address.pincode}
                                            onChange={(e) => handleEditChange(e, "address")}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="patient-details-modal-footer">
                            <button
                                className="patient-details-action-btn patient-details-action-btn--edit"
                                onClick={() => setEditModal({ isOpen: false, patient: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="patient-details-btn-primary"
                                onClick={saveEdit}
                                disabled={editPatientLoading}
                            >
                                {editPatientLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                        {editPatientError && (
                            <p className="no-print" style={{ color: "#b91c1c", padding: "0 24px 20px", margin: 0 }}>
                                {editPatientError}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* â”€â”€ Delete Confirmation Modal â”€â”€ */}
            {deleteModal.isOpen && deleteModal.patient && (
                <div className="patient-details-modal-overlay">
                    <div className="patient-details-modal patient-details-modal--small">
                        <div className="patient-details-modal-icon">!</div>
                        <h3 className="patient-details-modal-title">Delete Patient Record?</h3>
                        <p className="patient-details-modal-desc">
                            Are you sure you want to delete the record for{" "}
                            <strong>{deleteModal.patient.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="patient-details-modal-actions">
                            <button
                                className="patient-details-action-btn patient-details-action-btn--edit"
                                onClick={() => setDeleteModal({ isOpen: false, patient: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="patient-details-btn-primary"
                                style={{ background: "var(--error, #DC2626)", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)" }}
                                onClick={confirmDelete}
                                disabled={deletePatientLoading}
                            >
                                {deletePatientLoading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                        {deletePatientError && (
                            <p className="no-print" style={{ color: "#b91c1c", padding: "12px 0 0", margin: 0, textAlign: "center" }}>
                                {deletePatientError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetails;



