import axiosInstance from "./axiosInstance";

export const fetchInvoicePatientsApi = async () => {
  try {
    const response = await axiosInstance.get("/patients/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.", { cause: error });
    }

    throw new Error(error.response?.data?.detail || "Failed to fetch patients", {
      cause: error,
    });
  }
};

export const fetchInvoiceRoomsApi = async () => {
  try {
    const response = await axiosInstance.get("/rooms/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.", { cause: error });
    }

    throw new Error(error.response?.data?.detail || "Failed to fetch rooms", {
      cause: error,
    });
  }
};


export const fetchTreatmentsApi = async () => {
  try {
    const response = await axiosInstance.get("/treatments/");
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.", { cause: error });
    }
 

    throw new Error(
      error.response?.data?.detail || "Failed to fetch treatments",
      { cause: error },
    );
  }
};

export const createInvoiceApi = async (payload) => {
  try {
    const response = await axiosInstance.post("/invoices/", payload);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error("Unable to reach the server.", { cause: error });
    }

    throw new Error(error.response?.data?.detail || "Failed to create invoice", {
      cause: error,
    });
  }
};
