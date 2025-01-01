export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timestamp: string;
}

export interface RequestHistory {
  id: string;
  request: APIRequest;
  response?: APIResponse;
  timestamp: string;
  name?: string;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface APIPlaygroundState {
  currentRequest: APIRequest;
  lastResponse?: APIResponse;
  status: RequestStatus;
  error?: string;
}
