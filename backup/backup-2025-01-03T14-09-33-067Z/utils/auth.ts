import { hash, compare } from 'bcrypt';
import * as jose from 'jose';

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface AuthToken {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export async function hashPassword(password: string): Promise<string> {
  try {
    return await hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Failed to verify password');
  }
}

export async function generateToken(payload: Omit<AuthToken, 'exp'>): Promise<string> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return await new jose.SignJWT({
      ...payload,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

export async function verifyToken(token: string): Promise<AuthToken> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Validate that payload has all required fields
    if (!payload.userId || !payload.username || !payload.role || !payload.exp) {
      throw new Error('Invalid token payload');
    }
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      exp: payload.exp as number
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}

export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    if (username !== ADMIN_CREDENTIALS.username) {
      return false;
    }

    // For development, use plain text comparison
    if (process.env.NODE_ENV === 'development') {
      return password === ADMIN_CREDENTIALS.password;
    }

    // For production, use hashed comparison
    const hashedPassword = await hashPassword(ADMIN_CREDENTIALS.password);
    return await verifyPassword(password, hashedPassword);
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    throw new Error('Failed to validate credentials');
  }
}

export function requireAuth(handler: Function) {
  return async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = await verifyToken(token);

      // Add user info to request
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  };
}
