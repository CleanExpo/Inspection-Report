import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, consolidatedData } = req.body;

  if (!jobNumber || !consolidatedData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Simulate saving submission logs to a database
    console.log(`Submitting final report for job ${jobNumber}:`, consolidatedData);

    res.status(200).json({ message: "Final report submitted successfully" });
  } catch (error) {
    console.error("Error submitting final report:", error);
    res.status(500).json({ error: "Failed to submit final report" });
  }
};

export default handler;
