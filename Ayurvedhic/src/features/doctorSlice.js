import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteDoctorApi,
  fetchDoctorsApi,
  registerDoctorApi,
  updateDoctorApi,
} from "../api/doctorApi";

const initialState = {
  doctors: [],
  loading: false,
  fetchLoading: false,
  updatingId: null,
  deletingId: null,
  success: false,
  error: null,
  fetchError: null,
  updateError: null,
  deleteError: null,
};

// GET DOCTORS
export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (_, thunkAPI) => {
    try {
      const response = await fetchDoctorsApi();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// REGISTER DOCTOR
export const registerDoctor = createAsyncThunk(
  "doctor/registerDoctor",
  async (doctorData, thunkAPI) => {
    try {
      const response = await registerDoctorApi(doctorData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// UPDATE DOCTOR
export const updateDoctor = createAsyncThunk(
  "doctor/updateDoctor",
  async ({ id, doctorData }, thunkAPI) => {
    try {
      const response = await updateDoctorApi(id, doctorData);
      return { id, doctor: response || { id, ...doctorData } };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// DELETE DOCTOR
export const deleteDoctor = createAsyncThunk(
  "doctor/deleteDoctor",
  async (id, thunkAPI) => {
    try {
      await deleteDoctorApi(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearDoctorState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.fetchError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // GET DOCTORS
      .addCase(fetchDoctors.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })

      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.doctors = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.results)
            ? action.payload.results
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : [];
      })

      .addCase(fetchDoctors.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload || "Failed to fetch doctors";
      })

      // REGISTER DOCTOR
      .addCase(registerDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(registerDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.doctors.unshift(action.payload);
      })

      .addCase(registerDoctor.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // UPDATE DOCTOR
      .addCase(updateDoctor.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
        state.updateError = null;
      })

      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.updatingId = null;
        const updatedDoctor = action.payload.doctor;
        const doctorIndex = state.doctors.findIndex(
          (doctor) => String(doctor.id) === String(action.payload.id)
        );

        if (doctorIndex !== -1) {
          state.doctors[doctorIndex] = {
            ...state.doctors[doctorIndex],
            ...updatedDoctor,
          };
        }
      })

      .addCase(updateDoctor.rejected, (state, action) => {
        state.updatingId = null;
        state.updateError = action.payload || "Doctor update failed";
      })

      // DELETE DOCTOR
      .addCase(deleteDoctor.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.deleteError = null;
      })

      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.deletingId = null;
        state.doctors = state.doctors.filter(
          (doctor) => String(doctor.id) !== String(action.payload)
        );
      })

      .addCase(deleteDoctor.rejected, (state, action) => {
        state.deletingId = null;
        state.deleteError = action.payload || "Doctor delete failed";
      });
  },
});

export const { clearDoctorState } = doctorSlice.actions;

export default doctorSlice.reducer;
