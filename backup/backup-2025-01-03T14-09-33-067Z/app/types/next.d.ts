import { NextRequest } from 'next/server';

declare module 'next/server' {
    interface Request extends NextRequest {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}
