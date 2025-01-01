/**
 * Security configuration interface
 */
export interface SecurityConfig {
    cors: {
        allowedOrigins: string[];
        allowedMethods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
        maxAge: number;
        credentials: boolean;
    };
    rateLimit: {
        maxRequests: number;
        windowMs: number;
        message: string;
    };
}

/**
 * Default security configuration
 */
const defaultConfig: SecurityConfig = {
    cors: {
        allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:8080'
        ],
        allowedMethods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With'
        ],
        exposedHeaders: [
            'X-Total-Count',
            'X-Rate-Limit-Remaining'
        ],
        maxAge: 86400, // 24 hours
        credentials: true
    },
    rateLimit: {
        maxRequests: 100,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many requests, please try again later'
    }
};

/**
 * Loads security configuration
 * Merges environment variables with default config
 */
export async function loadSecurityConfig(): Promise<SecurityConfig> {
    // Load environment-specific configuration
    const envConfig = {
        cors: {
            allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || defaultConfig.cors.allowedOrigins,
            allowedMethods: process.env.CORS_ALLOWED_METHODS?.split(',') || defaultConfig.cors.allowedMethods,
            allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || defaultConfig.cors.allowedHeaders,
            exposedHeaders: process.env.CORS_EXPOSED_HEADERS?.split(',') || defaultConfig.cors.exposedHeaders,
            maxAge: parseInt(process.env.CORS_MAX_AGE || '') || defaultConfig.cors.maxAge,
            credentials: process.env.CORS_CREDENTIALS === 'true' || defaultConfig.cors.credentials
        },
        rateLimit: {
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '') || defaultConfig.rateLimit.maxRequests,
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '') || defaultConfig.rateLimit.windowMs,
            message: process.env.RATE_LIMIT_MESSAGE || defaultConfig.rateLimit.message
        }
    };

    return envConfig;
}
