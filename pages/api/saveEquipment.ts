import type { NextApiRequest, NextApiResponse } from 'next';

type Equipment = {
  type: string;
  quantity: number;
  placement: string;
  duration: number;
};

type RequestData = {
  jobNumber: string;
  equipmentList: Equipment[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { jobNumber, equipmentList } = req.body as RequestData;

    // TODO: Add actual database integration
    // For now, just log the data and return success
    console.log('Saving equipment recommendations:', {
      jobNumber,
      equipmentList,
    });

    return res.status(200).json({
      message: 'Equipment recommendations saved successfully',
      data: { jobNumber, equipmentList },
    });
  } catch (error) {
    console.error('Error saving equipment recommendations:', error);
    return res.status(500).json({
      message: 'Error saving equipment recommendations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
