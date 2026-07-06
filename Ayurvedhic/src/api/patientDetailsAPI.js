import axiosInstance from "./axiosInstance";

export const getAllPatientsApi = async () => {
  try {
    const response = await axiosInstance.get("/patients/");

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(
      error.response?.data?.detail || "Failed to fetch patients"
    );
  }
};

export const editPatientApi = async (patientId, patientData) => {
  try {
    const response = await axiosInstance.patch(
      `/patients/${patientId}`,
      patientData
    );

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(error.response?.data?.detail || "Patient update failed");
  }
};

export const deletePatientApi = async (patientId) => {
  try {
    const response = await axiosInstance.delete(`/patients/${patientId}`);

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(error.response?.data?.detail || "Patient delete failed");
  }
};

