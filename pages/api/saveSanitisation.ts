import { NextApiRequest, NextApiResponse } from "next";

interface SanitisationData {
  jobNumber: string;
  chemicalsUsed: string[];
  areasSanitised: string;
  isValidated?: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const validateSanitisationData = (data: any): data is SanitisationData => {
  return (
    typeof data.jobNumber === "string" &&
    Array.isArray(data.chemicalsUsed) &&
    data.chemicalsUsed.every((chemical: any) => typeof chemical === "string") &&
    typeof data.areasSanitised === "string" &&
    (data.isValidated === undefined || typeof data.isValidated === "boolean")
  );
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> => {
  // Method validation
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: `Method ${req.method} is not supported`,
    });
  }

  try {
    const data = req.body;

    // Data validation
    if (!validateSanitisationData(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: "Missing or invalid required fields",
      });
    }

    // Additional validation checks
    if (data.chemicalsUsed.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: "At least one chemical must be specified",
      });
    }

    if (data.areasSanitised.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: "Areas sanitised cannot be empty",
      });
    }

    // Log the sanitisation details
    console.log(`[Sanitisation] Saving details for job ${data.jobNumber}:`, {
      chemicalsUsed: data.chemicalsUsed,
      areasSanitised: data.areasSanitised,
      isValidated: data.isValidated,
      timestamp: new Date().toISOString(),
    });

    // Here you would typically save to a database
    // For now, we're just simulating a successful save

    return res.status(200).json({
      success: true,
      message: "Sanitisation details saved successfully",
      data: {
        jobNumber: data.jobNumber,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Sanitisation] Error saving details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Failed to save sanitisation details",
    });
  }
};

export default handler;
