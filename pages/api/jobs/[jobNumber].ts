import { NextApiRequest, NextApiResponse } from "next";
import { validateJobNumber } from "../../../utils/validation";

interface JobDetails {
  jobNumber: string;
  status: 'open' | 'in-progress' | 'completed' | 'on-hold';
  technician: string;
  dateCreated: string;
  lastUpdated: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface JobResponse {
  job?: JobDetails;
  error?: string;
}

const handler = async (
  req: NextApiRequest, 
  res: NextApiResponse<JobResponse>
) => {
  const { jobNumber } = req.query;

  if (typeof jobNumber !== 'string') {
    return res.status(400).json({ 
      error: "Invalid job number format" 
    });
  }

  const validation = validateJobNumber(jobNumber);
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: validation.errors[0] 
    });
  }

  try {
    // Here you would typically:
    // 1. Query your database for the job details
    // 2. Handle any business logic
    // 3. Transform the data if needed

    // For now, return mock data
    const job: JobDetails = {
      jobNumber,
      status: 'in-progress',
      technician: 'John Smith',
      dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      lastUpdated: new Date().toISOString(),
      location: '123 Main St, Sydney NSW 2000',
      priority: 'high',
      notes: 'Initial inspection completed. Water damage detected in multiple rooms.'
    };

    res.status(200).json({ job });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ 
      error: "Failed to fetch job details" 
    });
  }
};

export default handler;
