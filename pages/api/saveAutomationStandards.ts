import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, standards, recommendations } = req.body;

  if (!jobNumber || !standards || !recommendations) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Simulate saving data to a database
    console.log(`Saving automation standards for job ${jobNumber}:`, {
      standards,
      recommendations,
    });

    res.status(200).json({ message: "Automation standards saved successfully" });
  } catch (error) {
    console.error("Error saving automation standards:", error);
    res.status(500).json({ error: "Failed to save automation standards" });
  }
};

export default handler;
