import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createPatientApi, getPatientsApi } from "../api/patientApi";

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      return await getPatientsApi();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch patients");
    }
  }
);

export const createPatient = createAsyncThunk(
  "patients/createPatient",
  async (patientData, { rejectWithValue }) => {
    try {
      return await createPatientApi(patientData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to register patient");
    }
  }
);

const initialState = {
  patients: [],
  fetchStatus: "idle",
  createStatus: "idle",
  error: null,
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || "Failed to fetch patients";
      })
      .addCase(createPatient.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to register patient";
      });
  },
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;
