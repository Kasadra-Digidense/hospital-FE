import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import invoiceReducer from "../features/invoiceSlice";
import patientReducer from "../features/patientSlice";
import doctorReducer from "../features/doctorSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoice: invoiceReducer,
    patients: patientReducer,
    doctor: doctorReducer
  },
});
