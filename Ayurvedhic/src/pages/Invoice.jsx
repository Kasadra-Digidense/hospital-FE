import React, { useState } from "react";
import "../styles/pages/Invoice.css";
import ayurLogo from "../assets/ayur_logo.png";

const Invoice = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isPrintView, setIsPrintView] = useState(false);

  const [billData, setBillData] = useState({
    patientName: "SHOBHA",
    address:
      "W/O V K SREEJITH, KOUSALYAM, AIGOOR, VILLAGE SOMWARPET, TALUK, KODAGU, DT KARNATAKA",
    age: "48",
    gender: "FEMALE",
    mrdNo: "22027",
    ipNo: "2604/91",
    billNo: "24",
    roomType: "Non AC Big",
    admissionDate: "19/04/2026",
    dischargeDate: "02/05/2026",
    roomNo: "ROOM - 11 A",
    consultant: "DR SANAL",
    date: "02/05/2026",
    days: "14",
    advancePaid: 10000.0,
    amountPaidUPI: 0,
    extrasRoundOff: 0.0,
    registrationFees: 500.0,
    nurseFee: 2100.0,
    doctorsFee: 2800.0,
    consumables: 160.0,
  });

  const [roomRents, setRoomRents] = useState([
    {
      description: "Room Rent [ROOM - 8 A]",
      qty: 3,
      rate: 466.67,
      amount: 1400.0,
    },
    {
      description: "Room Rent [ROOM - 11 A]",
      qty: 3,
      rate: 600.0,
      amount: 1800.0,
    },
    {
      description: "Room Rent [ROOM - 11 A]",
      qty: 8,
      rate: 700.0,
      amount: 5600.0,
    },
  ]);

  const [treatments, setTreatments] = useState([
    {
      description: "ABHYANGAM - DS",
      qty: "14 Nos",
      rate: 400.0,
      amount: 5600.0,
    },
    {
      description: "BANDANAM - BK",
      qty: "12 Nos",
      rate: 250.0,
      amount: 3000.0,
    },
    {
      description: "ENNAKIZHI - DS",
      qty: "7 Nos",
      rate: 350.0,
      amount: 2450.0,
    },
  ]);

  const roomTotal = roomRents.reduce((sum, item) => sum + item.amount, 0);
  const treatmentTotal = treatments.reduce((sum, item) => sum + item.amount, 0);
  const otherTotal =
    parseFloat(billData.consumables) +
    parseFloat(billData.doctorsFee) +
    parseFloat(billData.nurseFee) +
    parseFloat(billData.registrationFees) +
    parseFloat(billData.extrasRoundOff);

  const grossTotal = roomTotal + treatmentTotal + otherTotal;
  const balanceAmount =
    grossTotal - billData.advancePaid - billData.amountPaidUPI;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData({ ...billData, [name]: value });
  };

  const updateRoomRow = (index, field, value) => {
    const newRows = [...roomRents];
    newRows[index][field] = value;
    if (field === "qty" || field === "rate") {
      newRows[index].amount =
        parseFloat(newRows[index].qty || 0) *
        parseFloat(newRows[index].rate || 0);
    }
    setRoomRents(newRows);
  };

  const updateTreatmentRow = (index, field, value) => {
    const newRows = [...treatments];
    newRows[index][field] = value;
    if (field === "qty" || field === "rate") {
      const numericQty =
        parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
      if (field === "qty") {
        newRows[index].amount =
          numericQty * parseFloat(newRows[index].rate || 0);
      } else {
        const currentQty =
          parseFloat(newRows[index].qty.toString().replace(/[^0-9.]/g, "")) ||
          0;
        newRows[index].amount = currentQty * parseFloat(value || 0);
      }
    }
    setTreatments(newRows);
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className={`invoice-container ${isPrintView ? "print-mode" : ""}`}>
      {!isPrintView ? (
        <div className="invoice-modern-shell">
          {/* Header */}
          <div className="invoice-top-bar">
            <div className="title-group">
              <h1>Invoice Generator</h1>
              <p>Create professional discharge bills for patients</p>
            </div>
            <button
              className="preview-btn-modern"
              onClick={() => setIsPrintView(true)}
            >
              <span>Preview & Print</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>
          </div>

          <div className="invoice-main-layout">
            {/* Step Sidebar */}
            <aside className="invoice-steps-sidebar">
              <div
                className={`step-item ${activeStep === 1 ? "active" : activeStep > 1 ? "completed" : ""}`}
                onClick={() => setActiveStep(1)}
              >
                <div className="step-number">{activeStep > 1 ? "✓" : "1"}</div>
                <div className="step-info">
                  <span className="step-label">Patient Info</span>
                  <span className="step-desc">Basic details & Address</span>
                </div>
              </div>
              <div
                className={`step-item ${activeStep === 2 ? "active" : activeStep > 2 ? "completed" : ""}`}
                onClick={() => setActiveStep(2)}
              >
                <div className="step-number">{activeStep > 2 ? "✓" : "2"}</div>
                <div className="step-info">
                  <span className="step-label">Stay Details</span>
                  <span className="step-desc">Room & Admission</span>
                </div>
              </div>
              <div
                className={`step-item ${activeStep === 3 ? "active" : activeStep > 3 ? "completed" : ""}`}
                onClick={() => setActiveStep(3)}
              >
                <div className="step-number">{activeStep > 3 ? "✓" : "3"}</div>
                <div className="step-info">
                  <span className="step-label">Charges</span>
                  <span className="step-desc">Rents & Treatments</span>
                </div>
              </div>
              <div
                className={`step-item ${activeStep === 4 ? "active" : ""}`}
                onClick={() => setActiveStep(4)}
              >
                <div className="step-number">4</div>
                <div className="step-info">
                  <span className="step-label">Payment</span>
                  <span className="step-desc">Advance & Balance</span>
                </div>
              </div>
            </aside>

            {/* Form Content */}
            <main className="invoice-form-content">
              {activeStep === 1 && (
                <div className="step-content">
                  <h2>Patient Information</h2>
                  <div className="modern-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="patientName"
                      value={billData.patientName}
                      onChange={handleInputChange}
                      placeholder="Ex: John Doe"
                    />
                  </div>
                  <div className="modern-field">
                    <label>Permanent Address</label>
                    <textarea
                      name="address"
                      value={billData.address}
                      onChange={handleInputChange}
                      placeholder="Street, Village, State..."
                    ></textarea>
                  </div>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>Age</label>
                      <input
                        type="number"
                        name="age"
                        value={billData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={billData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="step-content">
                  <h2>Stay & Hospital Details</h2>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>MRD No</label>
                      <input
                        type="text"
                        name="mrdNo"
                        value={billData.mrdNo}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>IP No</label>
                      <input
                        type="text"
                        name="ipNo"
                        value={billData.ipNo}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Bill No</label>
                      <input
                        type="text"
                        name="billNo"
                        value={billData.billNo}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>Room Type</label>
                      <input
                        type="text"
                        name="roomType"
                        value={billData.roomType}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Admission Date</label>
                      <input
                        type="date"
                        name="admissionDate"
                        value={billData.admissionDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>Consultant Doctor</label>
                      <input
                        type="text"
                        name="consultant"
                        value={billData.consultant}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Stay Duration (Days)</label>
                      <input
                        type="number"
                        name="days"
                        value={billData.days}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="step-content">
                  <h2>Billing Items</h2>

                  <div className="billing-section">
                    <div className="section-header">
                      <h3>Room Rents</h3>
                      <button
                        className="add-btn"
                        onClick={() =>
                          setRoomRents([
                            ...roomRents,
                            { description: "", qty: 0, rate: 0, amount: 0 },
                          ])
                        }
                      >
                        + Add Room
                      </button>
                    </div>
                    {roomRents.map((row, index) => (
                      <div className="dynamic-row" key={index}>
                        <input
                          className="flex-2"
                          type="text"
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) =>
                            updateRoomRow(index, "description", e.target.value)
                          }
                        />
                        <input
                          className="flex-1"
                          type="number"
                          placeholder="Qty"
                          value={row.qty}
                          onChange={(e) =>
                            updateRoomRow(index, "qty", e.target.value)
                          }
                        />
                        <input
                          className="flex-1"
                          type="number"
                          placeholder="Rate"
                          value={row.rate}
                          onChange={(e) =>
                            updateRoomRow(index, "rate", e.target.value)
                          }
                        />
                        <div className="row-amount">
                          ₹{row.amount.toFixed(0)}
                        </div>
                        <button
                          className="del-btn"
                          onClick={() =>
                            setRoomRents(
                              roomRents.filter((_, i) => i !== index),
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="billing-section">
                    <div className="section-header">
                      <h3>Treatments</h3>
                      <button
                        className="add-btn"
                        onClick={() =>
                          setTreatments([
                            ...treatments,
                            { description: "", qty: "", rate: 0, amount: 0 },
                          ])
                        }
                      >
                        + Add Treatment
                      </button>
                    </div>
                    {treatments.map((row, index) => (
                      <div className="dynamic-row" key={index}>
                        <input
                          className="flex-2"
                          type="text"
                          placeholder="Treatment Name"
                          value={row.description}
                          onChange={(e) =>
                            updateTreatmentRow(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          className="flex-1"
                          type="text"
                          placeholder="Qty (e.g. 10 Nos)"
                          value={row.qty}
                          onChange={(e) =>
                            updateTreatmentRow(index, "qty", e.target.value)
                          }
                        />
                        <input
                          className="flex-1"
                          type="number"
                          placeholder="Rate"
                          value={row.rate}
                          onChange={(e) =>
                            updateTreatmentRow(index, "rate", e.target.value)
                          }
                        />
                        <div className="row-amount">
                          ₹{row.amount.toFixed(0)}
                        </div>
                        <button
                          className="del-btn"
                          onClick={() =>
                            setTreatments(
                              treatments.filter((_, i) => i !== index),
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="step-content">
                  <h2>Final Payment & Other Fees</h2>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>Doctor's Fee</label>
                      <input
                        type="number"
                        name="doctorsFee"
                        value={billData.doctorsFee}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Nurse Fee</label>
                      <input
                        type="number"
                        name="nurseFee"
                        value={billData.nurseFee}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="modern-field">
                      <label>Registration Fee</label>
                      <input
                        type="number"
                        name="registrationFees"
                        value={billData.registrationFees}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field">
                      <label>Consumables</label>
                      <input
                        type="number"
                        name="consumables"
                        value={billData.consumables}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <hr className="divider" />
                  <div className="field-row">
                    <div className="modern-field highlight">
                      <label>Total Advance Paid</label>
                      <input
                        type="number"
                        name="advancePaid"
                        value={billData.advancePaid}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="modern-field highlight">
                      <label>Other Payments (UPI)</label>
                      <input
                        type="number"
                        name="amountPaidUPI"
                        value={billData.amountPaidUPI}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Navigation */}
              <div className="form-footer-nav">
                <button
                  className="nav-btn secondary"
                  onClick={prevStep}
                  disabled={activeStep === 1}
                >
                  Previous
                </button>
                {activeStep < 4 ? (
                  <button className="nav-btn primary" onClick={nextStep}>
                    Next Step
                  </button>
                ) : (
                  <button
                    className="nav-btn success"
                    onClick={() => setIsPrintView(true)}
                  >
                    Final Preview
                  </button>
                )}
              </div>
            </main>

            {/* Live Summary Sidebar */}
            <aside className="invoice-live-summary">
              <h3>Live Summary</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Room Rents</span>
                  <span>₹{roomTotal.toFixed(0)}</span>
                </div>
                <div className="summary-item">
                  <span>Treatments</span>
                  <span>₹{treatmentTotal.toFixed(0)}</span>
                </div>
                <div className="summary-item">
                  <span>Other Fees</span>
                  <span>₹{otherTotal.toFixed(0)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item total">
                  <span>Gross Total</span>
                  <span>₹{grossTotal.toFixed(0)}</span>
                </div>
                <div className="summary-item advance">
                  <span>Total Advance</span>
                  <span>- ₹{billData.advancePaid}</span>
                </div>
                <div className="summary-item balance">
                  <span>Balance Due</span>
                  <span
                    className={balanceAmount > 0 ? "due-text" : "paid-text"}
                  >
                    ₹{balanceAmount.toFixed(0)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : (
        <div className="bill-preview-overlay">
          <div className="bill-preview-actions no-print">
            <button className="back-btn" onClick={() => setIsPrintView(false)}>
              ← Back to Edit
            </button>
            <button className="print-action-btn" onClick={() => window.print()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Invoice
            </button>
          </div>

          {/* THE ACTUAL PRINTABLE BILL (Unchanged logic, just ensure it works with the new data) */}
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
                      {billData.patientName}
                      <br />
                      {billData.address}
                      <br />
                      Age: {billData.age} | Gender: {billData.gender}
                    </td>
                    <td className="w-30">
                      <strong>Hospital Reference</strong>
                      MRD No: {billData.mrdNo}
                      <br />
                      IP No: {billData.ipNo}
                      <br />
                      Bill No: {billData.billNo}
                    </td>
                    <td className="w-30">
                      <strong>Stay Details</strong>
                      Admission: {billData.admissionDate}
                      <br />
                      Discharge: {billData.dischargeDate}
                      <br />
                      Consultant: {billData.consultant}
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
                  {roomRents.map((item, index) => (
                    <tr key={`room-${index}`}>
                      <td className="text-left">{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{item.rate.toFixed(2)}</td>
                      <td>{item.amount.toFixed(2)}</td>
                      <td>
                        {index === roomRents.length - 1
                          ? roomTotal.toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="section-header-row">
                    <td colSpan="5" className="text-left">
                      Treatment & Procedural Charges
                    </td>
                  </tr>
                  {treatments.map((item, index) => (
                    <tr key={`treat-${index}`}>
                      <td className="text-left">{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{item.rate.toFixed(2)}</td>
                      <td>{item.amount.toFixed(2)}</td>
                      <td>
                        {index === treatments.length - 1
                          ? treatmentTotal.toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="section-header-row">
                    <td colSpan="5" className="text-left">
                      Other Charges & Fees
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan="4">
                      CONSUMABLES
                    </td>
                    <td>{billData.consumables.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan="4">
                      DOCTORS FEE
                    </td>
                    <td>{billData.doctorsFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan="4">
                      NURSE FEE
                    </td>
                    <td>{billData.nurseFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan="4">
                      REGISTRATION FEES
                    </td>
                    <td>{billData.registrationFees.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan="4">
                      Extras Round Off
                    </td>
                    <td>{billData.extrasRoundOff.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row grand-total-row">
                    <td className="total-label" colSpan="4">
                      GROSS TOTAL
                    </td>
                    <td className="total-amount">{grossTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row">
                    <td className="total-label" colSpan="4">
                      TOTAL ADVANCE PAID (-)
                    </td>
                    <td>{billData.advancePaid.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row">
                    <td className="total-label" colSpan="4">
                      AMOUNT PAID (UPI) (-)
                    </td>
                    <td>{billData.amountPaidUPI.toFixed(2)}</td>
                  </tr>
                  <tr className="bill-total-row grand-total-row">
                    <td className="total-label" colSpan="4">
                      BALANCE DUE
                    </td>
                    <td className="total-amount">
                      {(
                        grossTotal -
                        billData.advancePaid -
                        billData.amountPaidUPI
                      ).toFixed(2)}
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
                  <p className="preparer-name">SHIJITHA SUMESH</p>
                </div>
              </div>
              <div className="page-number">Page 1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
