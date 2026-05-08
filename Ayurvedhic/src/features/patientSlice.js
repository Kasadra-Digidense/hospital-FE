import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { createPatientApi, fetchPatientsApi } from "../api/patientApi";

// ─────────────────────────────────────────────
// CREATE PATIENT
// ─────────────────────────────────────────────

export const createPatient = createAsyncThunk(
  "patients/createPatient",

  async (payload, thunkAPI) => {
    try {
      const data = await createPatientApi(payload);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────
// FETCH PATIENTS
// ─────────────────────────────────────────────

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, thunkAPI) => {
    try {
      const data = await fetchPatientsApi();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState = {
  patients: [],
  fetchStatus: "idle",
  createStatus: "idle",
  error: null,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ─────────────────────────
    // CREATE PATIENT
    // ─────────────────────────

    builder
      .addCase(createPatient.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.patients.push(action.payload);
      })

      .addCase(createPatient.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to create patient";
      });

    // ─────────────────────────
    // FETCH PATIENTS
    // ─────────────────────────

    builder

      .addCase(fetchPatients.pending, (state) => {
        state.fetchStatus = "loading";
      })

      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.patients = action.payload;
      })

      .addCase(fetchPatients.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || "Failed to fetch patients";
      });
  },
});

// ─────────────────────────────────────────────

export const { clearPatientError } = patientSlice.actions;

export default patientSlice.reducer;
