import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, additionalWork, specializedTrades, completionTime } = req.body;

  if (!jobNumber || !additionalWork || !completionTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Simulate saving data to a database
    console.log(`Saving further works for job ${jobNumber}:`, {
      additionalWork,
      specializedTrades,
      completionTime,
    });

    res.status(200).json({ message: "Further works details saved successfully" });
  } catch (error) {
    console.error("Error saving further works details:", error);
    res.status(500).json({ error: "Failed to save further works details" });
  }
};

export default handler;
