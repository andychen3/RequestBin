import axios from "axios";
import type { Bin, CreateBinPayload } from "../../types/request-bin";

type BinRoute = Bin["bin_route"];
type BinToken = Bin["token"];

const createBin = async (url: BinRoute): Promise<Bin> => {
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

const deleteBin = async (
  binRoute: BinRoute,
  token: BinToken,
): Promise<void> => {
  try {
    await axios.delete(`api/bins/${binRoute}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Failed to delete bin.", error);
    throw error;
  }
};

export { createBin, deleteBin };
