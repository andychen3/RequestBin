import axios from "axios";
import type { Bin, CreateBinPayload } from "../../types/request-bin";

const createBin = async (url: string): Promise<Bin> => {
  try {
    const payload: CreateBinPayload = {
      bin_route: url,
    };
    const response = await axios.post<Bin>("api/bins", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create a new bin.", error);
    throw error;
  }
};

export { createBin };
