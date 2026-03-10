import { ApiError } from '../errors.js';
import type { Request } from 'express';
import type { BinRequest, GetBinAPIResponse } from '../types.js';

interface RequestData {
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: unknown;
}

interface RequestWithBody {
  id: string;
  bin_id: string;
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body_id: string;
  created_at: Date;
  body: unknown;  // from MongoDB
}

const formatDbTimestamp = (timestamp: Date): string => (
  timestamp.toISOString().replace('T', ' ').slice(0, 19)
);

const parseRequestToDB = (req: Request): RequestData => {
  let body: unknown;

  if (req.body && typeof req.body == 'object') {
    body = req.body;
  } else {
    body = req.rawBody;
  }

  return {
    method: req.method,
    parameters: req.params,
    headers: req.headers,
    body,
  }
}

export const toBinRequest = (req: RequestWithBody): BinRequest => ({
  method: req.method,
  created_at: formatDbTimestamp(req.created_at),
  headers: req.headers as Record<string, string>,
  params: req.parameters as Record<string, string>,
  body: req.body as object | string | undefined,
});

export const saveRequestToBin = async (binRoute: string, req: Request): Promise<BinRequest> => {
  const bin = await db.bins.getByRoute(binRoute);

  if (!bin) {
    throw new ApiError(404, `Bin with route ${binRoute} not found.`);
  }

  const dbRequestRecord = db.requests.create(bin.id, parseRequestToDB(req));
  const apiRequest = toBinRequest(dbRequestRecord);
  return apiRequest;
};

export const getRequestsInBin = async (binRoute: string, req: Request): Promise<GetBinAPIResponse> => {
  const bin = await db.bins.getByRoute(binRoute);
  if (!bin) {
    throw new ApiError(404, `Bin with route ${binRoute} not found.`);
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw new ApiError(401, 'Unauthorized: No token provided');
  }

  const [scheme, token] = authHeader.split(' ');
  const isAuthorized = scheme === 'Bearer' && token === bin.token;
  if (!isAuthorized) {
    throw new ApiError(401, 'Unauthorized: Token invalid');
  }

  const dbRequestRecords = await db.requests.getByBinRoute(binRoute);
  const binRequests = dbRequestRecords.map(record => toBinRequest(record));
  return { bin_route: binRoute, requests: binRequests };
}
