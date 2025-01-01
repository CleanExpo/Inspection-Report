import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, validateAdminCredentials } from '../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const isValid = await validateAdminCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = await generateToken({
      userId: 'admin', // Since this is admin auth
      username,
      role: 'ADMIN'
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        username,
        role: 'ADMIN'
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
