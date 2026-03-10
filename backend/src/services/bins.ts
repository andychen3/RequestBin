import { nanoid } from 'nanoid';
import type { CreateBinAPIResponse } from '../types/types.js';

import db from '../services/db/index.js';

export const createBin = async (): Promise<CreateBinAPIResponse> => {
  const bin_route = nanoid(8);
  const token = nanoid(32);

  await db.bins.create(bin_route, token);

  return {
    bin_route,
    token
  };
}
