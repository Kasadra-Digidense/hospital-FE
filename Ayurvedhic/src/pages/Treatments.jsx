import React, { useEffect, useState } from "react";
import "../styles/pages/Treatments.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  clearTreatmentState,
} from "../features/treatmentSlice";

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 22C2 22 17 19 20 10C21.5 5.5 18.5 2 18.5 2C18.5 2 15 5 10.5 6.5C1.5 9.5 2 22 2 22Z" />
    <path d="M12 12L2 22" />
  </svg>
);

const Treatments = () => {
  const dispatch = useDispatch();

  const {
    treatments,
    loading,
    error,
    fetchLoading,
    fetchError,
    updatingId,
    deletingId,
    updateError,
    deleteError,
  } = useSelector((state) => state.treatments);

  const [treatmentName, setTreatmentName] = useState("");
  const [treatmentPrice, setTreatmentPrice] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");

  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [editPriceError, setEditPriceError] = useState("");

  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchTreatments());
    return () => {
      dispatch(clearTreatmentState());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");
    setPriceError("");

    const trimmedName = treatmentName.trim().toUpperCase();
    const parsedPrice = parseFloat(treatmentPrice);

    let hasError = false;
    if (!trimmedName) {
      setNameError("Treatment name is required.");
      hasError = true;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Please enter a valid price (greater than 0).");
      hasError = true;
    }

    if (hasError) return;

    try {
      await dispatch(
        createTreatment({
          item_name: trimmedName,
          price: parsedPrice,
        })
      ).unwrap();
      setTreatmentName("");
      setTreatmentPrice("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStart = (treatment) => {
    setEditingId(treatment.id);
    setEditingName(treatment.item_name);
    setEditingPrice(String(treatment.price));
    setEditNameError("");
    setEditPriceError("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
    setEditingPrice("");
    setEditNameError("");
    setEditPriceError("");
  };

  const handleEditSave = async (treatment) => {
    setEditNameError("");
    setEditPriceError("");

    const trimmedName = editingName.trim().toUpperCase();
    const parsedPrice = parseFloat(editingPrice);

    let hasError = false;
    if (!trimmedName) {
      setEditNameError("Treatment name is required.");
      hasError = true;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditPriceError("Please enter a valid price.");
      hasError = true;
    }

    if (hasError) return;

    try {
      await dispatch(
        updateTreatment({
          id: treatment.id,
          treatmentData: {
            item_name: trimmedName,
            price: parsedPrice,
          },
        })
      ).unwrap();
      handleEditCancel();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = (treatment) => {
    if (treatment.id) {
      setTreatmentToDelete(treatment);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!treatmentToDelete?.id) return;
    try {
      await dispatch(deleteTreatment(treatmentToDelete.id)).unwrap();
      if (editingId === treatmentToDelete.id) {
        handleEditCancel();
      }
      setTreatmentToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTreatments = treatments.filter((t) => {
    const name = t.item_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="treatments-container">
      <div className="treatments-header">
        <h1 className="treatments-title">Treatments Management</h1>
        <p className="treatments-subtitle">
          Define standard Ayurvedic procedures and their prices for invoice generation
        </p>
      </div>

      <div className="treatments-layout">
        {/* Registration Form Card */}
        <div className="treatments-form-card">
          <h2 className="treatments-form-title">Add New Treatment</h2>
          <form onSubmit={handleSubmit} className="treatments-form" noValidate>
            <div className="treatments-input-group">
              <label htmlFor="treatmentName" className="treatments-label">
                Treatment Name
              </label>
              <input
                id="treatmentName"
                type="text"
                placeholder="e.g. ABHYANGAM"
                value={treatmentName}
                onChange={(e) => {
                  setTreatmentName(e.target.value);
                  if (nameError) setNameError("");
                }}
                className={`treatments-input${nameError ? " treatments-input--error" : ""}`}
                required
              />
              {nameError && (
                <span className="treatments-field-error">{nameError}</span>
              )}
            </div>

            <div className="treatments-input-group">
              <label htmlFor="treatmentPrice" className="treatments-label">
                Price (₹)
              </label>
              <div className={`treatments-price-wrapper${priceError ? " treatments-price-wrapper--error" : ""}`}>
                <span className="treatments-currency-prefix">₹</span>
                <input
                  id="treatmentPrice"
                  type="number"
                  placeholder="Enter price"
                  value={treatmentPrice}
                  onChange={(e) => {
                    setTreatmentPrice(e.target.value);
                    if (priceError) setPriceError("");
                  }}
                  className="treatments-input"
                  min="0"
                  required
                />
              </div>
              {priceError && (
                <span className="treatments-field-error">{priceError}</span>
              )}
            </div>

            <div className="treatments-btn-container">
              <button
                type="submit"
                className="treatments-submit-btn"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Treatment"}
              </button>
            </div>
            {error && <span className="treatments-field-error treatments-api-error">{error}</span>}
          </form>

          {/* <div className="treatments-trust-section">
            <div className="treatments-badge">
              <span className="treatments-badge-icon">🌿</span>
              <span className="treatments-badge-text">Authentic Therapy</span>
            </div>
            <div className="treatments-badge">
              <span className="treatments-badge-icon">✓</span>
              <span className="treatments-badge-text">Standard Pricing</span>
            </div>
          </div> */}
        </div>

        {/* Treatments List Card */}
        <div className="treatments-list-card">
          <div className="treatments-list-header">
            <h2 className="treatments-list-title">
              Registered Treatments ({filteredTreatments.length})
            </h2>
            <div className="treatments-search-wrapper">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="treatments-search-input"
              />
            </div>
          </div>

          <div className="treatments-list-wrapper">
            {fetchLoading ? (
              <p className="treatments-empty">Loading treatments...</p>
            ) : fetchError ? (
              <p className="treatments-empty treatments-error">{fetchError}</p>
            ) : filteredTreatments.length > 0 ? (
              <div className="treatments-grid">
                {filteredTreatments.map((treatment) => {
                  const isEditing = editingId === treatment.id;
                  const isUpdating = String(updatingId) === String(treatment.id);
                  const isDeleting = String(deletingId) === String(treatment.id);

                  return (
                    <div
                      key={treatment.id ?? treatment.item_name}
                      className={`treatments-item${isEditing ? " treatments-item--editing" : ""}`}
                    >
                      <div className="treatments-avatar">
                        <LeafIcon />
                      </div>
                      <div className="treatments-info">
                        {isEditing ? (
                          <div className="treatments-edit-inputs">
                            <div className="treatments-edit-field">
                              <input
                                className={`treatments-edit-input${editNameError ? " treatments-edit-input--error" : ""}`}
                                value={editingName}
                                onChange={(e) => {
                                  setEditingName(e.target.value);
                                  if (editNameError) setEditNameError("");
                                }}
                                placeholder="Name"
                                autoFocus
                              />
                              {editNameError && (
                                <span className="treatments-field-error">{editNameError}</span>
                              )}
                            </div>
                            <div className="treatments-edit-field">
                              <div className="treatments-edit-price-wrapper">
                                <span className="treatments-edit-currency">₹</span>
                                <input
                                  type="number"
                                  className={`treatments-edit-input${editPriceError ? " treatments-edit-input--error" : ""}`}
                                  value={editingPrice}
                                  onChange={(e) => {
                                    setEditingPrice(e.target.value);
                                    if (editPriceError) setEditPriceError("");
                                  }}
                                  placeholder="Price"
                                />
                              </div>
                              {editPriceError && (
                                <span className="treatments-field-error">{editPriceError}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="treatments-item-name">
                              {treatment.item_name}
                            </span>
                            <span className="treatments-item-price">
                              ₹{(treatment.price || 0).toLocaleString("en-IN")}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="treatments-item-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="treatments-icon-btn treatments-icon-btn--save"
                              onClick={() => handleEditSave(treatment)}
                              disabled={isUpdating || isDeleting}
                              title="Save treatment"
                              aria-label={`Save ${treatment.item_name}`}
                            >
                              <CheckIcon />
                            </button>
                            <button
                              type="button"
                              className="treatments-icon-btn"
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
                              className="treatments-icon-btn"
                              onClick={() => handleEditStart(treatment)}
                              disabled={isDeleting}
                              title="Edit treatment"
                              aria-label={`Edit ${treatment.item_name}`}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="treatments-icon-btn treatments-icon-btn--danger"
                              onClick={() => handleDeleteRequest(treatment)}
                              disabled={isDeleting}
                              title="Delete treatment"
                              aria-label={`Delete ${treatment.item_name}`}
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
              <p className="treatments-empty">
                {searchTerm ? "No treatments match your search." : "No treatments registered yet."}
              </p>
            )}
            {updateError && (
              <span className="treatments-field-error treatments-api-error">{updateError}</span>
            )}
            {deleteError && (
              <span className="treatments-field-error treatments-api-error">{deleteError}</span>
            )}
          </div>
        </div>
      </div>

      {treatmentToDelete && (
        <div
          className="treatments-modal-backdrop"
          role="presentation"
          onClick={() => setTreatmentToDelete(null)}
        >
          <div
            className="treatments-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="treatments-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="treatments-confirm-icon">
              <DeleteIcon />
            </div>
            <div className="treatments-confirm-content">
              <h3 id="treatments-delete-title">Delete Treatment</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{treatmentToDelete.item_name}</strong>?
              </p>
            </div>
            <div className="treatments-confirm-actions">
              <button
                type="button"
                className="treatments-modal-btn treatments-modal-btn--ghost"
                onClick={() => setTreatmentToDelete(null)}
                disabled={String(deletingId) === String(treatmentToDelete.id)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="treatments-modal-btn treatments-modal-btn--danger"
                onClick={handleDeleteConfirm}
                disabled={String(deletingId) === String(treatmentToDelete.id)}
              >
                {String(deletingId) === String(treatmentToDelete.id)
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

export default Treatments;
