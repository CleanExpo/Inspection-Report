import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateJobNumber } from '../../../middleware/validateMoistureData';
import { DatabaseError } from '../../../utils/errors';
import { withRole } from '../../../middleware/auth';
import { withRateLimit } from '../../../middleware/rateLimit';
import { withCors } from '../../../middleware/cors';
import { AuthenticatedRequest } from '../../../middleware/auth';

const prisma = new PrismaClient();

async function generateSequenceNumber(date: string): Promise<string> {
  try {
    // Find the highest sequence number for the given date
    const result = await prisma.$queryRaw<[{ max_sequence: number | null }]>`
      SELECT MAX(CAST(SUBSTRING("jobNumber", 12, 3) AS INTEGER)) as max_sequence
      FROM "MoistureData"
      WHERE "jobNumber" LIKE ${`${date}-%`}
    `;

    const maxSequence = result[0].max_sequence || 0;
    const nextSequence = (maxSequence + 1).toString().padStart(3, '0');

    if (parseInt(nextSequence) > 999) {
      throw new Error('Maximum sequence number reached for this date');
    }

    return nextSequence;
  } catch (error) {
    throw new DatabaseError('Failed to generate sequence number', (error as any).code);
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}${day}`;
}

async function generateHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: `Method ${req.method} is not allowed`
      });
    }

    const { date: requestDate } = req.body;
    
    // Use provided date or current date
    const date = requestDate ? new Date(requestDate) : new Date();
    
    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please provide a valid date'
      });
    }

    // Generate formatted date portion
    const formattedDate = formatDate(date);
    
    // Generate sequence number
    const sequence = await generateSequenceNumber(formattedDate);
    
    // Combine to create job number
    const jobNumber = `${formattedDate}-${sequence}`;
    
    // Validate the generated job number
    try {
      validateJobNumber(jobNumber);
    } catch (error) {
      return res.status(500).json({
        error: 'Generated job number validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return res.status(200).json({ jobNumber });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({
        error: 'Database Error',
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to generate job number'
    });
  }
}

// Compose middleware - only TECHNICIAN and above can generate job numbers
const handler = withCors(
  withRateLimit(
    withRole('TECHNICIAN')(generateHandler),
    '/api/generate'
  ),
  '/api/generate'
);

export default handler;
