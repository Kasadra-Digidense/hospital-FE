import axiosInstance from "./axiosInstance";

export const createPatientApi = async (patientData) => {
  const payload = {
    name: patientData.name.trim(),
    phone: patientData.phone.trim(),
    place: patientData.place.trim(),
  };

  try {
    const response = await axiosInstance.post("/patients/", payload);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server. Check that FastAPI is running.");
    }

    throw new Error(error.response?.data?.detail || "Failed to register patient");
  }
};

export const getPatientsApi = async () => {
  try {
    const response = await axiosInstance.get("/patients/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server. Check that FastAPI is running.");
    }

    throw new Error(error.response?.data?.detail || "Failed to fetch patients");
  }
};
