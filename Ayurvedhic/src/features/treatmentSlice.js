import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchTreatmentsApi,
  createTreatmentApi,
  updateTreatmentApi,
  deleteTreatmentApi,
} from "../api/treatmentApi";

const initialState = {
  treatments: [],
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

// GET TREATMENTS
export const fetchTreatments = createAsyncThunk(
  "treatment/fetchTreatments",
  async (_, thunkAPI) => {
    try {
      const response = await fetchTreatmentsApi();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// CREATE TREATMENT
export const createTreatment = createAsyncThunk(
  "treatment/createTreatment",
  async (treatmentData, thunkAPI) => {
    try {
      const response = await createTreatmentApi(treatmentData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// UPDATE TREATMENT
export const updateTreatment = createAsyncThunk(
  "treatment/updateTreatment",
  async ({ id, treatmentData }, thunkAPI) => {
    try {
      const response = await updateTreatmentApi(id, treatmentData);
      return { id, treatment: response || { id, ...treatmentData } };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// DELETE TREATMENT
export const deleteTreatment = createAsyncThunk(
  "treatment/deleteTreatment",
  async (id, thunkAPI) => {
    try {
      await deleteTreatmentApi(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const treatmentSlice = createSlice({
  name: "treatment",
  initialState,
  reducers: {
    clearTreatmentState: (state) => {
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
      // GET TREATMENTS
      .addCase(fetchTreatments.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.treatments = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.results)
            ? action.payload.results
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : [];
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload || "Failed to fetch treatments";
      })

      // CREATE TREATMENT
      .addCase(createTreatment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.treatments.unshift(action.payload);
      })
      .addCase(createTreatment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // UPDATE TREATMENT
      .addCase(updateTreatment.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
        state.updateError = null;
      })
      .addCase(updateTreatment.fulfilled, (state, action) => {
        state.updatingId = null;
        const updatedTreatment = action.payload.treatment;
        const index = state.treatments.findIndex(
          (t) => String(t.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.treatments[index] = {
            ...state.treatments[index],
            ...updatedTreatment,
          };
        }
      })
      .addCase(updateTreatment.rejected, (state, action) => {
        state.updatingId = null;
        state.updateError = action.payload || "Treatment update failed";
      })

      // DELETE TREATMENT
      .addCase(deleteTreatment.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.deleteError = null;
      })
      .addCase(deleteTreatment.fulfilled, (state, action) => {
        state.deletingId = null;
        state.treatments = state.treatments.filter(
          (t) => String(t.id) !== String(action.payload)
        );
      })
      .addCase(deleteTreatment.rejected, (state, action) => {
        state.deletingId = null;
        state.deleteError = action.payload || "Treatment delete failed";
      });
  },
});

export const { clearTreatmentState } = treatmentSlice.actions;

export default treatmentSlice.reducer;
