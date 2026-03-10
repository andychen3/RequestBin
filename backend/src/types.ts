export interface CreateBinAPIResponse {
  bin_route: string;
  token: string;
}

export interface BinRequest {
  method: string;
  created_at: string;
  headers: Record<string, string>;
  params: Record<string, string | string[] | undefined>;
  body: object | string | undefined;
}

export interface GetBinAPIResponse {
  bin_route: string;
  requests: BinRequest[];
}
