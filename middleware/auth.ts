import { NextApiRequest, NextApiResponse } from 'next';
import { AuthError } from '../utils/errors';
import { AuthService, JWTPayload } from '../services/authService';

export interface AuthenticatedRequest extends NextApiRequest {
  user: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
  requiredRole?: string
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AuthError('No authorization token provided');
      }

      // Extract the token
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        throw new AuthError('Invalid authorization token');
      }

      // Verify the token and get user info
      const decoded = await AuthService.verifyToken(token);

      // Check role if required
      if (requiredRole) {
        const hasAccess = await AuthService.validateRole(decoded.userId, requiredRole);
        if (!hasAccess) {
          throw new AuthError('Insufficient permissions');
        }
      }

      // Add the user object to the request
      (req as AuthenticatedRequest).user = decoded;

      // Call the next handler
      return handler(req as AuthenticatedRequest, res);
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        return res.status(401).json({
          error: 'AuthenticationError',
          message: error.message,
        });
      }
      // Re-throw other errors to be handled by the global error handler
      throw error;
    }
  };
}

// Helper function to protect routes with specific roles
export function withRole(role: string) {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse>) => {
    return withAuth(handler, role);
  };
}

// Example usage:
// export default withAuth(handler); // Basic auth
// export default withRole('ADMIN')(handler); // Role-based auth
