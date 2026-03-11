import axios from "axios";
import type { Bin, CreateBinPayload } from "../../types/request-bin";

const API_BASE_URL = "http://localhost:3000";

// const apiClient =

const createBin = async (url: string, authToken: string): Promise<Bin> => {
  try {
    const payload: CreateBinPayload = {
      bin_route: url,
      token: authToken,
    };
    const response = await axios.post<Bin>(`${API_BASE_URL}/bins`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create a new bin.", error);
    throw error;
  }
};

export { createBin };
