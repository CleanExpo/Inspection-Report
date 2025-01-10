import { PrismaClient } from '@prisma/client';

// Define global type for PrismaClient
declare global {
    var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient if one doesn't exist
const prisma = global.prisma || 
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// Save the PrismaClient instance in development
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Export the instantiated client
export default prisma;

// Re-export types from Prisma
export * from '@prisma/client';

// Export PrismaClient type
export type { PrismaClient };

// Ensure the client is properly typed with all models
export type TypedPrismaClient = PrismaClient extends { 
    user: any;
    client: any;
    job: any;
    reading: any;
    photo: any;
    note: any;
} ? PrismaClient : never;

// Type assertion to ensure our prisma instance has all required models
const typedPrisma = prisma as TypedPrismaClient;
export { typedPrisma as prisma };
