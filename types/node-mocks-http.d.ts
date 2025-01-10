declare module 'node-mocks-http' {
  import { IncomingMessage, ServerResponse } from 'http';
  import { NextApiRequest, NextApiResponse } from 'next';

  interface RequestOptions {
    method?: string;
    url?: string;
    query?: Partial<{ [key: string]: string | string[] }>;
    params?: { [key: string]: string };
    body?: any;
    headers?: { [key: string]: string };
    session?: { [key: string]: any };
    cookies?: { [key: string]: string };
    env?: { [key: string]: string };
  }

  interface MockResponse extends ServerResponse {
    _getStatusCode(): number;
    _getData(): string;
    _getHeaders(): { [key: string]: string };
    _getJSONData(): any;
    _getBuffer(): Buffer;
    _getRedirectUrl(): string;
    _getRenderView(): string;
    _getRenderData(): any;
  }

  interface MockRequest extends Omit<NextApiRequest, 'query' | 'body'> {
    body: any;  // Made required
    query: Partial<{ [key: string]: string | string[] }>;
    params?: { [key: string]: string };
    session?: { [key: string]: any };
    cookies: { [key: string]: string };
    env: { [key: string]: string };
  }

  interface MockNextApiResponse extends NextApiResponse, MockResponse {}

  export function createRequest(options?: RequestOptions): MockRequest;
  export function createResponse(options?: any): MockNextApiResponse;
  export function createMocks(reqOptions?: RequestOptions, resOptions?: any): {
    req: MockRequest;
    res: MockNextApiResponse;
  };
}
