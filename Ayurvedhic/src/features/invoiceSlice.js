import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchInvoicePatientsApi } from "../api/invoiceAPI";

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

const initialState = {
  patients: [],
  fetchStatus: "idle",
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicePatients.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchInvoicePatients.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.patients = action.payload;
      })
      .addCase(fetchInvoicePatients.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || "Failed to fetch patients";
      });
  },
});

export default invoiceSlice.reducer;
