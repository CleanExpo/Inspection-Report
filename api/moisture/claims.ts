import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { z } from 'zod';
import { ClaimRequestSchema, ClaimSchema } from './types/schemas';
import { ClaimResponse, ClaimListResponse, ErrorResponse } from './types/responses';
import { withValidation } from './middleware/validation';
import { withClaimPrevention, createClaim, revokeClaim } from './middleware/claim-prevention';
import { createErrorResponse } from './middleware/validation';

// GET: List claims for a report
async function handleGet(
  req: NextApiRequest & { validatedData: { reportId: string } },
  res: NextApiResponse<ClaimListResponse | ErrorResponse>
) {
  const { reportId } = req.validatedData;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  try {
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where: { reportId },
        skip,
        take: pageSize,
        orderBy: { claimedAt: 'desc' }
      }),
      prisma.claim.count({ where: { reportId } })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    });
  } catch (error) {
    console.error('Claim List Error:', error);
    res.status(500).json(
      createErrorResponse(
        500,
        'Failed to retrieve claims',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
}

// POST: Create a new claim
async function handlePost(
  req: NextApiRequest & { validatedData: z.infer<typeof ClaimRequestSchema> },
  res: NextApiResponse<ClaimResponse | ErrorResponse>
) {
  const { reportId, claimType, claimReference } = req.validatedData;
  
  // Get user ID from session/auth (replace with your auth logic)
  const userId = req.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    res.status(401).json(createErrorResponse(401, 'Authentication required'));
    return;
  }

  try {
    const claimData: z.infer<typeof ClaimSchema> = {
      reportId,
      claimType,
      claimReference,
      claimedBy: userId,
      claimedAt: new Date().toISOString(),
      status: 'active'
    };

    await createClaim(claimData);

    const claim = await prisma.claim.findUnique({
      where: { claimReference }
    });

    if (!claim) {
      throw new Error('Failed to create claim');
    }

    res.status(201).json(claim);
  } catch (error) {
    console.error('Claim Creation Error:', error);
    res.status(500).json(
      createErrorResponse(
        500,
        'Failed to create claim',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
}

// DELETE: Revoke a claim
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<{ success: true } | ErrorResponse>
) {
  const { reportId, claimReference } = req.query;

  if (!reportId || !claimReference || 
      typeof reportId !== 'string' || 
      typeof claimReference !== 'string') {
    res.status(400).json(
      createErrorResponse(400, 'Report ID and claim reference are required')
    );
    return;
  }

  try {
    await revokeClaim(reportId, claimReference);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Claim Revocation Error:', error);
    res.status(500).json(
      createErrorResponse(
        500,
        'Failed to revoke claim',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse | ClaimListResponse | { success: true } | ErrorResponse>
) {
  switch (req.method) {
    case 'GET':
      return handleGet(
        req as NextApiRequest & { validatedData: { reportId: string } },
        res as NextApiResponse<ClaimListResponse | ErrorResponse>
      );
    case 'POST':
      return handlePost(
        req as NextApiRequest & { validatedData: z.infer<typeof ClaimRequestSchema> },
        res as NextApiResponse<ClaimResponse | ErrorResponse>
      );
    case 'DELETE':
      return handleDelete(req, res as NextApiResponse<{ success: true } | ErrorResponse>);
    default:
      res.status(405).json(
        createErrorResponse(405, 'Method not allowed', {
          allowedMethods: ['GET', 'POST', 'DELETE']
        })
      );
  }
}

// Apply validation based on request method
export default function claimsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse | ClaimListResponse | { success: true } | ErrorResponse>
) {
  switch (req.method) {
    case 'GET':
      // Validate reportId in query params
      return withValidation(
        z.object({ reportId: z.string().min(1) }),
        handler,
        'query'
      )(req, res);
    
    case 'POST':
      // Apply both validation and claim prevention
      return withValidation(
        ClaimRequestSchema,
        withClaimPrevention(handler, {
          allowMultipleClaims: false,
          expireAfterDays: 365 // Claims expire after 1 year
        }),
        'body'
      )(req, res);
    
    case 'DELETE':
      // Simple handler without additional validation
      return handler(req, res);
    
    default:
      return handler(req, res);
  }
}
