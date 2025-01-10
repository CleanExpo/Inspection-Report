import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../app/lib/prisma';

interface TestResponse {
    message: string;
    data?: {
        user: any;
        client: any;
        job: any;
    };
    error?: string;
}

// Test endpoint to verify database connection and job operations
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TestResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Create or update test user
        const testUser = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: { name: 'Test User' },
            create: {
                email: 'test@example.com',
                name: 'Test User',
                role: 'ADMIN'
            }
        });

        // Create or update test client
        const testClient = await prisma.client.upsert({
            where: { email: 'client@example.com' },
            update: { name: 'Test Client' },
            create: {
                name: 'Test Client',
                email: 'client@example.com',
                phone: '123-456-7890',
                address: '123 Test St'
            }
        });

        // Create test job
        const testJob = await prisma.job.create({
            data: {
                title: 'Test Job',
                description: 'Test job description',
                status: 'PENDING',
                priority: 'NORMAL',
                clientId: testClient.id,
                createdById: testUser.id
            }
        });

        return res.status(200).json({
            message: 'Test data created successfully',
            data: { 
                user: testUser, 
                client: testClient, 
                job: testJob 
            }
        });
    } catch (error) {
        console.error('Test failed:', error);
        return res.status(500).json({
            message: 'Test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
