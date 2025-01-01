import { NextApiRequest, NextApiResponse } from "next";

interface FollowUpDetails {
  date: string;
  technician: string;
  observations: string;
  actions: string[];
  equipmentUsed?: string[];
  moistureReadings?: {
    location: string;
    value: number;
  }[];
}

interface FollowUpRequest {
  jobNumber: string;
  followUpDetails: FollowUpDetails;
}

interface FollowUpResponse {
  message?: string;
  error?: string;
}

const validateFollowUpDetails = (details: FollowUpDetails): string[] => {
  const errors: string[] = [];

  if (!details.date) {
    errors.push("Visit date is required");
  }
  if (!details.technician) {
    errors.push("Technician name is required");
  }
  if (!details.observations) {
    errors.push("Observations are required");
  }
  if (!details.actions || details.actions.length === 0) {
    errors.push("At least one action must be specified");
  }

  // Validate moisture readings if provided
  if (details.moistureReadings?.length) {
    details.moistureReadings.forEach((reading, index) => {
      if (!reading.location) {
        errors.push(`Location is required for moisture reading ${index + 1}`);
      }
      if (typeof reading.value !== 'number' || reading.value < 0) {
        errors.push(`Invalid moisture value for reading ${index + 1}`);
      }
    });
  }

  return errors;
};

const handler = async (
  req: NextApiRequest, 
  res: NextApiResponse<FollowUpResponse>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, followUpDetails } = req.body as FollowUpRequest;

  if (!jobNumber || !followUpDetails) {
    return res.status(400).json({ 
      error: "Job number and follow-up details are required" 
    });
  }

  // Validate follow-up details
  const validationErrors = validateFollowUpDetails(followUpDetails);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: `Validation failed: ${validationErrors.join(", ")}` 
    });
  }

  try {
    // Here you would typically:
    // 1. Validate the job number exists
    // 2. Save the follow-up details to your database
    // 3. Update any related records
    // 4. Trigger any necessary notifications

    console.log(`Follow-up visit recorded for job ${jobNumber}:`, {
      date: followUpDetails.date,
      technician: followUpDetails.technician,
      observations: followUpDetails.observations,
      actions: followUpDetails.actions,
      equipmentUsed: followUpDetails.equipmentUsed || [],
      moistureReadings: followUpDetails.moistureReadings || []
    });

    res.status(200).json({ 
      message: "Follow-up visit recorded successfully" 
    });
  } catch (error) {
    console.error("Error recording follow-up visit:", error);
    res.status(500).json({ 
      error: "Failed to record follow-up visit" 
    });
  }
};

export default handler;
