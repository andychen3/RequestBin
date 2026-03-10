export interface CreateBinAPIResponse {
  bin_route: string;
  token: string;
}

export interface BinRequest {
  method: string;
  created_at: string;
  headers: Record<string, string>;
  params: Record<string, string | string[] | undefined>;
  body: object | string;
}

export interface GetBinAPIResponse {
  bin_route: string;
  requests: BinRequest[];
}

export interface RequestData {
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: unknown;
}

export interface RequestWithBody {
  id: string;
  bin_id: string;
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body_id: string;
  created_at: Date;
  body: unknown;  // from MongoDB
}