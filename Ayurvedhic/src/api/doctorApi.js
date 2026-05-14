import axiosInstance from "./axiosInstance";

export const fetchDoctorsApi = async () => {
  try {
    const response = await axiosInstance.get("/doctors/");

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(error.response?.data?.detail || "Failed to fetch doctors");
  }
};

export const registerDoctorApi = async (doctorData) => {
  try {
    const response = await axiosInstance.post(
      "/doctors/",
      doctorData
    );

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(
      error.response?.data?.detail || "Doctor registration failed"
    );
  }
};

export const updateDoctorApi = async (doctorId, doctorData) => {
  try {
    const response = await axiosInstance.patch(
      `/doctors/${doctorId}`,
      doctorData
    );

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(error.response?.data?.detail || "Doctor update failed");
  }
};

export const deleteDoctorApi = async (doctorId) => {
  try {
    const response = await axiosInstance.delete(`/doctors/${doctorId}`);

    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error(
        "Unable to reach the server. Check that FastAPI is running."
      );
    }

    throw new Error(error.response?.data?.detail || "Doctor delete failed");
  }
};
