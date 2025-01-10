export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  timestamp: string;
  headers: Record<string, string>;
  body?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  createdAt: string;
}
