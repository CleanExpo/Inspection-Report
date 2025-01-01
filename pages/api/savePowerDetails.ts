import type { NextApiRequest, NextApiResponse } from 'next';

type PowerDetails = {
  jobNumber: string;
  panelLocation: string;
  numCircuits: number;
  amperagePerCircuit: number;
  totalPowerCapacity: number;
  totalEquipmentPower: number;
  notes: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const powerDetails: PowerDetails = req.body;

    // Validate required fields
    if (!powerDetails.jobNumber || !powerDetails.panelLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Here you would typically save the data to your database
    // For now, we'll just simulate a successful save
    console.log('Saving power details:', powerDetails);

    // Simulate a brief delay to mimic database operation
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({
      message: 'Power details saved successfully',
      data: powerDetails
    });
  } catch (error) {
    console.error('Error saving power details:', error);
    return res.status(500).json({
      message: 'Error saving power details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
