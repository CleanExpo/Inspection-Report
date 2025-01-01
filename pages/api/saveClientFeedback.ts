import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobNumber, rating, comments, signature } = req.body;

  if (!jobNumber || !rating || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Simulate saving data to a database
    console.log(`Saving client feedback for job ${jobNumber}:`, {
      rating,
      comments,
      signature,
    });

    res.status(200).json({ message: "Client feedback saved successfully" });
  } catch (error) {
    console.error("Error saving client feedback:", error);
    res.status(500).json({ error: "Failed to save client feedback" });
  }
};

export default handler;
