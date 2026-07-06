import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deletePatientApi,
  editPatientApi,
  getAllPatientsApi,
} from "../api/patientDetailsAPI";

export const fetchPatients = createAsyncThunk(
  "patientDetails/fetchPatients",
  async (_, thunkAPI) => {
    try {
      const response = await getAllPatientsApi();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editPatient = createAsyncThunk(
  "patientDetails/editPatient",
  async ({ id, patientData }, thunkAPI) => {
    try {
      const response = await editPatientApi(id, patientData);
      return { id, patient: response || { id, ...patientData } };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patientDetails/deletePatient",
  async (id, thunkAPI) => {
    try {
      await deletePatientApi(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patients: [],
  patientsLoading: false,
  patientsError: null,
  editPatientLoading: false,
  editPatientError: null,
  deletePatientLoading: false,
  deletePatientError: null,
};

const patientDetailsSlice = createSlice({
  name: "patientDetails",
  initialState,
  reducers: {
    clearPatientDetailsErrors: (state) => {
      state.patientsError = null;
      state.editPatientError = null;
      state.deletePatientError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.results)
            ? action.payload.results
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : [];
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload || "Failed to fetch patients";
      })
      .addCase(editPatient.pending, (state) => {
        state.editPatientLoading = true;
        state.editPatientError = null;
      })
      .addCase(editPatient.fulfilled, (state, action) => {
        state.editPatientLoading = false;
        const updatedPatient = action.payload.patient;
        const patientIndex = state.patients.findIndex(
          (patient) => String(patient.id) === String(action.payload.id)
        );

        if (patientIndex !== -1) {
          state.patients[patientIndex] = {
            ...state.patients[patientIndex],
            ...updatedPatient,
          };
        }
      })
      .addCase(editPatient.rejected, (state, action) => {
        state.editPatientLoading = false;
        state.editPatientError = action.payload || "Patient update failed";
      })
      .addCase(deletePatient.pending, (state) => {
        state.deletePatientLoading = true;
        state.deletePatientError = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.deletePatientLoading = false;
        state.patients = state.patients.filter(
          (patient) => String(patient.id) !== String(action.payload)
        );
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.deletePatientLoading = false;
        state.deletePatientError = action.payload || "Patient delete failed";
      });
  },
});

export const { clearPatientDetailsErrors } = patientDetailsSlice.actions;

export default patientDetailsSlice.reducer;

