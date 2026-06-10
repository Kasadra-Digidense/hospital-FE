import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/pages/Invoice.css";
import ayurLogo from "../assets/ayur_logo.png";
import {
  createInvoice,
  fetchInvoicePatients,
  fetchInvoiceRooms,
  resetInvoiceCreation,
} from "../features/invoiceSlice";
import { fetchDoctors } from "../features/doctorSlice";
import { fetchTreatments as fetchTreatmentCatalog } from "../features/treatmentSlice";

// Constants for Dropdowns
const DEFAULT_TREATMENT_OPTIONS = [
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
  "Food Charges",
  "Consumables",
  "Registration Fee",
  "Miscellaneous",
];

const PAYMENT_METHODS = ["Cash", "UPI", "Card"];
const INITIAL_ADMISSION_DATA = {
  admissionDate: "",
  dischargeDate: "",
  consultant: "",
};
const createInitialRoomCharges = () => [
  { room: "", days: 0, rate: 0, amount: 0, showList: false },
];
const createInitialTreatmentCharges = () => [
  { treatment: "", qty: 0, rate: 0, amount: 0, showList: false },
];
const createInitialAdditionalCharges = () => [
  { type: "Doctor Fee", qty: 1, rate: 0, amount: 0 },
];
const createInitialPayments = () => [{ method: "Cash", amount: 0 }];

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

const normalizeTreatment = (treatment) => ({
  id:
    treatment.id ??
    treatment._id ??
    treatment.treatmentId ??
    treatment.item_id ??
    treatment.item_name ??
    treatment.name ??
    treatment.treatmentName ??
    treatment.treatment_name,
  name:
    treatment.item_name ??
    treatment.itemName ??
    treatment.name ??
    treatment.treatmentName ??
    treatment.treatment_name ??
    treatment.title ??
    "",
  rate: Number(
    treatment.item_rate ??
      treatment.itemRate ??
      treatment.item_price ??
      treatment.itemPrice ??
      treatment.rate ??
      treatment.amount ??
      treatment.price ??
      treatment.fee ??
      treatment.charge ??
      0,
  ),
});

const normalizePatient = (patient) => ({
  id: patient.id,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  altPhone: patient.altPhone ?? patient.alt_phone,
  email: patient.email,
  place: patient.place,
  mrd: patient.mrdNumber ?? patient.mrd_number,
  ipNumber: patient.ipNumber ?? patient.ip_number,
  registrationDate: patient.registrationDate ?? patient.registration_date,
  address: buildPatientAddress(
    patient.address ?? {
      houseName: patient.houseName ?? patient.house_name,
      street: patient.street,
      city: patient.city,
      district: patient.district,
      state: patient.state,
      country: patient.country,
      pincode: patient.pincode,
    },
    patient.place,
  ),
});

const normalizeRoom = (room) => ({
  id: room.id,
  name: room.room_number,
  group: room.room_group,
  rate: Number(room.rate) || 0,
});

const getDoctorName = (doctor) =>
  doctor?.doctor_name ?? doctor?.doctorName ?? doctor?.name ?? "";

const toNumber = (value) => Number(value) || 0;
const clampNonNegative = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return n < 0 ? 0 : n;
};
const getInvoiceBillNumber = (invoiceResponse) =>
  invoiceResponse?.invoice?.bill_no ??
  invoiceResponse?.invoice?.billNo ??
  invoiceResponse?.invoice?.billNumber ??
  invoiceResponse?.billNo ??
  invoiceResponse?.bill_no ??
  invoiceResponse?.billNumber ??
  "-";
