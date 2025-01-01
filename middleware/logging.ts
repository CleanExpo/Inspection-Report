import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'api.log');

export function withLogging(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const log = (message: string) => {
      const timestamp = new Date().toISOString();
      const entry = `${timestamp} - ${message}\n`;
      fs.appendFileSync(logFile, entry);
    };

    // Log request
    log(`Request: ${req.method} ${req.url}`);
    log(`Query params: ${JSON.stringify(req.query)}`);

    // Create a proxy response object to capture the response
    const oldJson = res.json;
    res.json = function(body: any) {
      log(`Response: ${JSON.stringify(body)}`);
      return oldJson.call(this, body);
    };

    try {
      await handler(req, res);
      const duration = Date.now() - start;
      log(`Request completed in ${duration}ms`);
    } catch (error) {
      log(`Error: ${error instanceof Error ? error.stack : error}`);
      throw error;
    }
  };
}
