import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchInvoicePatientsApi,
  fetchTreatmentsApi,
} from "../api/invoiceAPI";

export const fetchInvoicePatients = createAsyncThunk(
  "invoice/fetchInvoicePatients",
  async (_, thunkAPI) => {
    try {
      const data = await fetchInvoicePatientsApi();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchTreatments = createAsyncThunk(
  "invoice/fetchTreatments",
  async (_, thunkAPI) => {
    try {
      const data = await fetchTreatmentsApi();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  patients: [],
  treatments: [],
  patientsStatus: "idle",
  treatmentsStatus: "idle",
  patientsError: null,
  treatmentsError: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicePatients.pending, (state) => {
        state.patientsStatus = "loading";
        state.patientsError = null;
      })
      .addCase(fetchInvoicePatients.fulfilled, (state, action) => {
        state.patientsStatus = "succeeded";
        state.patients = action.payload;
      })
      .addCase(fetchInvoicePatients.rejected, (state, action) => {
        state.patientsStatus = "failed";
        state.patientsError = action.payload || "Failed to fetch patients";
      })
      .addCase(fetchTreatments.pending, (state) => {
        state.treatmentsStatus = "loading";
        state.treatmentsError = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.treatmentsStatus = "succeeded";
        state.treatments = action.payload;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.treatmentsStatus = "failed";
        state.treatmentsError = action.payload || "Failed to fetch treatments";
      });
  },
});

export default invoiceSlice.reducer;