const formatBillAmount = (value) => (Number(value) || 0).toFixed(2);
const formatBillDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const Invoice = () => {
  const dispatch = useDispatch();
  const {
    patients,
    rooms,
    fetchStatus,
    roomFetchStatus,
    error,
    roomError,
    patientsStatus,
    patientsError,
    createStatus,
    createError,
    createdInvoice,
  } = useSelector((state) => state.invoice);
  const {
    doctors,
    fetchLoading: doctorsLoading,
    fetchError: doctorsError,
  } = useSelector((state) => state.doctor);
  const {
    treatments,
    fetchLoading: treatmentsFetchLoading,
    fetchError: treatmentsError,
  } = useSelector((state) => state.treatments);
  const [activeStep, setActiveStep] = useState(1);
  const [isEditingFromPreview, setIsEditingFromPreview] = useState(false);
  const [isPreviewPrinting, setIsPreviewPrinting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // PAGE 1: Patient Data
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);

  // PAGE 2: Admission Data
  const [admissionData, setAdmissionData] = useState(INITIAL_ADMISSION_DATA);

  // PAGE 3: Room Charges
  const [roomCharges, setRoomCharges] = useState(createInitialRoomCharges);

  // PAGE 4: Treatment Charges
  const [treatmentCharges, setTreatmentCharges] = useState(
    createInitialTreatmentCharges,
  );

  // PAGE 5: Additional Charges
  const [additionalCharges, setAdditionalCharges] = useState(
    createInitialAdditionalCharges,
  );

  // PAGE 6: Payment Details
  const [payments, setPayments] = useState(createInitialPayments);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // LOGIC: Days Calculation
  const calculatedDays = useMemo(() => {
    if (!admissionData.admissionDate || !admissionData.dischargeDate) return 0;
    const start = new Date(admissionData.admissionDate);
    const end = new Date(admissionData.dischargeDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [admissionData.admissionDate, admissionData.dischargeDate]);

  useEffect(() => {
    if (patientsStatus !== "loading") {
      dispatch(fetchInvoicePatients());
    }
    if (roomFetchStatus !== "loading" && roomFetchStatus === "idle") {
      dispatch(fetchInvoiceRooms());
    }
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (activeStep === 5) {
      setIsEditingFromPreview(false);
    }
  }, [activeStep]);

  useEffect(() => {
    if (!treatmentsFetchLoading && treatments.length === 0) {
      dispatch(fetchTreatmentCatalog());
    }
  }, [dispatch, treatmentsFetchLoading, treatments.length]);

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
    const advance = parseFloat(advanceAmount) || 0;
    const totalPaid = currentPaid + advance;
    const balance = gross - advance - currentPaid;

    return {
      roomTotal,
      treatmentTotal,
      extraTotal,
      gross,
      advance,
      currentPaid,
      totalPaid,
      balance,
    };
  }, [
    roomCharges,
    treatmentCharges,
    additionalCharges,
    payments,
    advanceAmount,
  ]);

  // HANDLERS
  const validateStep = (step) => {
    const errors = {};

    if (step === 1 && !selectedPatient?.id) {
      errors.patient = "Please select a patient to continue.";
    }

    if (step === 2) {
      if (!admissionData.admissionDate) {
        errors.admissionDate = "Admission date is required.";
      }

      if (!admissionData.dischargeDate) {
        errors.dischargeDate = "Discharge date is required.";
      }

      if (!admissionData.consultant) {
        errors.consultant = "Please select a consultant doctor.";
      }
    }

    return errors;
  };

  const showValidationErrors = (step) => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep = (targetStep) => {
    if (targetStep <= activeStep) {
      setValidationErrors({});
      setActiveStep(targetStep);
      return;
    }

    for (let step = activeStep; step < targetStep; step += 1) {
      if (!showValidationErrors(step)) {
        setActiveStep(step);
        return;
      }
    }

    setValidationErrors({});
    setActiveStep(targetStep);
  };

  // changes made

  const nextStep = () => {
    if (isEditingFromPreview) {
      goToStep(5);
    } else {
      goToStep(Math.min(activeStep + 1, 6));
    }
  };
  const prevStep = () => goToStep(Math.max(activeStep - 1, 1));

  const handlePatientSelect = (p) => {
    setSelectedPatient(p);
    setPatientSearch(p.name);
    setShowPatientList(false);
    setValidationErrors((prev) => ({ ...prev, patient: "" }));
  };

  const handleRoomRowChange = (index, field, value) => {
    const newRows = [...roomCharges];
    // Ensure numeric fields are non-negative
    if (field === "days" || field === "rate") {
      value = clampNonNegative(value);
    }
    newRows[index][field] = value;

    if (field === "room") {
      newRows[index].days = 0;
      newRows[index].rate = 0;
      newRows[index].amount = 0;
    }

    if (field === "days" || field === "rate") {
      newRows[index].amount =
        Math.max(0, parseFloat(newRows[index].days) || 0) *
        Math.max(0, parseFloat(newRows[index].rate) || 0);
    }
    setRoomCharges(newRows);
  };

  const handleTreatmentRowChange = (index, field, value) => {
    const newRows = [...treatmentCharges];
    // Ensure numeric fields are non-negative
    if (field === "qty" || field === "rate") {
      value = clampNonNegative(value);
    }
    newRows[index][field] = value;

    if (field === "treatment") {
      newRows[index].qty = 0;
      newRows[index].rate = 0;
      newRows[index].amount = 0;

      const option = treatmentOptions.find((o) => o.name === value);
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
        Math.max(0, parseFloat(newRows[index].qty) || 0) *
        Math.max(0, parseFloat(newRows[index].rate) || 0);
    }
    setTreatmentCharges(newRows);
  };

  const handleAdditionalChargeChange = (index, field, value) => {
    const newRows = [...additionalCharges];

    if (field === "type") {
      newRows[index].type = value;

      // Food Charges select பண்ணும்போது
      if (value === "Food Charges") {
        newRows[index].qty = 1;
        newRows[index].rate = 0;
        newRows[index].amount = 0;
      }

      setAdditionalCharges(newRows);
      return;
    }

    if (field === "qty" || field === "rate" || field === "amount") {
      value = clampNonNegative(value);
    }

    newRows[index][field] = value;

    // Food Charges க்கு amount மட்டும் manual entry
    if (newRows[index].type === "Food Charges") {
      if (field === "amount") {
        newRows[index].amount = value;
      }
    } else {
      // மற்ற charges க்கு Qty × Rate
      if (field === "qty" || field === "rate") {
        newRows[index].amount =
          Math.max(0, parseFloat(newRows[index].qty) || 0) *
          Math.max(0, parseFloat(newRows[index].rate) || 0);
      }
    }

    setAdditionalCharges(newRows);
  };

  const invoicePatients = useMemo(
    () => patients.map(normalizePatient),
    [patients],
  );

  const roomOptions = useMemo(() => rooms.map(normalizeRoom), [rooms]);

  const doctorOptions = useMemo(
    () => doctors.map(getDoctorName).filter(Boolean),
    [doctors],
  );

  const treatmentOptions = useMemo(() => {
    const treatmentList = Array.isArray(treatments)
      ? treatments
      : Array.isArray(treatments?.results)
        ? treatments.results
        : Array.isArray(treatments?.data)
          ? treatments.data
          : [];

    const normalizedTreatments = treatmentList
      .map(normalizeTreatment)
      .filter(Boolean)
      .sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      );

    return normalizedTreatments.length > 0
      ? normalizedTreatments
      : DEFAULT_TREATMENT_OPTIONS;
  }, [treatments]);

  const filteredPatients = invoicePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.mrd || "").toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.phone || "").includes(patientSearch),
  );
  const generatedBillNumber = getInvoiceBillNumber(createdInvoice);
  const printableRoomCharges = roomCharges.filter((row) => row.room);
  const printableTreatmentCharges = treatmentCharges.filter(
    (row) => row.treatment,
  );
  const printableAdditionalCharges = additionalCharges.filter(
    (row) => row.type && toNumber(row.amount) > 0,
  );
  const printablePayments = payments.filter((row) => toNumber(row.amount) > 0);

  const buildInvoicePayload = () => {
    if (!selectedPatient?.id) {
      throw new Error("Please select a patient before generating the invoice.");
    }

    if (!admissionData.admissionDate || !admissionData.dischargeDate) {
      throw new Error("Please enter admission and discharge dates.");
    }

    const getRoomId = (roomName) =>
      roomOptions.find((room) => room.name === roomName)?.id;

    const getTreatmentId = (treatmentName) =>
      treatmentOptions.find((treatment) => treatment.name === treatmentName)
        ?.id;

    const invoiceRoomCharges = roomCharges
      .filter((row) => row.room)
      .map((row) => {
        const roomId = getRoomId(row.room);

        if (!roomId) {
          throw new Error(`Please select a valid room for ${row.room}.`);
        }

        return {
          room_id: roomId,
          days: toNumber(row.days),
          rate: toNumber(row.rate),
          amount: toNumber(row.amount),
        };
      });

    const invoiceTreatmentCharges = treatmentCharges
      .filter((row) => row.treatment)
      .map((row) => {
        const treatmentId = getTreatmentId(row.treatment);

        if (!treatmentId) {
          throw new Error(
            `Please select a valid treatment for ${row.treatment}.`,
          );
        }

        return {
          treatment_id: treatmentId,
          qty: toNumber(row.qty),
          rate: toNumber(row.rate),
          amount: toNumber(row.amount),
        };
      });

    return {
      patient_id: selectedPatient.id,
      admission_date: admissionData.admissionDate,
      discharge_date: admissionData.dischargeDate,
      bill_date: admissionData.dischargeDate,
      consultant: admissionData.consultant,
      room_total: totals.roomTotal,
      treatment_total: totals.treatmentTotal,
      extra_total: totals.extraTotal,
      gross_total: totals.gross,
      advance_amount: totals.advance,
      total_paid: totals.totalPaid,
      balance: totals.balance,
      room_charges: invoiceRoomCharges,
      treatment_charges: invoiceTreatmentCharges,
      additional_charges: additionalCharges
        .filter((row) => row.type)
        .map((row) => ({
          type: row.type,
          quantity: toNumber(row.qty),
          unit_price: toNumber(row.rate),
          total: toNumber(row.amount),
        })),
      payments: payments
        .filter((row) => row.method)
        .map((row) => ({
          method: row.method,
          amount: toNumber(row.amount),
        })),
    };
  };

  const handleGenerateAndPrint = async () => {
    try {
      const payload = buildInvoicePayload();
      await dispatch(createInvoice(payload)).unwrap();
      setActiveStep(6);
    } catch (error) {
      alert(error?.message || error || "Failed to create invoice");
    }
  };

  const resetInvoiceForm = () => {
    setActiveStep(1);
    setValidationErrors({});
    setSelectedPatient(null);
    setPatientSearch("");
    setShowPatientList(false);
    setAdmissionData(INITIAL_ADMISSION_DATA);
    setRoomCharges(createInitialRoomCharges());
    setTreatmentCharges(createInitialTreatmentCharges());
    setAdditionalCharges(createInitialAdditionalCharges());
    setPayments(createInitialPayments());
    setAdvanceAmount(0);
    dispatch(resetInvoiceCreation());
  };

  const handlePrintInvoice = () => {
    const resetAfterPrint = () => {
      window.removeEventListener("afterprint", resetAfterPrint);
      resetInvoiceForm();
    };

    window.addEventListener("afterprint", resetAfterPrint);
    window.print();
  };

  const handlePrintPreviewCopy = () => {
    const restoreAfterPrint = () => {
      window.removeEventListener("afterprint", restoreAfterPrint);
      setIsPreviewPrinting(false);
    };

    setIsPreviewPrinting(true);
    window.addEventListener("afterprint", restoreAfterPrint);
    window.setTimeout(() => {
      window.print();
    }, 0);
  };

  const handlePreviewEdit = (step) => {
    setIsEditingFromPreview(true);
    goToStep(step);
  };

  const renderPrintableBill = (isPreview = false) => (
    <div
      className="printable-bill"
      style={
        isPreview
          ? {
              margin: "0 auto",
              transformOrigin: "top center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
            }
          : {}
      }
    >
      {/* ── HEADER ── */}
      <div className="pb-header">
        <img src={ayurLogo} alt="Anjaneyam Logo" className="pb-logo-img" />
        <div className="pb-contact-block">
          <div className="pb-contact-line">Machiyil, Padiyottuchal</div>
          <div className="pb-contact-line">
            +91 6282 422 323, +91 62824 224500, +91 4985 294 222
          </div>
          <div className="pb-contact-line">
            www.anjaneyamhospital.com, Mail: care@anjaneyamhospital.com
          </div>
        </div>
      </div>

      {/* ── TITLE BAND ── */}
      <div className="pb-title-band">
        <span>DISCHARGE BILL {isPreview && "(PREVIEW)"}</span>
      </div>

      {/* ── PATIENT INFO ── */}
      <div className="pb-info-grid">
        <div className="pb-info-cell" style={{ position: "relative" }}>
          <div className="pb-cell-label">
            Name and Address
            {isPreview && (
              <button
                className="preview-edit-btn"
                onClick={() => handlePreviewEdit(1)}
              >
                Edit
              </button>
            )}
          </div>
          <div className="pb-cell-content">
            <div className="pb-cell-row">
              Name : {selectedPatient?.name || "-"}
            </div>
            <div className="pb-cell-row">{selectedPatient?.address || "-"}</div>
            <div className="pb-cell-row">
              Age : {selectedPatient?.age || "-"}
            </div>
            <div className="pb-cell-row">
              Gender : {selectedPatient?.gender || "-"}
            </div>
          </div>
        </div>
        <div className="pb-info-cell" style={{ position: "relative" }}>
          <div className="pb-kv-alt">
            <strong>MRD No: {selectedPatient?.mrd || "-"}</strong>
          </div>
          <div className="pb-kv-alt">
            <strong>IP No: {selectedPatient?.ipNumber || "-"}</strong>
          </div>
          <div className="pb-kv-alt">
            Admission :{formatBillDate(admissionData.admissionDate)}
          </div>
          <div className="pb-kv-alt">
            Discharge :{formatBillDate(admissionData.dischargeDate)}
          </div>
          {isPreview && (
            <button
              className="preview-edit-btn"
              style={{ position: "absolute", top: "6px", right: "6px" }}
              onClick={() => handlePreviewEdit(2)}
            >
              Edit
            </button>
          )}
        </div>
        <div className="pb-info-cell">
          <div className="pb-kv-alt">
            <strong>Bill No :{isPreview ? "-" : generatedBillNumber}</strong>
          </div>
          <div className="pb-kv-alt">
            Consultant : {admissionData.consultant || "-"}
          </div>
          <div className="pb-kv-alt">
            Date : {formatBillDate(admissionData.dischargeDate || new Date())}
          </div>
          <div className="pb-kv-alt">Days : {calculatedDays || 0}</div>
        </div>
      </div>

      {/* ── CHARGES TABLE ── */}
      <table className="pb-table">
        <thead>
          <tr>
            <th className="pb-th-desc">Description</th>
            <th className="pb-th-num">Qty</th>
            <th className="pb-th-num">Rate (INR)</th>
            <th className="pb-th-num">
              Amount (Rs.)
              <br />
              (INR)
            </th>
            <th className="pb-th-num">Total (INR)</th>
          </tr>
        </thead>
        <tbody>
          {/* Room Rent Section */}
          {printableRoomCharges.map((item, i) => (
            <tr key={`r-${i}`} className="pb-data-row">
              <td className="pb-td-desc">
                Room Rent [{item.room}]
                {isPreview && i === 0 && (
                  <button
                    className="preview-edit-btn"
                    onClick={() => handlePreviewEdit(2)}
                  >
                    Edit
                  </button>
                )}
              </td>
              <td className="pb-td-num">{item.days}</td>
              <td className="pb-td-num">{formatBillAmount(item.rate)}</td>
              <td className="pb-td-num">{formatBillAmount(item.amount)}</td>
              <td className="pb-td-total">
                {i === printableRoomCharges.length - 1 ? (
                  <strong>{formatBillAmount(totals.roomTotal)}</strong>
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}

          {/* Treatment Charges Header */}
          {printableTreatmentCharges.length > 0 && (
            <tr className="pb-section-row">
              <td className="pb-td-desc">
                TREATMENT CHARGES
                {isPreview && (
                  <button
                    className="preview-edit-btn"
                    onClick={() => handlePreviewEdit(3)}
                  >
                    Edit
                  </button>
                )}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td className="pb-td-total"></td>
            </tr>
          )}

          {/* Treatments List */}
          {printableTreatmentCharges.map((item, i) => (
            <tr key={`t-${i}`} className="pb-data-row">
              <td className="pb-td-desc">
                &nbsp;&nbsp;{item.treatment.toUpperCase()}
              </td>
              <td className="pb-td-num">{item.qty} Nos</td>
              <td className="pb-td-num">{formatBillAmount(item.rate)}</td>
              <td className="pb-td-num">{formatBillAmount(item.amount)}</td>
              <td className="pb-td-total">
                {i === printableTreatmentCharges.length - 1 ? (
                  <strong>{formatBillAmount(totals.treatmentTotal)}</strong>
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}

          {/* Additional Fees */}
          {printableAdditionalCharges.map((item, i) => (
            <tr key={`e-${i}`} className="pb-data-row pb-extra-row">
              <td className="pb-td-desc">
                {item.type.toUpperCase()}
                {isPreview && i === 0 && (
                  <button
                    className="preview-edit-btn"
                    onClick={() => handlePreviewEdit(3)}
                  >
                    Edit
                  </button>
                )}
              </td>
              <td className="pb-td-num">{toNumber(item.qty)}</td>
              <td className="pb-td-num">{formatBillAmount(item.rate)}</td>
              <td className="pb-td-num">{formatBillAmount(item.amount)}</td>
              <td className="pb-td-total">
                {i === printableAdditionalCharges.length - 1 ? (
                  <strong>{formatBillAmount(totals.extraTotal)}</strong>
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}

          {/* Extras Round Off */}
          <tr className="pb-data-row pb-extra-row">
            <td className="pb-td-desc">EXTRAS ROUND OFF</td>
            <td className="pb-td-num"></td>
            <td className="pb-td-num"></td>
            <td className="pb-td-num"></td>
            <td className="pb-td-total">
              <strong>0.00</strong>
            </td>
          </tr>

          {/* Grand Totals */}
          <tr className="pb-grand-row">
            <td className="pb-grand-label">Total Bill Amount</td>
            <td></td>
            <td></td>
            <td></td>
            <td className="pb-grand-value">
              <strong>{formatBillAmount(totals.gross)}</strong>
            </td>
          </tr>
          <tr className="pb-grand-row">
            <td className="pb-grand-label">
              Advance Amount Paid
              {isPreview && (
                <button
                  className="preview-edit-btn"
                  onClick={() => handlePreviewEdit(4)}
                >
                  Edit
                </button>
              )}
            </td>
            <td></td>
            <td></td>
            <td className="pb-td-num">
              <strong>{formatBillAmount(totals.advance)}</strong>
            </td>
            <td className="pb-grand-value">
              <strong>{formatBillAmount(totals.advance)}</strong>
            </td>
          </tr>
          {printablePayments.map((item, i) => (
            <tr key={`p-${i}`} className="pb-grand-row pb-payment-row">
              <td className="pb-grand-label">
                Amount Paid ({item.method.toUpperCase()})
                {isPreview && i === 0 && (
                  <button
                    className="preview-edit-btn"
                    onClick={() => handlePreviewEdit(4)}
                  >
                    Edit
                  </button>
                )}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td className="pb-grand-value">
                <strong>{formatBillAmount(item.amount)}</strong>
              </td>
            </tr>
          ))}
          <tr className="pb-grand-row" style={{ backgroundColor: "#f9fafb" }}>
            <td className="pb-grand-label">Remaining Amount Payable</td>
            <td></td>
            <td></td>
            <td></td>
            <td className="pb-grand-value">
              <strong
                style={{ color: totals.balance > 0 ? "#dc2626" : "#16a34a" }}
              >
                {formatBillAmount(totals.balance)}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div className="pb-footer-box">
        <div className="pb-footer-note">
          I Agree that I am responsible for the full payment of the bill in the
          event it is not paid by the company or person indicated.
        </div>
        <div className="pb-footer-sign">
          <div className="pb-footer-sign-label">Auth. Signatory</div>
        </div>
        <div className="pb-footer-prepared">
          <div className="pb-footer-prepared-label">PREPARED BY</div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`invoice-container ${activeStep === 6 ? "print-ready" : ""} ${
        isPreviewPrinting ? "preview-print-mode" : ""
      }`}
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

          <div
            className={`invoice-main-layout ${activeStep === 5 ? "preview-mode" : ""}`}
          >
            {/* Step Navigation Sidebar */}
            {activeStep !== 5 && (
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
                    onClick={() => goToStep(s.n)}
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
            )}

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
                        aria-invalid={Boolean(validationErrors.patient)}
                        className={
                          validationErrors.patient ? "pr-input--error" : ""
                        }
                        placeholder="Search by Name, MRD or Phone Number..."
                        value={patientSearch}
                        onFocus={() => setShowPatientList(true)}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientList(true);
                          setSelectedPatient(null);
                          setValidationErrors((prev) => ({
                            ...prev,
                            patient: "",
                          }));
                        }}
                      />
                      <div className="dropdown-chevron">▼</div>
                      {showPatientList && (
                        <div className="dropdown-list">
                          {patientsStatus === "loading" && (
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
                                MRD: {p.mrd} | IP: {p.ipNumber || "-"} | Phone:{" "}
                                {p.phone || "-"}
                              </small>
                            </div>
                          ))}
                          {patientsStatus !== "loading" &&
                            (patientSearch ? filteredPatients : invoicePatients)
                              .length === 0 && (
                              <div className="dropdown-item">
                                <small>No patients found</small>
                              </div>
                            )}
                          {patientsStatus === "failed" && patientsError && (
                            <div className="dropdown-item">
                              <small>{patientsError}</small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {validationErrors.patient && (
                      <span className="pr-field-error">
                        {validationErrors.patient}
                      </span>
                    )}
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
                          <strong>IP No:</strong>{" "}
                          <span>{selectedPatient.ipNumber || "-"}</span>
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
                        aria-invalid={Boolean(validationErrors.admissionDate)}
                        className={
                          validationErrors.admissionDate
                            ? "pr-input--error"
                            : ""
                        }
                        value={admissionData.admissionDate}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            admissionDate: e.target.value,
                          })
                        }
                        onInput={() =>
                          setValidationErrors((prev) => ({
                            ...prev,
                            admissionDate: "",
                          }))
                        }
                      />
                      {validationErrors.admissionDate && (
                        <span className="pr-field-error">
                          {validationErrors.admissionDate}
                        </span>
                      )}
                    </div>
                    <div className="modern-field">
                      <label>Discharge Date</label>
                      <input
                        type="date"
                        aria-invalid={Boolean(validationErrors.dischargeDate)}
                        className={
                          validationErrors.dischargeDate
                            ? "pr-input--error"
                            : ""
                        }
                        value={admissionData.dischargeDate}
                        onChange={(e) =>
                          setAdmissionData({
                            ...admissionData,
                            dischargeDate: e.target.value,
                          })
                        }
                        onInput={() =>
                          setValidationErrors((prev) => ({
                            ...prev,
                            dischargeDate: "",
                          }))
                        }
                      />
                      {validationErrors.dischargeDate && (
                        <span className="pr-field-error">
                          {validationErrors.dischargeDate}
                        </span>
                      )}
                    </div>
                    <div className="modern-field">
                      <label>Consultant Doctor</label>
                      <div className="dropdown-input-wrapper doctor-select-wrapper">
                        <select
                          aria-invalid={Boolean(validationErrors.consultant)}
                          className={`doctor-select${validationErrors.consultant ? " pr-input--error" : ""}`}
                          value={admissionData.consultant}
                          onChange={(e) => {
                            setAdmissionData({
                              ...admissionData,
                              consultant: e.target.value,
                            });
                            setValidationErrors((prev) => ({
                              ...prev,
                              consultant: "",
                            }));
                          }}
                        >
                          <option value="">Select consultant doctor</option>
                          {doctorOptions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <span className="dropdown-chevron" aria-hidden="true">
                          ▼
                        </span>
                      </div>
                      {doctorsLoading && (
                        <span className="pr-field-hint">
                          Loading doctors...
                        </span>
                      )}
                      {!doctorsLoading && doctorsError && (
                        <span className="pr-field-error">{doctorsError}</span>
                      )}
                      {validationErrors.consultant && (
                        <span className="pr-field-error">
                          {validationErrors.consultant}
                        </span>
                      )}
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
                                min="0"
                                value={row.days}
                                onFocus={() => {
                                  if (Number(row.days) === 0) {
                                    handleRoomRowChange(index, "days", "");
                                  }
                                }}
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
                                min="0"
                                value={row.rate}
                                onFocus={() => {
                                  if (Number(row.rate) === 0) {
                                    handleRoomRowChange(index, "rate", "");
                                  }
                                }}
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
                                      ? treatmentOptions.filter((opt) =>
                                          opt.name
                                            .toLowerCase()
                                            .includes(
                                              row.treatment.toLowerCase(),
                                            ),
                                        )
                                      : treatmentOptions
                                    ).map((opt) => (
                                      <div
                                        key={opt.id || opt.name}
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
                                    {treatmentsFetchLoading && (
                                      <div className="table-dropdown-item">
                                        Loading treatments...
                                      </div>
                                    )}
                                    {!treatmentsFetchLoading &&
                                      treatmentsError && (
                                        <div className="table-dropdown-item">
                                          {treatmentsError}
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={row.qty}
                                onFocus={() => {
                                  if (Number(row.qty) === 0) {
                                    handleTreatmentRowChange(index, "qty", "");
                                  }
                                }}
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
                                min="0"
                                value={row.rate}
                                onFocus={() => {
                                  if (Number(row.rate) === 0) {
                                    handleTreatmentRowChange(index, "rate", "");
                                  }
                                }}
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
                          { type: "Miscellaneous", qty: 1, rate: 0, amount: 0 },
                        ])
                      }
                    >
                      + Add Charge
                    </button>
                  </div>
                  <div className="dynamic-table-container">
                    <table className="wizard-table wizard-table--additional">
                      <thead>
                        <tr>
                          <th>Charge Type</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {additionalCharges.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                value={row.type}
                                onChange={(e) =>
                                  handleAdditionalChargeChange(
                                    index,
                                    "type",
                                    e.target.value,
                                  )
                                }
                              >
                                {ADDITIONAL_CHARGE_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              {row.type === "Food Charges" ? (
                                "-"
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  value={row.qty}
                                  onFocus={() => {
                                    if (Number(row.qty) === 0) {
                                      handleAdditionalChargeChange(
                                        index,
                                        "qty",
                                        "",
                                      );
                                    }
                                  }}
                                  onChange={(e) =>
                                    handleAdditionalChargeChange(
                                      index,
                                      "qty",
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td>
                              {row.type === "Food Charges" ? (
                                "-"
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  value={row.rate}
                                  onFocus={() => {
                                    if (Number(row.rate) === 0) {
                                      const newRows = [...additionalCharges];
                                      newRows[index].rate = "";
                                      setAdditionalCharges(newRows);
                                    }
                                  }}
                                  onChange={(e) =>
                                    handleAdditionalChargeChange(
                                      index,
                                      "rate",
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={row.amount}
                                readOnly={row.type !== "Food Charges"}
                                onChange={(e) =>
                                  handleAdditionalChargeChange(
                                    index,
                                    "amount",
                                    e.target.value,
                                  )
                                }
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
                        <tr className="table-total-row">
                          <td colSpan="3">Additional Fees Total</td>
                          <td colSpan="2">₹{totals.extraTotal.toFixed(2)}</td>
                        </tr>
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
                      <div
                        className="modern-field"
                        style={{ marginBottom: "20px" }}
                      >
                        <label>Advance Amount Paid</label>
                        <input
                          type="number"
                          min="0"
                          value={advanceAmount}
                          onFocus={() => {
                            if (Number(advanceAmount) === 0)
                              setAdvanceAmount("");
                          }}
                          onChange={(e) =>
                            setAdvanceAmount(clampNonNegative(e.target.value))
                          }
                        />
                      </div>
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
                      <table className="wizard-table payment-table">
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
                                  min="0"
                                  value={row.amount}
                                  onFocus={() => {
                                    if (Number(row.amount) === 0) {
                                      const newRows = [...payments];
                                      newRows[index].amount = "";
                                      setPayments(newRows);
                                    }
                                  }}
                                  onChange={(e) => {
                                    const newRows = [...payments];
                                    newRows[index].amount = clampNonNegative(
                                      e.target.value,
                                    );
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
                          <span>Total Bill Amount</span>{" "}
                          <strong>₹{totals.gross.toFixed(2)}</strong>
                        </div>
                        <div className="sum-row">
                          <span>Advance Amount</span>{" "}
                          <strong>₹{totals.advance.toFixed(2)}</strong>
                        </div>
                        <div className="sum-divider"></div>
                        <div className="sum-row grand">
                          <span>Amount Payable</span>{" "}
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

              {/* PAGE 5: Review & Finalize (Preview) */}
              {activeStep === 5 && (
                <div className="step-content">
                  <div className="review-header">
                    <h2>Bill Preview</h2>
                  </div>
                  <div
                    className="preview-print-area"
                    style={{ paddingBottom: "20px" }}
                  >
                    {renderPrintableBill(true)}
                  </div>
                </div>
              )}

              {/* STEP NAVIGATION FOOTER */}
              <div className="wizard-footer no-print">
                <button
                  className="nav-btn secondary"
                  disabled={activeStep === 1}
                  onClick={prevStep}
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
                  {/* {activeStep === 5 && (
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
                  )} */}

                  {activeStep < 5 ? (
                    <button className="nav-btn primary" onClick={nextStep}>
                      {isEditingFromPreview ? "Return to Preview" : "Next"}
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
                    <>
                      <button
                        className="nav-btn draft"
                        disabled={createStatus === "loading"}
                        onClick={handlePrintPreviewCopy}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
                        </svg>
                        Print Preview Copy
                      </button>
                      <button
                        className="nav-btn success"
                        disabled={createStatus === "loading"}
                        onClick={handleGenerateAndPrint}
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
                        {createStatus === "loading"
                          ? "Generating..."
                          : "Generate & Print"}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              {activeStep === 5 && createStatus === "failed" && createError && (
                <p className="no-print" style={{ color: "#b91c1c" }}>
                  {createError}
                </p>
              )}
            </main>
          </div>
        </div>
      )}

      {/* PAGE 6: Printable Invoice */}
      {activeStep === 6 && (
        <div className="bill-preview-overlay">
          {/* Action Bar */}
          <div className="bill-preview-actions no-print">
            <div className="bill-action-left">
              <span className="bill-ready-badge">✓ Invoice Ready</span>
              <span className="bill-no-tag">
                Bill No: {generatedBillNumber}
              </span>
            </div>
            <button className="nav-btn success" onClick={handlePrintInvoice}>
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

          {/* Printable A4 Bill */}
          {renderPrintableBill(false)}
        </div>
      )}
    </div>
  );
};

export default Invoice;
