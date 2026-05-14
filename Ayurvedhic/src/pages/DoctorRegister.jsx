import React, { useEffect, useState } from "react";
import "../styles/pages/DoctorRegister.css";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDoctor,
  fetchDoctors,
  registerDoctor,
  updateDoctor,
} from "../features/doctorSlice";

const getDoctorName = (doctor) =>
  doctor?.doctor_name ?? doctor?.doctorName ?? doctor?.name ?? "";

const capitalizeFirstLetter = (value) => {
  const text = value.trimStart();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

const formatDoctorName = (doctor) => {
  const name = getDoctorName(doctor);
  const withoutPrefix = name.replace(/^Dr\.?\s*/i, "").trim();
  return withoutPrefix ? `Dr. ${capitalizeFirstLetter(withoutPrefix)}` : "";
};

const getDoctorInitial = (doctor) => {
  const name = formatDoctorName(doctor).replace(/^Dr\.?\s*/i, "").trim();
  return name.charAt(0).toUpperCase() || "D";
};

const getEditableDoctorName = (doctor) =>
  getDoctorName(doctor).replace(/^Dr\.?\s*/i, "").trim();

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const DoctorRegister = () => {
  const dispatch = useDispatch();

  const {
    doctors,
    loading,
    error,
    fetchLoading,
    fetchError,
    updatingId,
    deletingId,
    updateError,
    deleteError,
  } = useSelector((state) => state.doctor);

  const [doctorName, setDoctorName] = useState("");
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingDoctorName, setEditingDoctorName] = useState("");
  const [doctorNameError, setDoctorNameError] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedName = capitalizeFirstLetter(doctorName);

    if (!formattedName) {
      setDoctorNameError("Doctor name is required.");
      return;
    }

    const doctorData = {
      doctor_name: `Dr. ${formattedName}`,
    };

    try {
      await dispatch(registerDoctor(doctorData)).unwrap();

      setDoctorName("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditStart = (doctor) => {
    setEditingDoctorId(doctor.id);
    setEditingDoctorName(capitalizeFirstLetter(getEditableDoctorName(doctor)));
    setEditNameError("");
  };

  const handleEditCancel = () => {
    setEditingDoctorId(null);
    setEditingDoctorName("");
    setEditNameError("");
  };

  const handleEditSave = async (doctor) => {
    const formattedName = capitalizeFirstLetter(editingDoctorName);
    if (!doctor.id) return;

    if (!formattedName) {
      setEditNameError("Doctor name is required.");
      return;
    }

    try {
      await dispatch(
        updateDoctor({
          id: doctor.id,
          doctorData: { doctor_name: formattedName },
        })
      ).unwrap();
      handleEditCancel();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteRequest = (doctor) => {
    if (doctor.id) {
      setDoctorToDelete(doctor);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete?.id) return;
    try {
      await dispatch(deleteDoctor(doctorToDelete.id)).unwrap();
      if (editingDoctorId === doctorToDelete.id) {
        handleEditCancel();
      }
      setDoctorToDelete(null);
    } catch (err) {
      console.log(err);
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
              <div
                className={`dr-input-wrapper${doctorNameError ? " dr-input-wrapper--error" : ""}`}
              >
                <span className="dr-prefix">Dr.</span>
                <input
                  id="doctorName"
                  type="text"
                  placeholder="Enter doctor's name"
                  value={doctorName}
                  onChange={(e) => {
                    setDoctorName(capitalizeFirstLetter(e.target.value));
                    if (doctorNameError) setDoctorNameError("");
                  }}
                  onBlur={() =>
                    setDoctorName(capitalizeFirstLetter(doctorName))
                  }
                  className={`dr-input${doctorNameError ? " dr-input--error" : ""}`}
                  required
                />
              </div>
              {doctorNameError && (
                <span className="dr-field-error">{doctorNameError}</span>
              )}
            </div>
            <div className="dr-btn-container">
              <button
                type="submit"
                className="dr-submit-btn"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Doctor"}
              </button>
            </div>
            {error && <span className="dr-field-error">{error}</span>}
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
            {/* <div className="dr-badge">
              <span className="dr-badge-icon">🛡</span>
              <span className="dr-badge-text">Secure Data</span>
            </div> */}
          </div>
        </div>

        {/* Doctors List */}
        <div className="dr-list-card">
          <h2 className="dr-list-title">Registered Doctors</h2>
          <div className="dr-list-wrapper">
            {fetchLoading ? (
              <p className="dr-empty">Loading doctors...</p>
            ) : fetchError ? (
              <p className="dr-empty dr-error">{fetchError}</p>
            ) : doctors.length > 0 ? (
              <div className="dr-grid">
                {doctors.map((doctor) => {
                  const isEditing = editingDoctorId === doctor.id;
                  const isUpdating =
                    String(updatingId) === String(doctor.id);
                  const isDeleting =
                    String(deletingId) === String(doctor.id);

                  return (
                    <div
                      key={doctor.id ?? getDoctorName(doctor)}
                      className={`dr-item${isEditing ? " dr-item--editing" : ""}`}
                    >
                      <div className="dr-avatar">
                        {getDoctorInitial(doctor)}
                      </div>
                      <div className="dr-info">
                        {isEditing ? (
                          <>
                            <input
                              className={`dr-edit-input${editNameError ? " dr-edit-input--error" : ""}`}
                              value={editingDoctorName}
                              onChange={(e) => {
                                setEditingDoctorName(
                                  capitalizeFirstLetter(e.target.value)
                                );
                                if (editNameError) setEditNameError("");
                              }}
                              onBlur={() =>
                                setEditingDoctorName(
                                  capitalizeFirstLetter(editingDoctorName)
                                )
                              }
                              autoFocus
                            />
                            {editNameError && (
                              <span className="dr-field-error">
                                {editNameError}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="dr-item-name">
                              {formatDoctorName(doctor)}
                            </span>
                            <span className="dr-item-tag">Specialist</span>
                          </>
                        )}
                      </div>
                      <div className="dr-item-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="dr-icon-btn dr-icon-btn--save"
                              onClick={() => handleEditSave(doctor)}
                              disabled={isUpdating || isDeleting}
                              title="Save doctor"
                              aria-label={`Save ${formatDoctorName(doctor)}`}
                            >
                              <CheckIcon />
                            </button>
                            <button
                              type="button"
                              className="dr-icon-btn"
                              onClick={handleEditCancel}
                              disabled={isUpdating}
                              title="Cancel edit"
                              aria-label="Cancel edit"
                            >
                              <CloseIcon />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="dr-icon-btn"
                              onClick={() => handleEditStart(doctor)}
                              disabled={isDeleting}
                              title="Edit doctor"
                              aria-label={`Edit ${formatDoctorName(doctor)}`}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="dr-icon-btn dr-icon-btn--danger"
                              onClick={() => handleDeleteRequest(doctor)}
                              disabled={isDeleting}
                              title="Delete doctor"
                              aria-label={`Delete ${formatDoctorName(doctor)}`}
                            >
                              <DeleteIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="dr-empty">No doctors registered yet.</p>
            )}
            {updateError && <span className="dr-field-error">{updateError}</span>}
            {deleteError && <span className="dr-field-error">{deleteError}</span>}
          </div>
        </div>
      </div>
      {doctorToDelete && (
        <div
          className="dr-modal-backdrop"
          role="presentation"
          onClick={() => setDoctorToDelete(null)}
        >
          <div
            className="dr-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dr-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dr-confirm-icon">
              <DeleteIcon />
            </div>
            <div className="dr-confirm-content">
              <h3 id="dr-delete-title">Delete Doctor</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{formatDoctorName(doctorToDelete)}</strong>?
              </p>
            </div>
            <div className="dr-confirm-actions">
              <button
                type="button"
                className="dr-modal-btn dr-modal-btn--ghost"
                onClick={() => setDoctorToDelete(null)}
                disabled={String(deletingId) === String(doctorToDelete.id)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dr-modal-btn dr-modal-btn--danger"
                onClick={handleDeleteConfirm}
                disabled={String(deletingId) === String(doctorToDelete.id)}
              >
                {String(deletingId) === String(doctorToDelete.id)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRegister;
