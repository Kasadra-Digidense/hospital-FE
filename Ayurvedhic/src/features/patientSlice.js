import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPatientApi } from "../api/patientApi";

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

const initialState = {
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
      .addCase(createPatient.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to create patient";
      });
  },
});

export const { clearPatientError } = patientSlice.actions;

export default patientSlice.reducer;
