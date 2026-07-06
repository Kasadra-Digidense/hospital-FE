import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import invoiceReducer from "../features/invoiceSlice";
import patientReducer from "../features/patientSlice";
import patientDetailsReducer from "../features/patientDetailsSlice";
import doctorReducer from "../features/doctorSlice";
import treatmentReducer from "../features/treatmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoice: invoiceReducer,
    patients: patientReducer,
    patientDetails: patientDetailsReducer,
    doctor: doctorReducer,
    treatments: treatmentReducer,
  },
});

