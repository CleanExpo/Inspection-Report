import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { z } from 'zod';
import { ClaimSchema } from '../types/schemas';
import { createErrorResponse } from './validation';

type ClaimValidationOptions = {
  allowMultipleClaims?: boolean; // Default: false
  expireAfterDays?: number; // Default: never expire
  allowedClaimTypes?: string[]; // Default: all types
};

export async function validateClaim(
  reportId: string,
  claimType: string,
  options: ClaimValidationOptions = {}
) {
  const {
    allowMultipleClaims = false,
    expireAfterDays,
    allowedClaimTypes,
  } = options;

  // Check if claim type is allowed
  if (allowedClaimTypes && !allowedClaimTypes.includes(claimType)) {
    throw new Error(`Claim type '${claimType}' is not allowed for this report`);
  }

  // Find existing active claims for this report
  const existingClaims = await prisma.claim.findMany({
    where: {
      reportId,
      status: 'active',
    },
  });

  // If multiple claims aren't allowed and there's an active claim
  if (!allowMultipleClaims && existingClaims.length > 0) {
    throw new Error(
      `Report ${reportId} already has an active claim (${existingClaims[0].claimReference})`
    );
  }

  // Check for duplicate claim type if multiple claims are allowed
  if (allowMultipleClaims && existingClaims.some(claim => claim.claimType === claimType)) {
    throw new Error(
      `Report ${reportId} already has an active claim of type '${claimType}'`
    );
  }

  // Check for expired claims if expireAfterDays is set
  if (expireAfterDays) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - expireAfterDays);

    const expiredClaims = existingClaims.filter(claim => 
      new Date(claim.claimedAt) < expirationDate
    );

    // Automatically expire old claims
    if (expiredClaims.length > 0) {
      await prisma.claim.updateMany({
        where: {
          id: {
            in: expiredClaims.map(claim => claim.id)
          }
        },
        data: {
          status: 'expired'
        }
      });
    }
  }

  return true;
}

export function withClaimPrevention(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: ClaimValidationOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract reportId from request (could be in body, query, or params)
      const reportId = req.body?.reportId || req.query?.reportId;
      if (!reportId) {
        return res.status(400).json(
          createErrorResponse(400, 'Report ID is required')
        );
      }

      // Extract claim type from request
      const claimType = req.body?.claimType || req.query?.claimType;
      if (!claimType) {
        return res.status(400).json(
          createErrorResponse(400, 'Claim type is required')
        );
      }

      // Validate the claim
      try {
        await validateClaim(reportId, claimType, options);
      } catch (error) {
        return res.status(409).json(
          createErrorResponse(
            409,
            'Claim validation failed',
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
      }

      // If validation passes, proceed with the handler
      await handler(req, res);
    } catch (error) {
      console.error('Claim Prevention Error:', error);
      return res.status(500).json(
        createErrorResponse(
          500,
          'Internal server error during claim validation',
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  };
}

// Helper to create a new claim
export async function createClaim(
  data: z.infer<typeof ClaimSchema>
): Promise<void> {
  await prisma.claim.create({
    data: {
      ...data,
      claimedAt: new Date().toISOString(),
    },
  });
}

// Helper to revoke a claim
export async function revokeClaim(
  reportId: string,
  claimReference: string
): Promise<void> {
  await prisma.claim.updateMany({
    where: {
      reportId,
      claimReference,
      status: 'active',
    },
    data: {
      status: 'revoked',
    },
  });
}
