import axiosInstance from "./axiosInstance";

export const fetchTreatmentsApi = async () => {
  try {
    const response = await axiosInstance.get("/treatments/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }
    throw new Error(error.response?.data?.detail || "Failed to fetch treatments");
  }
};

export const createTreatmentApi = async (treatmentData) => {
  try {
    const response = await axiosInstance.post("/treatments/", treatmentData);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }
    throw new Error(error.response?.data?.detail || "Failed to create treatment");
  }
};

export const updateTreatmentApi = async (treatmentId, treatmentData) => {
  try {
    const response = await axiosInstance.put(
      `/treatments/${treatmentId}`,
      treatmentData
    );
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }
    throw new Error(error.response?.data?.detail || "Failed to update treatment");
  }
};

export const deleteTreatmentApi = async (treatmentId) => {
  try {
    const response = await axiosInstance.delete(`/treatments/${treatmentId}`);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }
    throw new Error(error.response?.data?.detail || "Failed to delete treatment");
  }
};
