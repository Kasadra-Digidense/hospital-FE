import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchInvoicePatientsApi,
  fetchInvoiceRoomsApi,
  fetchTreatmentsApi
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

export const fetchInvoiceRooms = createAsyncThunk(
  "invoice/fetchInvoiceRooms",
  async (_, thunkAPI) => {
    try {
      const data = await fetchInvoiceRoomsApi();
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
  rooms: [],
  treatments: [],
  fetchStatus: "idle",
  roomFetchStatus: "idle",
  error: null,
  roomError: null,
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
      })

      // Fetch Rooms

      .addCase(fetchInvoiceRooms.pending, (state) => {
        state.roomFetchStatus = "loading";
        state.roomError = null;
      })
      .addCase(fetchInvoiceRooms.fulfilled, (state, action) => {
        state.roomFetchStatus = "succeeded";
        state.rooms = action.payload;
      })
      .addCase(fetchInvoiceRooms.rejected, (state, action) => {
        state.roomFetchStatus = "failed";
        state.roomError = action.payload || "Failed to fetch rooms";
      })

      // Fetch Treatments

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
