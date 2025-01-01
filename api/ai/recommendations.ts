import { NextApiRequest, NextApiResponse } from 'next';
import { getRecommendations } from '../../utils/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { inspectionDetails, currentConditions } = req.body;

    if (!inspectionDetails || !currentConditions) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['inspectionDetails', 'currentConditions']
        });
    }

    const requiredInspectionDetails = [
        'damageType',
        'propertyType',
        'affectedAreas'
    ];

    const missingDetails = requiredInspectionDetails.filter(
        field => !inspectionDetails[field]
    );

    if (missingDetails.length > 0) {
        return res.status(400).json({
            error: 'Missing inspection details',
            missingFields: missingDetails
        });
    }

    try {
        const recommendations = await getRecommendations(
            inspectionDetails,
            currentConditions
        );

        res.status(200).json({
            recommendations,
            metadata: {
                generatedAt: new Date().toISOString(),
                inspectionDetails,
                currentConditions
            }
        });
    } catch (error: any) {
        console.error('Recommendations generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate recommendations',
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
