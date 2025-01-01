import { NextApiRequest, NextApiResponse } from "next";
import type { ReportData } from "../../types/report";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { includeSops, includeGuidelines } = req.query;

  try {
    // Mock data - replace with actual database queries
    const reportData: ReportData = {
      jobDetails: { 
        jobNumber: "12345", 
        clientName: "John Doe" 
      },
      sops: includeSops === "true" ? [
        "1. Initial site inspection",
        "2. Document existing conditions",
        "3. Test electrical systems",
        "4. Verify safety measures"
      ] : [],
      guidelines: includeGuidelines === "true" ? [
        "Australian Building Code (ABC)",
        "AS/NZS 3000 - Electrical Installations",
        "AS/NZS 3500 - Plumbing and Drainage",
        "AS/NZS 3666 - Air-handling Systems"
      ] : []
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ 
      error: "Failed to fetch report data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export default handler;
