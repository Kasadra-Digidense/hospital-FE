import axiosInstance from "./axiosInstance";

export const createPatientApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/patients/", payload);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running.",
      );
    }

    throw new Error(
      error.response?.data?.detail || "Failed to register patient",
    );
  }
};
