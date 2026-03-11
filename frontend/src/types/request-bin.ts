export interface Bin {
  id: string;
  bin_route: string;
  send_url: string;
  view_url: string;
  token: string;
}

export interface CreateBinPayload {
  bin_route: string;
  send_url: string;
  view_url: string;
  token: string;
}

export interface BinRequest {
  method: string;
  created_at: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: Record<string, unknown>;
}
