import { NextApiRequest, NextApiResponse } from 'next';
import { generateScopeOfWork } from '../../utils/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { damageType, propertyType, affectedAreas } = req.body;

    if (!damageType || !propertyType || !affectedAreas) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['damageType', 'propertyType', 'affectedAreas']
        });
    }

    try {
        const scope = await generateScopeOfWork(
            damageType,
            propertyType,
            Array.isArray(affectedAreas) ? affectedAreas : [affectedAreas]
        );

        res.status(200).json({
            scope,
            metadata: {
                generatedAt: new Date().toISOString(),
                damageType,
                propertyType,
                affectedAreas
            }
        });
    } catch (error: any) {
        console.error('Scope generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate scope of work',
            details: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb'
        }
    }
};
