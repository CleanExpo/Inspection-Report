import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { endpoint } = req.query;
    const apiUrl = `https://crm.example.com/api/${Array.isArray(endpoint) ? endpoint.join('/') : endpoint}`;

    try {
        const response = await fetch(apiUrl, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            ...(req.method !== 'GET' && req.method !== 'HEAD' && {
                body: JSON.stringify(req.body)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        res.status(response.status).json(data);
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message || 'Failed to process request',
            endpoint: endpoint,
            method: req.method
        });
    }
}

export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
};
