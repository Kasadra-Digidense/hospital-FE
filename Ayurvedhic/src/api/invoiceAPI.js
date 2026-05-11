import axiosInstance from "./axiosInstance";

export const fetchInvoicePatientsApi = async () => {
  try {
    const response = await axiosInstance.get("/patients/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.");
    }

    throw new Error(error.response?.data?.detail || "Failed to fetch patients");
  }
};

export const fetchTreatmentsApi = async () => {
  try {
    const response = await axiosInstance.get("/treatments/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.");
    }

    throw new Error(
      error.response?.data?.detail || "Failed to fetch treatments",
    );
  }
};