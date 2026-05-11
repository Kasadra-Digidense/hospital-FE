import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/pages/Invoice.css";
import ayurLogo from "../assets/ayur_logo.png";
import {
  fetchInvoicePatients,
  fetchInvoiceRooms,
} from "../features/invoiceSlice";

// Constants for Dropdowns
const TREATMENT_OPTIONS = [
  { name: "ABHYANGAM", rate: 400 },
  { name: "BANDANAM", rate: 250 },
  { name: "LEPANAM", rate: 300 },
  { name: "ENNAKIZHI", rate: 350 },
  { name: "PIZHICHIL", rate: 1200 },
  { name: "SIRODHARA", rate: 800 },
  { name: "UDVARTHANAM", rate: 600 },
  
];

const ADDITIONAL_CHARGE_TYPES = [
  "Doctor Fee",
  "Nurse Fee",
  "Consumables",
  "Registration Fee",
  "Miscellaneous",
];

const PAYMENT_METHODS = ["Cash", "UPI", "Card"];
const ROOM_TYPES = ["Non AC Big", "Non AC Small", "AC Deluxe", "General Ward"];
const DOCTORS = ["DR SANAL", "DR ANJALI", "DR KRISHNA"];

const buildPatientAddress = (address = {}, fallbackPlace = "") => {
  const parts = [
    address.houseName,
    address.street,
    address.city,
    address.district,
    address.state,
    address.country,
    address.pincode,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return fallbackPlace || "Address not available";
};

const normalizePatient = (patient) => ({
  id: patient.id,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  altPhone: patient.altPhone,
  email: patient.email,
  place: patient.place,
  mrd: patient.mrdNumber,
  registrationDate: patient.registrationDate,
  address: buildPatientAddress(patient.address, patient.place),
});

const normalizeRoom = (room) => ({
  id: room.id,
  name: room.room_number,
  group: room.room_group,
  rate: Number(room.rate) || 0,
});

const Invoice = () => {
  const dispatch = useDispatch();
  const {
    patients,
    rooms,
    fetchStatus,
    roomFetchStatus,
    error,
    roomError,
  } = useSelector((state) => state.invoice);
  const [activeStep, setActiveStep] = useState(1);

  // PAGE 1: Patient Data
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);

  // PAGE 2: Admission Data
  const [admissionData, setAdmissionData] = useState({
    admissionDate: "",
    dischargeDate: "",
    consultant: DOCTORS[0],
    roomType: ROOM_TYPES[0],
    roomNumber: "ROOM - 01",
    billNo: "2024/001",
  });

  // PAGE 3: Room Charges
  const [roomCharges, setRoomCharges] = useState([
    { room: "", days: 0, rate: 0, amount: 0, showList: false },
  ]);

  // PAGE 4: Treatment Charges
  const [treatmentCharges, setTreatmentCharges] = useState([
    { treatment: "", qty: 0, rate: 0, amount: 0, showList: false },
  ]);

  // PAGE 5: Additional Charges
  const [additionalCharges, setAdditionalCharges] = useState([
    { type: "Doctor Fee", amount: 0 },
  ]);

  // PAGE 6: Payment Details
  const [payments, setPayments] = useState([{ method: "Cash", amount: 0 }]);

  // LOGIC: Days Calculation
  const calculatedDays = useMemo(() => {
    if (!admissionData.admissionDate || !admissionData.dischargeDate) return 0;
    const start = new Date(admissionData.admissionDate);
    const end = new Date(admissionData.dischargeDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  }, [admissionData.admissionDate, admissionData.dischargeDate]);

  useEffect(() => {
    if (roomCharges.length === 1 && roomCharges[0].days === 0) {
      handleRoomRowChange(0, "days", calculatedDays);
    }
  }, [calculatedDays]);

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchInvoicePatients());
    }
    if (roomFetchStatus === "idle") {
      dispatch(fetchInvoiceRooms());
    }
  }, [dispatch, fetchStatus, roomFetchStatus]);

  // CALCULATIONS
  const totals = useMemo(() => {
    const roomTotal = roomCharges.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0,
    );
    const treatmentTotal = treatmentCharges.reduce(
      (sum, t) => sum + (parseFloat(t.amount) || 0),
      0,
    );
    const extraTotal = additionalCharges.reduce(
      (sum, e) => sum + (parseFloat(e.amount) || 0),
      0,
    );
    const gross = roomTotal + treatmentTotal + extraTotal;
    const currentPaid = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0,
    );
    const totalPaid = currentPaid;
    const balance = gross - totalPaid;

    return {
      roomTotal,
      treatmentTotal,
      extraTotal,
      gross,
      currentPaid,
      totalPaid,
      balance,
    };
  }, [roomCharges, treatmentCharges, additionalCharges, payments]);

  // HANDLERS
  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const handlePatientSelect = (p) => {
    setSelectedPatient(p);
    setPatientSearch(p.name);
    setShowPatientList(false);
  };

  const handleRoomRowChange = (index, field, value) => {
    const newRows = [...roomCharges];
    newRows[index][field] = value;

    if (field === "room") {
      newRows[index].days = 0;
      newRows[index].rate = 0;
      newRows[index].amount = 0;
    }

    if (field === "days" || field === "rate") {
      newRows[index].amount =
        (parseFloat(newRows[index].days) || 0) *
        (parseFloat(newRows[index].rate) || 0);
    }
    setRoomCharges(newRows);
  };

  const handleTreatmentRowChange = (index, field, value) => {
    const newRows = [...treatmentCharges];
    newRows[index][field] = value;

    if (field === "treatment") {
      newRows[index].qty = 0;
      newRows[index].rate = 0;
      newRows[index].amount = 0;

      const option = TREATMENT_OPTIONS.find((o) => o.name === value);
      if (option) {
        newRows[index].rate = option.rate;
        // Default Qty to 1 if it's currently 0 or empty
        if (!newRows[index].qty || newRows[index].qty === 0) {
          newRows[index].qty = 1;
        }
        newRows[index].amount =
          (parseFloat(newRows[index].qty) || 1) * option.rate;
      }
    }
    if (field === "qty" || field === "rate") {
      newRows[index].amount =
        (parseFloat(newRows[index].qty) || 0) *
        (parseFloat(newRows[index].rate) || 0);
    }
    setTreatmentCharges(newRows);
  };

  const invoicePatients = useMemo(
    () => patients.map(normalizePatient),
    [patients],
  );

  const roomOptions = useMemo(() => rooms.map(normalizeRoom), [rooms]);

  const roomTypeOptions = useMemo(() => {
    const apiRoomTypes = roomOptions.map((room) => room.group).filter(Boolean);
    return [...new Set([...apiRoomTypes, ...ROOM_TYPES])];
  }, [roomOptions]);

  const admissionRoomOptions = useMemo(() => {
    const filteredRooms = roomOptions.filter(
      (room) => room.group === admissionData.roomType,
    );
    return filteredRooms.length > 0 ? filteredRooms : roomOptions;
  }, [admissionData.roomType, roomOptions]);

  const filteredPatients = invoicePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.mrd || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.phone || "").includes(patientSearch),
  );

  return (
    <div
      className={`invoice-container ${activeStep === 6 ? "print-ready" : ""}`}
      onClick={() => {
        setShowPatientList(false);
        setRoomCharges((prev) => prev.map((r) => ({ ...r, showList: false })));
        setTreatmentCharges((prev) =>
          prev.map((t) => ({ ...t, showList: false })),
        );
      }}
    >
      {activeStep < 6 && (
        <div className="invoice-modern-shell">
          {/* Top Header */}
          <div className="invoice-top-bar">
            <div className="title-group">
              <h1>Invoice Wizard</h1>
              <p>Follow the steps to generate professional bill</p>
            </div>
            <div className="step-progress-pill">Step {activeStep} of 5</div>
          </div>

          <div className="invoice-main-layout">
            {/* Step Navigation Sidebar */}
            <aside className="invoice-steps-sidebar">
              {[
                { n: 1, label: "Select Patient", desc: "Search & Verify" },
                { n: 2, label: "Stay Details", desc: "Stay & Rooms" },
                { n: 3, label: "Treatments", desc: "Procedures & Extras" },
                { n: 4, label: "Payments", desc: "Cash/UPI/Balance" },
                { n: 5, label: "Review", desc: "Final Check" },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`step-item ${activeStep === s.n ? "active" : activeStep > s.n ? "completed" : ""}`}
                  onClick={() => setActiveStep(s.n)}
                >
                  <div className="step-number">
                    {activeStep > s.n ? "✓" : s.n}
                  </div>
                  <div className="step-info">
                    <span className="step-label">{s.label}</span>
                    <span className="step-desc">{s.desc}</span>
                  </div>
                </div>
              ))}
            </aside>

            {/* Page Content Rendering */}
            <main className="invoice-form-content">
              {/* PAGE 1: Select Patient */}
              {activeStep === 1 && (
                <div className="step-content">
                  <h2>Select Patient</h2>
                  <div
                    className="searchable-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label>Patient Search</label>
                    <div
                      className={`dropdown-input-wrapper ${showPatientList ? "open" : ""}`}
                    >
                      <input
                        type="text"
                        placeholder="Search by Name, MRD or Phone Number..."
                        value={patientSearch}
                        onFocus={() => setShowPatientList(true)}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientList(true);
                        }}
                      />
                      <div className="dropdown-chevron">▼</div>
                      {showPatientList && (
                        <div className="dropdown-list">
                          {fetchStatus === "loading" && (
                            <div className="dropdown-item">
                              <small>Loading patients...</small>
                            </div>
                          )}
                          {(patientSearch
                            ? filteredPatients
                            : invoicePatients
                          ).map((p) => (
                            <div
                              key={p.id}
                              className="dropdown-item"
                              onClick={() => handlePatientSelect(p)}
                            >
                              <span>{p.name}</span>
                              <small>
                                MRD: {p.mrd} | Phone: {p.phone || "-"}
                              </small>
                            </div>
                          ))}
                          {fetchStatus !== "loading" &&
                            (patientSearch ? filteredPatients : invoicePatients)
                              .length === 0 && (
                              <div className="dropdown-item">
                                <small>No patients found</small>
                              </div>
                            )}
                          {fetchStatus === "failed" && error && (
                            <div className="dropdown-item">
                              <small>{error}</small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPatient && (
                    <div className="patient-summary-card animate-fade-in">
                      <div className="card-header">
                        <h3>Patient Summary</h3>
                        <span className="badge">Verified</span>
                      </div>
                      <div className="card-grid">
                        <div className="info-grp">
                          <strong>Name:</strong>{" "}
                          <span>{selectedPatient.name}</span>
                        </div>
                        <div className="info-grp">
                          <strong>MRD No:</strong>{" "}
                          <span>{selectedPatient.mrd}</span>
                        </div>
                        <div className="info-grp">
                          <strong>Phone:</strong>{" "}
                          <span>{selectedPatient.phone || "-"}</span>
                        </div>
                        <div className="info-grp">
                          <strong>Age/Gender:</strong>{" "}
                          <span>
                            {selectedPatient.age} / {selectedPatient.gender}
                          </span>
                        </div>
                        <div className="info-grp full">
                          <strong>Address:</strong>{" "}
                          <span>{selectedPatient.address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 2: Admission & Room Details */}
              {activeStep === 2 && (
                <div className="step-content">
                  <h2>Admission & Stay Details</h2>
                  <div className="field-grid">
                    <div className="modern-field">
                      <label>Admission Date</label>
                      <input
                        type="date"
                        value={admissionData.admissionDate}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            admissionDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="modern-field">
                      <label>Discharge Date</label>
                      <input
                        type="date"
                        value={admissionData.dischargeDate}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            dischargeDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="modern-field">
                      <label>Consultant Doctor</label>
                      <select
                        value={admissionData.consultant}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            consultant: e.target.value,
                          })
                        }
                      >
                        {DOCTORS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modern-field">
                      <label>Room Type</label>
                      <select
                        value={admissionData.roomType}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            roomType: e.target.value,
                            roomNumber: "",
                          })
                        }
                      >
                        {roomTypeOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modern-field">
                      <label>Room Number</label>
                      <select
                        value={admissionData.roomNumber}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            roomNumber: e.target.value,
                          })
                        }
                      >
                        <option value="">Select room</option>
                        {admissionRoomOptions.map((room) => (
                          <option key={room.id} value={room.name}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modern-field readonly">
                      <label>Calculated Days</label>
                      <input type="text" value={calculatedDays} readOnly />
                    </div>
                  </div>

                  <div className="spacer-y" style={{ height: "40px" }}></div>

                  <div className="section-header-row">
                    <h3>Room & Accomodation</h3>
                    <button
                      className="add-row-btn"
                      onClick={() =>
                        setRoomCharges([
                          ...roomCharges,
                          {
                            room: "",
                            days: 0,
                            rate: 0,
                            amount: 0,
                            showList: false,
                          },
                        ])
                      }
                    >
                      + Add Room
                    </button>
                  </div>
                  <div className="dynamic-table-container">
                    <table className="wizard-table">
                      <thead>
                        <tr>
                          <th>Room/Bed</th>
                          <th>Days</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomCharges.map((row, index) => (
                          <tr key={index}>
                            <td
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className={`dropdown-input-wrapper ${row.showList ? "open" : ""}`}
                              >
                                <input
                                  type="text"
                                  value={row.room}
                                  placeholder="Search Room..."
                                  onFocus={() => {
                                    const newRows = [...roomCharges];
                                    newRows[index].showList = true;
                                    setRoomCharges(newRows);
                                  }}
                                  onChange={(e) =>
                                    handleRoomRowChange(
                                      index,
                                      "room",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="dropdown-chevron">▼</div>
                                {row.showList && (
                                  <div className="table-dropdown">
                                    {roomFetchStatus === "loading" && (
                                      <div className="table-dropdown-item">
                                        Loading rooms...
                                      </div>
                                    )}
                                    {roomFetchStatus === "failed" && (
                                      <div className="table-dropdown-item">
                                        {roomError || "Failed to fetch rooms"}
                                      </div>
                                    )}
                                    {(row.room
                                      ? roomOptions.filter((opt) =>
                                          `${opt.name} ${opt.group}`
                                            .toLowerCase()
                                            .includes(row.room.toLowerCase()),
                                        )
                                      : roomOptions
                                    ).map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="table-dropdown-item"
                                        onClick={() => {
                                          const newRows = [...roomCharges];
                                          newRows[index].room = opt.name;
                                          newRows[index].rate = opt.rate;
                                          if (
                                            !newRows[index].days ||
                                            newRows[index].days === 0
                                          ) {
                                            newRows[index].days = 1;
                                          }
                                          newRows[index].amount =
                                            (parseFloat(newRows[index].days) ||
                                              1) * opt.rate;
                                          newRows[index].showList = false;
                                          setRoomCharges(newRows);
                                        }}
                                      >
                                        {opt.name} - {opt.group}
                                      </div>
                                    ))}
                                    {roomFetchStatus !== "loading" &&
                                      roomFetchStatus !== "failed" &&
                                      roomOptions.length === 0 && (
                                        <div className="table-dropdown-item">
                                          No rooms found
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={row.days}
                                onChange={(e) =>
                                  handleRoomRowChange(
                                    index,
                                    "days",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={row.rate}
                                onChange={(e) =>
                                  handleRoomRowChange(
                                    index,
                                    "rate",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input type="text" value={row.amount} readOnly />
                            </td>
                            <td>
                              <button
                                className="row-del-btn"
                                onClick={() =>
                                  setRoomCharges(
                                    roomCharges.filter((_, i) => i !== index),
                                  )
                                }
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="table-total-row">
                          <td colSpan="3">Room Total</td>
                          <td colSpan="2">₹{totals.roomTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGE 3: Treatments & Additional Charges */}
              {activeStep === 3 && (
                <div className="step-content">
                  <div className="section-header-row">
                    <h2>Treatments & Procedures</h2>
                    <button
                      className="add-row-btn"
                      onClick={() =>
                        setTreatmentCharges([
                          ...treatmentCharges,
                          {
                            treatment: "",
                            qty: 0,
                            rate: 0,
                            amount: 0,
                            showList: false,
                          },
                        ])
                      }
                    >
                      + Add Treatment
                    </button>
                  </div>
                  <div className="dynamic-table-container">
                    <table className="wizard-table">
                      <thead>
                        <tr>
                          <th>Treatment</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentCharges.map((row, index) => (
                          <tr key={index}>
                            <td
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className={`dropdown-input-wrapper ${row.showList ? "open" : ""}`}
                              >
                                <input
                                  type="text"
                                  value={row.treatment}
                                  placeholder="Search Treatment..."
                                  onFocus={() => {
                                    const newRows = [...treatmentCharges];
                                    newRows[index].showList = true;
                                    setTreatmentCharges(newRows);
                                  }}
                                  onChange={(e) =>
                                    handleTreatmentRowChange(
                                      index,
                                      "treatment",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="dropdown-chevron">▼</div>
                                {row.showList && (
                                  <div className="table-dropdown">
                                    {(row.treatment
                                      ? TREATMENT_OPTIONS.filter((opt) =>
                                          opt.name
                                            .toLowerCase()
                                            .includes(
                                              row.treatment.toLowerCase(),
                                            ),
                                        )
                                      : TREATMENT_OPTIONS
                                    ).map((opt) => (
                                      <div
                                        key={opt.name}
                                        className="table-dropdown-item"
                                        onClick={() => {
                                          handleTreatmentRowChange(
                                            index,
                                            "treatment",
                                            opt.name,
                                          );
                                          const newRows = [...treatmentCharges];
                                          newRows[index].showList = false;
                                          setTreatmentCharges(newRows);
                                        }}
                                      >
                                        {opt.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) =>
                                  handleTreatmentRowChange(
                                    index,
                                    "qty",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={row.rate}
                                onChange={(e) =>
                                  handleTreatmentRowChange(
                                    index,
                                    "rate",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input type="text" value={row.amount} readOnly />
                            </td>
                            <td>
                              <button
                                className="row-del-btn"
                                onClick={() =>
                                  setTreatmentCharges(
                                    treatmentCharges.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="table-total-row">
                          <td colSpan="3">Treatment Total</td>
                          <td colSpan="2">
                            ₹{totals.treatmentTotal.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="spacer-y" style={{ height: "40px" }}></div>

                  <div className="section-header-row">
                    <h3>Additional Fees</h3>
                    <button
                      className="add-row-btn"
                      onClick={() =>
                        setAdditionalCharges([
                          ...additionalCharges,
                          { type: "Miscellaneous", amount: 0 },
                        ])
                      }
                    >
                      + Add Charge
                    </button>
                  </div>
                  <div className="dynamic-table-container">
                    <table className="wizard-table">
                      <thead>
                        <tr>
                          <th>Charge Type</th>
                          <th>Amount (₹)</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {additionalCharges.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                value={row.type}
                                onChange={(e) => {
                                  const newRows = [...additionalCharges];
                                  newRows[index].type = e.target.value;
                                  setAdditionalCharges(newRows);
                                }}
                              >
                                {ADDITIONAL_CHARGE_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={row.amount}
                                onChange={(e) => {
                                  const newRows = [...additionalCharges];
                                  newRows[index].amount = e.target.value;
                                  setAdditionalCharges(newRows);
                                }}
                              />
                            </td>
                            <td>
                              <button
                                className="row-del-btn"
                                onClick={() =>
                                  setAdditionalCharges(
                                    additionalCharges.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGE 4: Payment Details */}
              {activeStep === 4 && (
                <div className="step-content">
                  <h2>Payment Information</h2>
                  <div className="payment-layout">
                    <div className="payment-table-side">
                      <div className="section-header-row">
                        <h3>Current Payments</h3>
                        <button
                          className="add-row-btn"
                          onClick={() =>
                            setPayments([
                              ...payments,
                              { method: "Cash", amount: 0 },
                            ])
                          }
                        >
                          + Add Method
                        </button>
                      </div>
                      <table className="wizard-table">
                        <thead>
                          <tr>
                            <th>Method</th>
                            <th>Amount</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  value={row.method}
                                  onChange={(e) => {
                                    const newRows = [...payments];
                                    newRows[index].method = e.target.value;
                                    setPayments(newRows);
                                  }}
                                >
                                  {PAYMENT_METHODS.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={row.amount}
                                  onChange={(e) => {
                                    const newRows = [...payments];
                                    newRows[index].amount = e.target.value;
                                    setPayments(newRows);
                                  }}
                                />
                              </td>
                              <td>
                                <button
                                  className="row-del-btn"
                                  onClick={() =>
                                    setPayments(
                                      payments.filter((_, i) => i !== index),
                                    )
                                  }
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="payment-summary-side">
                      <div className="summary-card">
                        <div className="sum-row">
                          <span>Gross Total</span>{" "}
                          <strong>₹{totals.gross.toFixed(2)}</strong>
                        </div>
                        <div className="sum-row">
                          <span>Current Payment</span>{" "}
                          <strong>₹{totals.currentPaid.toFixed(2)}</strong>
                        </div>
                        <div className="sum-divider"></div>
                        <div className="sum-row grand">
                          <span>Balance Due</span>{" "}
                          <strong
                            className={totals.balance > 0 ? "due" : "settled"}
                          >
                            ₹{totals.balance.toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: Review & Finalize */}
              {activeStep === 5 && (
                <div className="step-content">
                  <div className="review-header">
                    <h2>Review Invoice</h2>
                    {/* <div className="review-actions">
                                <button className="draft-btn">Save Draft</button>
                                <button className="generate-btn" onClick={() => setActiveStep(6)}>Generate & Print</button>
                            </div> */}
                  </div>
                  <div className="review-grid">
                    <div className="review-section">
                      <div className="section-head">
                        <h4>Patient Info</h4>{" "}
                        <button onClick={() => setActiveStep(1)}>Edit</button>
                      </div>
                      <p>
                        <strong>{selectedPatient?.name}</strong>
                      </p>
                      <p>
                        MRD: {selectedPatient?.mrd} | Phone:{" "}
                        {selectedPatient?.phone || "-"}
                      </p>
                    </div>
                    <div className="review-section">
                      <div className="section-head">
                        <h4>Admission</h4>{" "}
                        <button onClick={() => setActiveStep(2)}>Edit</button>
                      </div>
                      <p>
                        {admissionData.admissionDate} to{" "}
                        {admissionData.dischargeDate}
                      </p>
                      <p>Consultant: {admissionData.consultant}</p>
                    </div>
                    <div className="review-section full">
                      <div className="section-head">
                        <h4>Stay & Treatments</h4>{" "}
                        <button onClick={() => setActiveStep(3)}>Edit</button>
                      </div>
                      <div className="review-list-grid">
                        <div className="review-sublist">
                          <h5>Rooms</h5>
                          {roomCharges.map((r, i) => (
                            <div key={i} className="review-list-item">
                              {r.room} - {r.days} Days
                            </div>
                          ))}
                        </div>
                        <div className="review-sublist">
                          <h5>Treatments</h5>
                          {treatmentCharges.map((t, i) => (
                            <div key={i} className="review-list-item">
                              {t.treatment} x {t.qty}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="review-section">
                      <div className="section-head">
                        <h4>Financial Summary</h4>
                      </div>
                      <div className="review-sums">
                        <div className="sum-line">
                          <span>Rooms:</span> <span>₹{totals.roomTotal}</span>
                        </div>
                        <div className="sum-line">
                          <span>Treatments:</span>{" "}
                          <span>₹{totals.treatmentTotal}</span>
                        </div>
                        <div className="sum-line">
                          <span>Extras:</span> <span>₹{totals.extraTotal}</span>
                        </div>
                        <div className="sum-line final">
                          <span>Total:</span> <span>₹{totals.gross}</span>
                        </div>
                        <div className="sum-line balance">
                          <span>Balance Due:</span>{" "}
                          <span>₹{totals.balance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP NAVIGATION FOOTER */}
              <div className="wizard-footer no-print">
                <button
                  className="nav-btn secondary"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="review-actions">
                  {activeStep === 5 && (
                    <button className="nav-btn draft">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Draft
                    </button>
                  )}

                  {activeStep < 5 ? (
                    <button
                      className="nav-btn primary"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Next
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : activeStep === 5 ? (
                    <button
                      className="nav-btn success"
                      onClick={() => setActiveStep(6)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      Generate & Print
                    </button>
                  ) : null}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* PAGE 6: Printable Invoice */}
      {activeStep === 6 && (
        <div className="bill-preview-overlay">
          <div className="bill-preview-actions no-print">
            <button
              className="nav-btn secondary"
              onClick={() => setActiveStep(5)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
              </svg>
              Back to Review
            </button>

            <button className="nav-btn success" onClick={() => window.print()}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
              </svg>
              Print Invoice
            </button>
          </div>

          <div className="printable-bill">
            <div className="bill-header">
              <div className="bill-logo-section">
                <div className="bill-symbol-wrapper">
                  <img src={ayurLogo} alt="Logo" />
                </div>
                <div className="bill-brand-text">
                  <h2 className="bill-title-anj">ANJANEYAM</h2>
                  <p className="bill-subtitle-ayu">ayurvedic Hospital</p>
                </div>
              </div>
              <div className="bill-hospital-info">
                <p>Machiyil, Padiyottuchal, Kannur</p>
                <p>Mob: +91 6282 422 323, +91 4985 294 222</p>
                <p>care@anjaneyamhospital.com</p>
                <p>www.anjaneyamhospital.com</p>
              </div>
            </div>

            <div className="bill-discharge-title">
              <h3>DISCHARGE BILL</h3>
            </div>

            <div className="bill-patient-info-table">
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="w-40">
                      <strong>Patient Name & Address</strong>
                      <div className="info-content">
                        {selectedPatient?.name}
                        <br />
                        {selectedPatient?.address}
                        <br />
                        Age: {selectedPatient?.age} | Gender:{" "}
                        {selectedPatient?.gender}
                      </div>
                    </td>
                    <td className="w-30">
                      <strong>Hospital Reference</strong>
                      <div className="info-content">
                        MRD No: {selectedPatient?.mrd}
                        <br />
                        Phone: {selectedPatient?.phone || "-"}
                        <br />
                        Bill No: {admissionData.billNo}
                      </div>
                    </td>
                    <td className="w-30">
                      <strong>Stay Details</strong>
                      <div className="info-content">
                        Adm: {admissionData.admissionDate}
                        <br />
                        Dis: {admissionData.dischargeDate}
                        <br />
                        Doc: {admissionData.consultant}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bill-items-table">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Description of Services</th>
                    <th className="w-10">Qty</th>
                    <th className="w-15">Rate (INR)</th>
                    <th className="w-20">Amount (INR)</th>
                    <th className="w-20">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="section-header-row">
                    <td colSpan="5" className="text-left">
                      Room & Accomodation Charges
                    </td>
                  </tr>
                  {roomCharges.map((item, index) => (
                    <tr key={`room-${index}`}>
                      <td className="text-left">{item.room}</td>
                      <td>{item.days}</td>
                      <td>{parseFloat(item.rate).toFixed(2)}</td>
                      <td>{parseFloat(item.amount).toFixed(2)}</td>
                      <td>
                        {index === roomCharges.length - 1
                          ? totals.roomTotal.toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="section-header-row">
                    <td colSpan="5" className="text-left">
                      Treatment & Procedural Charges
                    </td>
                  </tr>
                  {treatmentCharges.map((item, index) => (
                    <tr key={`treat-${index}`}>
                      <td className="text-left">{item.treatment}</td>
                      <td>{item.qty}</td>
                      <td>{parseFloat(item.rate).toFixed(2)}</td>
                      <td>{parseFloat(item.amount).toFixed(2)}</td>
                      <td>
                        {index === treatmentCharges.length - 1
                          ? totals.treatmentTotal.toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="section-header-row">
                    <td colSpan="5" className="text-left">
                      Other Charges & Fees
                    </td>
                  </tr>
                  {additionalCharges.map((item, index) => (
                    <tr key={`extra-${index}`}>
                      <td className="text-left" colSpan="4">
                        {item.type}
                      </td>
                      <td>{parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}

                  <tr className="bill-total-row grand-total-row">
                    <td className="total-label" colSpan="4">
                      GROSS TOTAL
                    </td>
                    <td className="total-amount">{totals.gross.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row">
                    <td className="total-label" colSpan="4">
                      PAYMENTS (CASH/UPI/CARD) (-)
                    </td>
                    <td>{totals.currentPaid.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row grand-total-row">
                    <td className="total-label" colSpan="4">
                      BALANCE DUE
                    </td>
                    <td className="total-amount">
                      {totals.balance.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bill-footer">
              <div className="footer-top-row">
                <div className="footer-note">
                  I Agree that I am responsible for the full payment of the bill
                  in the event it is not paid by the company or person
                  indicated.
                </div>
                <div className="footer-empty"></div>
                <div className="footer-auth">Auth. Signatory</div>
                <div className="footer-prepared">
                  <p className="prepared-by-label">PREPARED BY</p>
                  {/* <p className="preparer-name">SHIJITHA SUMESH</p> */}
                </div>
              </div>
              {/* <div className="page-number">Page 1</div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
