import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, filters } = req.query;
    const startTime = Date.now();

    // Build search conditions
    const where = {
      OR: [
        { name: { contains: query as string, mode: 'insensitive' } },
        { email: { contains: query as string, mode: 'insensitive' } },
        { phone: { contains: query as string, mode: 'insensitive' } },
        { address: { contains: query as string, mode: 'insensitive' } },
        { searchIndex: { contains: query as string, mode: 'insensitive' } },
      ],
      ...(filters ? JSON.parse(filters as string) : {}),
    };

    // Execute search
    const results = await prisma.client.findMany({
      where,
      include: {
        jobs: {
          select: {
            id: true,
            jobNumber: true,
            status: true,
          },
        },
        inspections: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
    });

    // Log search for analytics
    await prisma.searchLog.create({
      data: {
        userId: session.user.id,
        query: query as string,
        filters: filters ? JSON.parse(filters as string) : null,
        results: results.length,
        duration: Date.now() - startTime,
      },
    });

    return res.status(200).json({
      results,
      count: results.length,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
