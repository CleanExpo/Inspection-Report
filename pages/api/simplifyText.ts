import { NextApiRequest, NextApiResponse } from "next";
import { simplifyText } from "../../services/textSimplifier";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { text, level = 'basic' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: "Invalid request body. Expected { text: string, level?: 'basic' | 'detailed' }" 
      });
    }

    if (level !== 'basic' && level !== 'detailed') {
      return res.status(400).json({
        error: "Invalid simplification level. Expected 'basic' or 'detailed'"
      });
    }

    const simplified = simplifyText(text, level);

    res.status(200).json({ 
      success: true,
      original: text,
      simplified,
      level
    });
  } catch (error) {
    console.error('Error simplifying text:', error);
    res.status(500).json({ error: "Failed to simplify text" });
  }
}
