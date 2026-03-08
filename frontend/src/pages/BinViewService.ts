import axios from 'axios';

export const getBin = async (binRoute: string, token: string) => {
  const response = await axios.get(`/bins/${binRoute}`, {
    headers: { Authorization: token }
  });
  return response.data;
}

