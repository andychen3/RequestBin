import axios from "axios";

export const getBin = async (binRoute: string, token: string) => {
  const response = await axios.get(`/api/bins/${binRoute}`, {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
