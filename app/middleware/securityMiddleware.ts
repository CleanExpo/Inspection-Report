import { NextResponse } from 'next/server';
import Ajv from 'ajv';
import { loadSecurityConfig } from '../config/security';
import { formatErrorResponse } from '../utils/errorHandling';

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true });

/**
 * Rate limit store interface
 */
interface RateLimitStore {
    [ip: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory rate limit store
let rateLimitStore: RateLimitStore = {};

/**
 * Rate limit exceeded error
 */
export class RateLimitExceededError extends Error {
    constructor(message: string = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitExceededError';
    }
}

/**
 * Request validation error
 */
export class RequestValidationError extends Error {
    errors: any[];

    constructor(message: string, errors: any[]) {
        super(message);
        this.name = 'RequestValidationError';
        this.errors = errors;
    }
}

/**
 * Clear rate limits (for testing)
 */
export function clearRateLimits() {
    rateLimitStore = {};
}

/**
 * Rate limiting middleware
 */
export async function rateLimiter(request: Request): Promise<NextResponse | undefined> {
    try {
        const config = await loadSecurityConfig();
        const ip = request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP');

        if (!ip) {
            throw new Error('IP address not found');
        }

        const now = Date.now();
        const windowStart = now - config.rateLimit.windowMs;

        // Clean up expired entries
        for (const key in rateLimitStore) {
            if (rateLimitStore[key].resetTime < now) {
                delete rateLimitStore[key];
            }
        }

        // Initialize or reset counter
        if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime < now) {
            rateLimitStore[ip] = {
                count: 0,
                resetTime: now + config.rateLimit.windowMs
            };
        }

        // Increment counter
        rateLimitStore[ip].count++;

        // Check limit
        if (rateLimitStore[ip].count > config.rateLimit.maxRequests) {
            throw new RateLimitExceededError(config.rateLimit.message);
        }

        // Add rate limit headers
        const response = new NextResponse();
        response.headers.set('X-Rate-Limit-Limit', config.rateLimit.maxRequests.toString());
        response.headers.set('X-Rate-Limit-Remaining', 
            (config.rateLimit.maxRequests - rateLimitStore[ip].count).toString()
        );
        response.headers.set('X-Rate-Limit-Reset', 
            Math.ceil(rateLimitStore[ip].resetTime / 1000).toString()
        );

        return undefined;
    } catch (error) {
        if (error instanceof RateLimitExceededError) {
            return NextResponse.json(
                formatErrorResponse(error),
                { status: 429 }
            );
        }
        return NextResponse.json(
            formatErrorResponse(new Error('Invalid request')),
            { status: 400 }
        );
    }
}

/**
 * CORS middleware
 */
export async function corsMiddleware(request: Request): Promise<NextResponse | undefined> {
    try {
        const config = await loadSecurityConfig();
        const origin = request.headers.get('Origin');

        // Skip if no origin (same-origin request)
        if (!origin) {
            return undefined;
        }

        // Check if origin is allowed
        if (!config.cors.allowedOrigins.includes(origin)) {
            throw new Error('Origin not allowed');
        }

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            const response = new NextResponse(null, { status: 204 });
            
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 
                config.cors.allowedMethods.join(', ')
            );
            response.headers.set('Access-Control-Allow-Headers', 
                config.cors.allowedHeaders.join(', ')
            );
            response.headers.set('Access-Control-Expose-Headers', 
                config.cors.exposedHeaders.join(', ')
            );
            response.headers.set('Access-Control-Max-Age', 
                config.cors.maxAge.toString()
            );
            
            if (config.cors.credentials) {
                response.headers.set('Access-Control-Allow-Credentials', 'true');
            }

            return response;
        }

        return undefined;
    } catch (error) {
        return NextResponse.json(
            formatErrorResponse(new Error('CORS error')),
            { status: 403 }
        );
    }
}

/**
 * Request validation middleware
 */
export async function validateRequest(
    request: Request,
    schema: object
): Promise<NextResponse | undefined> {
    try {
        // Only validate POST/PUT/PATCH requests
        if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
            return undefined;
        }

        // Parse request body
        const body = await request.json();

        // Validate against schema
        const validate = ajv.compile(schema);
        const valid = validate(body);

        if (!valid) {
            throw new RequestValidationError(
                'Validation failed',
                validate.errors || []
            );
        }

        return undefined;
    } catch (error) {
        if (error instanceof RequestValidationError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                    errors: error.errors.map(err => ({
                        field: err.instancePath.substring(1),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            formatErrorResponse(new Error('Invalid request body')),
            { status: 400 }
        );
    }
}
