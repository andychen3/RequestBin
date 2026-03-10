import { nanoid } from 'nanoid';
import type { CreateBinAPIResponse } from '../types.js';

// import 'db' from '../db'
// await db.init();

export const createBin = async (): Promise<CreateBinAPIResponse> => {
  const bin_route = nanoid(8);
  const token = nanoid(32);

  // store new bin in database (db.bins.create)
  // await db.bins.create('abc123', 'secret-token-xyz');

  return {
    bin_route,
    token
  };
}