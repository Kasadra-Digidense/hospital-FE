import axiosInstance from "./axiosInstance";

export const loginUserApi = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server. Check that FastAPI is running.");
    }

    throw new Error(error.response?.data?.detail || "Login failed");
  }
};
