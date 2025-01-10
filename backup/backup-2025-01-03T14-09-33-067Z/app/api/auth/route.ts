import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, generateToken } from '../../../utils/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    const isValid = await validateAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: '1',
      username,
      role: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
