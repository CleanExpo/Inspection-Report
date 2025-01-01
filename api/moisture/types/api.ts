import { NextApiRequest, NextApiResponse } from 'next';

export type ApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => Promise<void> | void;

export type ApiMiddleware = (handler: ApiHandler) => ApiHandler;

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
