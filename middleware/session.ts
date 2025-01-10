import { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import { redis } from '../lib/redis';
import { parse, serialize } from 'cookie';

interface SessionOptions {
    cookieName?: string;
    duration?: number; // Session duration in seconds
    secure?: boolean;
    path?: string;
}

export interface SessionData {
    userId?: string;
    email?: string;
    role?: string;
    [key: string]: any;
}

interface SessionHandler {
    save: (data: Partial<SessionData>) => Promise<void>;
    destroy: () => Promise<void>;
}

declare module 'next' {
    interface NextApiRequest {
        session?: SessionData;
        sessionId?: string;
        sessionHandler?: SessionHandler;
    }
}

export function withSession(handler: any, options: SessionOptions = {}) {
    const {
        cookieName = 'session_id',
        duration = 86400, // 24 hours
        secure = process.env.NODE_ENV === 'production',
        path = '/'
    } = options;

    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const cookies = parse(req.headers.cookie || '');
            let sessionId = cookies[cookieName];

            // Create new session if none exists
            if (!sessionId) {
                sessionId = nanoid();
                res.setHeader('Set-Cookie', serialize(cookieName, sessionId, {
                    httpOnly: true,
                    secure,
                    sameSite: 'lax',
                    path,
                    maxAge: duration
                }));
            }

            // Attach session ID to request
            req.sessionId = sessionId;

            // Get session data from Redis
            const sessionData = await redis.getSession<SessionData>(sessionId);
            req.session = sessionData || {};

            // Create session handler
            const sessionHandler: SessionHandler = {
                // Save session data
                save: async (data: Partial<SessionData>) => {
                    req.session = { ...req.session, ...data };
                    await redis.setSession(sessionId, req.session, duration);
                },
                // Destroy session
                destroy: async () => {
                    await redis.deleteSession(sessionId);
                    res.setHeader('Set-Cookie', serialize(cookieName, '', {
                        httpOnly: true,
                        secure,
                        sameSite: 'lax',
                        path,
                        maxAge: 0
                    }));
                    req.session = {};
                }
            };

            // Attach session handler to request
            req.sessionHandler = sessionHandler;

            // Process request
            return handler(req, res);

        } catch (error) {
            console.error('Session middleware error:', error);
            return handler(req, res);
        }
    };
}

// Example usage:
/*
export default withSession(async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get session data
    const { userId, role } = req.session || {};

    // Save session data
    await req.sessionHandler?.save({
        userId: '123',
        role: 'admin'
    });

    // Destroy session (logout)
    await req.sessionHandler?.destroy();

    res.json({ success: true });
});
*/
