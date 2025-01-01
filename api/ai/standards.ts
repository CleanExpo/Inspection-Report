import { NextApiRequest, NextApiResponse } from 'next';
import { getIICRCStandards } from '../../utils/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { damageType } = req.query;

    if (!damageType || typeof damageType !== 'string') {
        return res.status(400).json({ error: 'Damage type is required' });
    }

    try {
        const standards = await getIICRCStandards(damageType);
        res.status(200).json(standards);
    } catch (error: any) {
        console.error('Standards lookup error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve standards information',
            details: error.message
        });
    }
}
