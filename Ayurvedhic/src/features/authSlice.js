import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUserApi } from "../api/authApi";

const AUTH_STORAGE_KEY = "authUser";

const getStoredUser = () => {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(credentials);

      return {
        id: response.user_id,
        role: response.role,
        username: credentials.username,
        message: response.message,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

const initialState = {
  user: getStoredUser(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logoutUser: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      });
  },
});

export const { clearAuthError, logoutUser } = authSlice.actions;
export default authSlice.reducer;
