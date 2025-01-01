/**
 * API Playground Types
 */

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface APIRequest {
  url: string;
  method: HTTPMethod;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface RequestError {
  message: string;
  code?: string;
  details?: any;
}
