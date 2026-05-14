import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createInvoiceApi,
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

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (payload, thunkAPI) => {
    try {
      const data = await createInvoiceApi(payload);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  patients: [],
  rooms: [],
  fetchStatus: "idle",
  roomFetchStatus: "idle",
  error: null,
  roomError: null,
  treatments: [],
  patientsStatus: "idle",
  treatmentsStatus: "idle",
  patientsError: null,
  treatmentsError: null,
  createStatus: "idle",
  createError: null,
  createdInvoice: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    resetInvoiceCreation: (state) => {
      state.createStatus = "idle";
      state.createError = null;
      state.createdInvoice = null;
    },
  },
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
      })

      // Create Invoice

      .addCase(createInvoice.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createdInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || "Failed to create invoice";
      });
  },
});

export const { resetInvoiceCreation } = invoiceSlice.actions;
export default invoiceSlice.reducer;
